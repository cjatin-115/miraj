import asyncio
import logging
from pathlib import Path
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from .cache import analysis_cache
from .media_ingest import media_ingest
from .transcriber import transcriber
from .audio_analyzer import audio_analyzer
from .video_analyzer import video_analyzer
from .script_analyzer import script_analyzer
from .duration_intelligence import duration_intelligence
from ...models import Project, Analysis

logger = logging.getLogger(__name__)

class AnalysisPipeline:
    def __init__(self):
        self.cache = analysis_cache
        self.ingest_service = media_ingest
        self.transcriber = transcriber
        self.audio_analyzer = audio_analyzer
        self.video_analyzer = video_analyzer
        self.script_analyzer = script_analyzer
        self.duration_service = duration_intelligence

    async def run(
        self,
        project_id: str,
        script_text: str,
        video_path: Optional[Path] = None,
        db: Optional[AsyncSession] = None,
        force_recompute: bool = False
    ) -> Dict[str, Any]:
        """
        Execute full media ingestion + analysis pipeline:
        Video + Script -> Cache Check -> Ingestion -> Transcription -> Audio Analysis -> Video Analysis -> Script Analysis -> Duration Intelligence
        """
        logger.info(f"Starting analysis pipeline for project {project_id} (video: {video_path})")

        # 1. Compute content hash
        content_hash = self.cache.compute_content_hash(video_path, script_text)

        # 2. Check cache
        if not force_recompute:
            cached = self.cache.get(content_hash)
            if cached is not None:
                logger.info(f"Reusing cached analysis result for hash {content_hash}")
                cached_copy = dict(cached)
                cached_copy["project_id"] = project_id
                if db:
                    await self._persist_analysis_record(db, project_id, cached_copy)
                return cached_copy

        # 3. Media Ingestion
        ingest_res = None
        audio_path_obj = None
        proxy_path_obj = None

        if video_path and video_path.exists():
            try:
                ingest_res = self.ingest_service.ingest(video_path, project_id)
                if ingest_res.get("audio_path"):
                    audio_path_obj = Path(ingest_res["audio_path"])
                if ingest_res.get("proxy_path"):
                    proxy_path_obj = Path(ingest_res["proxy_path"])
            except Exception as e:
                logger.error(f"Media ingestion failed for project {project_id}: {e}", exc_info=True)

        # 4. Concurrently execute independent analysis tasks
        video_target = proxy_path_obj if (proxy_path_obj and proxy_path_obj.exists()) else video_path
        script_word_count = len(script_text.split())

        async def _run_transcribe():
            try:
                return await asyncio.to_thread(self.transcriber.transcribe, audio_path_obj)
            except Exception as e:
                logger.error(f"Transcription failed: {e}", exc_info=True)
                return {"text": script_text, "words": [], "language": "en"}

        async def _run_audio():
            try:
                return await asyncio.to_thread(self.audio_analyzer.analyze, audio_path_obj, word_count=script_word_count)
            except Exception as e:
                logger.error(f"Audio analysis failed: {e}", exc_info=True)
                return {"has_audio": False, "speech_duration_seconds": 0.0}

        async def _run_video():
            if video_target and video_target.exists():
                try:
                    return await asyncio.to_thread(self.video_analyzer.analyze, video_target)
                except Exception as e:
                    logger.error(f"Video analysis failed: {e}", exc_info=True)
            return {
                "duration": 0.0,
                "face_detected_ratio": 0.0,
                "dominant_framing": "medium",
                "is_centered": True,
                "camera_stability": 1.0,
                "usable_segments": []
            }

        async def _run_script():
            try:
                return await asyncio.to_thread(self.script_analyzer.analyze, script_text)
            except Exception as e:
                logger.error(f"Script analysis failed: {e}", exc_info=True)
                return {}

        transcript_res, audio_res, video_analysis_res, script_res = await asyncio.gather(
            _run_transcribe(),
            _run_audio(),
            _run_video(),
            _run_script()
        )

        # 5. Duration Intelligence
        speech_dur = audio_res.get("speech_duration_seconds") if audio_res.get("has_audio") else None
        duration_res = self.duration_service.estimate_duration(
            script_text=script_text,
            audio_speech_duration=speech_dur
        )

        # 9. Assemble unified analysis payload
        payload = {
            "project_id": project_id,
            "content_hash": content_hash,
            "video_metadata": ingest_res.get("metadata") if ingest_res else None,
            "transcript": transcript_res,
            "audio_analysis": audio_res,
            "video_analysis": video_analysis_res,
            "script_analysis": script_res,
            "duration_intelligence": duration_res,
            "proxy_path": ingest_res.get("proxy_path") if ingest_res else None,
            "audio_path": ingest_res.get("audio_path") if ingest_res else None,
            "frames": ingest_res.get("frames", []) if ingest_res else []
        }

        # 10. Save to cache
        self.cache.set(content_hash, payload)

        # 11. Save to Database
        if db:
            await self._persist_analysis_record(db, project_id, payload)

        logger.info(f"Completed analysis pipeline for project {project_id} (hash: {content_hash})")
        return payload

    async def _persist_analysis_record(
        self,
        db: AsyncSession,
        project_id: str,
        payload: Dict[str, Any]
    ) -> None:
        """Persist or update Analysis record in the database."""
        try:
            stmt = select(Analysis).where(Analysis.project_id == project_id)
            res = await db.execute(stmt)
            analysis_rec = res.scalar_one_or_none()

            keywords = payload.get("script_analysis", {}).get("candidate_emphasis_words", [])

            if not analysis_rec:
                analysis_rec = Analysis(
                    project_id=project_id,
                    transcript_data=payload.get("transcript"),
                    visual_metrics=payload.get("video_analysis"),
                    keywords=keywords,
                    sentiment="neutral"
                )
                db.add(analysis_rec)
            else:
                analysis_rec.transcript_data = payload.get("transcript")
                analysis_rec.visual_metrics = payload.get("video_analysis")
                analysis_rec.keywords = keywords

            # Update project status if currently draft or processing
            proj_stmt = select(Project).where(Project.id == project_id)
            p_res = await db.execute(proj_stmt)
            project = p_res.scalar_one_or_none()
            if project and project.status in ["draft", "processing"]:
                project.status = "analyzed"

            await db.commit()
        except Exception as e:
            logger.error(f"Failed to persist analysis to DB for project {project_id}: {e}")
            await db.rollback()

analysis_pipeline = AnalysisPipeline()
