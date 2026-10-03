import asyncio
import logging
import traceback
import sys
from pathlib import Path
from typing import Optional, Dict, Any

# Ensure project root & worker dir are in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
WORKER_DIR = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))
if str(WORKER_DIR) not in sys.path:
    sys.path.insert(0, str(WORKER_DIR))

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from apps.api.src.core.database import AsyncSessionLocal, init_db
from apps.api.src.core.redis import get_redis_client
from apps.api.src.models import Project, Job, Analysis, EditPlan, TimelineModel, RenderJob, RenderResult
from apps.api.src.services.job_service import job_service
from src.tasks.ingest import run_ingest_task
from src.tasks.analyze import run_analyze_task
from src.tasks.plan import run_plan_task
from src.tasks.timeline import run_compile_timeline_task
from src.tasks.render import run_render_task

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] [worker]: %(message)s")
logger = logging.getLogger("worker")

async def process_render_job(job_id: str, project_id: str, payload: dict, session_factory=None):
    """Executes a dedicated Remotion render job."""
    logger.info(f"Worker starting render job {job_id} for project {project_id}")
    factory = session_factory or AsyncSessionLocal
    resolution = payload.get("resolution", "1080x1920")
    fps = int(payload.get("fps", 30))

    async with factory() as db:
        q = (
            select(Project)
            .where(Project.id == project_id)
            .options(
                selectinload(Project.source_video),
                selectinload(Project.timeline)
            )
        )
        res = await db.execute(q)
        project = res.scalar_one_or_none()
        if not project or not project.timeline:
            await job_service.update_job(db, job_id, status="failed", error_message="Project or timeline not found")
            return

        timeline_data = {
            "version": project.timeline.version,
            "width": project.timeline.width,
            "height": project.timeline.height,
            "fps": project.timeline.fps,
            "durationInFrames": project.timeline.duration_in_frames,
            "styleId": project.timeline.style_id,
            "scenes": project.timeline.scenes or [],
            "audioTracks": project.timeline.audio_tracks or [],
            "overlays": project.timeline.overlays or [],
            "metadata": project.timeline.metadata_json or {}
        }

        source_audio_path = None
        if project.source_video:
            v_path = PROJECT_ROOT / "storage" / "projects" / project.id / "webcam" / project.source_video.filename
            if v_path.exists():
                source_audio_path = str(v_path.resolve())

        async def on_progress(stage: str, progress_pct: int, stage_msg: str):
            logger.info(f"Render progress [{project_id}]: {stage} ({progress_pct}%) - {stage_msg}")
            await job_service.update_job(
                db, job_id, status=stage, progress=progress_pct, stage_message=stage_msg
            )

        try:
            render_res = await run_render_task(
                project_id=project_id,
                timeline_dict=timeline_data,
                source_audio_path=source_audio_path,
                resolution=resolution,
                fps=fps,
                on_progress=on_progress
            )

            rel_storage_path = f"projects/{project_id}/render/{Path(render_res['output_path']).name}"
            public_url = f"/api/v1/rendering/projects/{project_id}/video"

            render_result_model = RenderResult(
                render_job_id=job_id,
                storage_path=rel_storage_path,
                public_url=public_url,
                duration_seconds=render_res["duration_seconds"],
                file_size_bytes=render_res["file_size_bytes"],
                width=int(resolution.split("x")[0]),
                height=int(resolution.split("x")[1]),
                fps=fps
            )
            db.add(render_result_model)

            project.status = "ready"
            await job_service.update_job(
                db, job_id,
                status="completed",
                progress=100,
                stage_message="Render completed and verified successfully",
                result={
                    "public_url": public_url,
                    "file_size_bytes": render_res["file_size_bytes"],
                    "duration_seconds": render_res["duration_seconds"],
                    "qc_metrics": render_res.get("qc_result", {}).get("metrics", {})
                }
            )
            await db.commit()
            logger.info(f"Render job {job_id} completed successfully for project {project_id}!")

        except Exception as e:
            await db.rollback()
            logger.error(f"Render job {job_id} failed: {e}\n{traceback.format_exc()}")
            await job_service.update_job(
                db, job_id,
                status="failed",
                error_message=str(e),
                stage_message=f"Render error: {str(e)}"
            )

async def process_project_pipeline(job_id: str, project_id: str, session_factory=None):
    """Executes the complete core pipeline stages for a project."""
    logger.info(f"Starting pipeline for project {project_id} (job {job_id})")
    factory = session_factory or AsyncSessionLocal

    async with factory() as db:
        q = (
            select(Project)
            .where(Project.id == project_id)
            .options(
                selectinload(Project.source_video),
                selectinload(Project.script),
                selectinload(Project.analysis),
                selectinload(Project.edit_plan),
                selectinload(Project.timeline)
            )
        )
        res = await db.execute(q)
        project = res.scalar_one_or_none()
        if not project:
            logger.error(f"Project {project_id} not found.")
            await job_service.update_job(db, job_id, status="failed", error_message="Project not found")
            return

        try:
            # Stage 1: Media Ingest
            await job_service.update_job(db, job_id, status="processing", progress=15, stage_message="Ingesting media assets")
            video_meta = {}
            if project.source_video:
                ingest_res = await run_ingest_task({
                    "video_path": project.source_video.storage_path,
                    "project_id": project.id
                })
                video_meta = ingest_res.get("metadata", {})

            # Stage 2: Script Analysis
            await job_service.update_job(db, job_id, progress=35, stage_message="Analyzing script and keywords")
            script_text = project.script.raw_text if project.script else "Untitled video"
            analysis_dict = await run_analyze_task(script_text)

            # Persist Analysis
            analysis = Analysis(
                project_id=project.id,
                keywords=analysis_dict.get("keywords", []),
                transcript_data={"full_text": script_text, "summary": analysis_dict.get("summary", "")},
                sentiment="confident"
            )
            db.add(analysis)
            await db.flush()

            # Stage 3: AI Director Edit Plan
            await job_service.update_job(db, job_id, progress=55, stage_message="AI Director: Generating edit plan")
            edit_plan_dict = await run_plan_task(
                script_text=script_text,
                analysis_dict=analysis_dict,
                video_metadata=video_meta,
                style_id=project.style_id
            )

            # Persist EditPlan
            edit_plan = EditPlan(
                project_id=project.id,
                plan_version=1,
                pacing=edit_plan_dict.get("pacing", "balanced"),
                rationale=edit_plan_dict.get("rationale", ""),
                scenes=edit_plan_dict.get("scenes", []),
                estimated_duration_seconds=edit_plan_dict.get("estimated_duration_seconds", 10.0)
            )
            db.add(edit_plan)
            await db.flush()

            # Stage 4: Timeline Generation
            await job_service.update_job(db, job_id, progress=75, stage_message="Generating deterministic Timeline JSON")
            source_url = f"/api/v1/storage/{project.source_video.storage_path}" if project.source_video else ""
            timeline_dict = await run_compile_timeline_task(
                project_id=project.id,
                edit_plan_dict=edit_plan_dict,
                video_url=source_url,
                style_id=project.style_id
            )

            # Persist Timeline
            timeline = TimelineModel(
                project_id=project.id,
                version=1,
                width=timeline_dict.get("width", 1080),
                height=timeline_dict.get("height", 1920),
                fps=timeline_dict.get("fps", 30),
                duration_in_frames=timeline_dict.get("durationInFrames", 300),
                style_id=timeline_dict.get("styleId", project.style_id),
                scenes=timeline_dict.get("scenes", []),
                audio_tracks=timeline_dict.get("audioTracks", []),
                overlays=timeline_dict.get("overlays", []),
                metadata_json=timeline_dict.get("metadata", {})
            )
            db.add(timeline)
            project.status = "ready"

            # Complete Job
            await job_service.update_job(
                db,
                job_id,
                status="completed",
                progress=100,
                stage_message="Pipeline execution completed. Timeline ready for Remotion.",
                result={"timeline_id": timeline.id, "scenes_count": len(timeline.scenes)}
            )
            await db.commit()
            logger.info(f"Pipeline completed successfully for project {project_id}!")

        except Exception as e:
            await db.rollback()
            logger.error(f"Pipeline failed for project {project_id}: {e}\n{traceback.format_exc()}")
            await job_service.update_job(
                db,
                job_id,
                status="failed",
                error_message=str(e),
                stage_message=f"Pipeline error: {str(e)}"
            )

async def worker_loop():
    logger.info("Initializing database for worker...")
    await init_db()
    logger.info("Miraaj Video Worker listening for Redis queue tasks...")
    redis_client = get_redis_client()

    while True:
        try:
            item = await redis_client.brpop("miraaj:video_jobs", timeout=2)
            if item:
                _, job_id = item
                job_data = await redis_client.hgetall(f"miraaj:job:{job_id}")
                project_id = job_data.get("project_id")
                job_type = job_data.get("type", "pipeline")
                if project_id:
                    if job_type == "render":
                        await process_render_job(job_id, project_id, job_data)
                    else:
                        await process_project_pipeline(job_id, project_id)
        except Exception as e:
            logger.warning(f"Worker queue polling exception: {e}")
            await asyncio.sleep(2)

if __name__ == "__main__":
    asyncio.run(worker_loop())
