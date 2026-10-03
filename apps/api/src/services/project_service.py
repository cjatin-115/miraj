import re
import logging
from typing import Optional, List, BinaryIO, Union
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ..models import Project, Script, SourceVideo
from ..core.media import media_env
from .storage_service import storage_service
from .job_service import job_service

logger = logging.getLogger(__name__)

class ProjectService:
    @staticmethod
    def _calculate_script_stats(raw_text: str):
        words = re.findall(r'\b\w+\b', raw_text.strip())
        word_count = len(words)
        # Average creator speaking rate: ~150 words per minute (~2.5 words/second)
        estimated_duration = max(3.0, round(word_count / 2.5, 2))
        return word_count, estimated_duration

    async def create_project(
        self,
        db: AsyncSession,
        script_text: str,
        title: Optional[str] = None,
        description: Optional[str] = None,
        style_id: str = "modern_creator_v1",
        video_filename: Optional[str] = None,
        video_file: Optional[Union[bytes, BinaryIO]] = None
    ) -> Project:
        word_count, estimated_duration = self._calculate_script_stats(script_text)

        # Derive title from script if not provided
        derived_title = title
        if not derived_title or not derived_title.strip():
            first_sentence = script_text.strip().split("\n")[0][:45]
            derived_title = first_sentence if first_sentence else "Untitled Miraaj Project"

        project = Project(
            title=derived_title,
            description=description,
            status="draft",
            style_id=style_id
        )
        db.add(project)
        await db.flush()

        # Create Script record
        script = Script(
            project_id=project.id,
            raw_text=script_text.strip(),
            word_count=word_count,
            estimated_duration_seconds=estimated_duration,
            language="en"
        )
        db.add(script)

        # If video is provided, ingest and probe
        if video_filename and video_file:
            storage_path = storage_service.store_project_file(
                project_id=project.id,
                filename=video_filename,
                file_content=video_file,
                subfolder="webcam"
            )
            abs_path = storage_service.get_absolute_path(storage_path)

            width = 1080
            height = 1920
            fps = 30.0
            duration = estimated_duration
            fmt = "mp4"
            has_audio = True
            file_size = 0

            try:
                file_size = abs_path.stat().st_size
                if media_env.is_valid:
                    meta = media_env.probe_video(str(abs_path))
                    width = meta.get("width", 1080)
                    height = meta.get("height", 1920)
                    fps = meta.get("fps", 30.0)
                    duration = meta.get("duration", estimated_duration)
                    fmt = meta.get("format", "mp4")
                    has_audio = meta.get("has_audio", True)
            except Exception as e:
                logger.warning(f"Could not probe video {abs_path}: {e}")

            source_video = SourceVideo(
                project_id=project.id,
                filename=video_filename,
                storage_path=storage_path,
                duration_seconds=duration,
                width=width,
                height=height,
                fps=fps,
                format=fmt,
                file_size_bytes=file_size,
                has_audio=has_audio
            )
            db.add(source_video)
            project.status = "processing"

            # Create Ingestion & Pipeline Job
            await job_service.create_job(
                db=db,
                project_id=project.id,
                job_type="ingest",
                stage_message="Ingested video and script. Pipeline queued.",
                payload={
                    "video_path": storage_path,
                    "duration": duration,
                    "script_words": word_count
                }
            )

        await db.commit()
        return await self.get_project(db, project.id)

    async def get_project(self, db: AsyncSession, project_id: str) -> Optional[Project]:
        query = (
            select(Project)
            .where(Project.id == project_id)
            .options(
                selectinload(Project.source_video),
                selectinload(Project.script),
                selectinload(Project.analysis),
                selectinload(Project.edit_plan),
                selectinload(Project.timeline),
                selectinload(Project.jobs),
                selectinload(Project.render_jobs)
            )
        )
        res = await db.execute(query)
        return res.scalar_one_or_none()

    async def list_projects(
        self,
        db: AsyncSession,
        limit: int = 50,
        offset: int = 0
    ) -> List[Project]:
        query = (
            select(Project)
            .options(
                selectinload(Project.source_video),
                selectinload(Project.script),
                selectinload(Project.analysis),
                selectinload(Project.edit_plan),
                selectinload(Project.timeline),
                selectinload(Project.jobs),
                selectinload(Project.render_jobs)
            )
            .order_by(Project.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        res = await db.execute(query)
        return list(res.scalars().all())

project_service = ProjectService()
