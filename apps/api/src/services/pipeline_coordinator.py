import logging
from typing import Optional, Dict, Any
from pathlib import Path
from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ..core.database import AsyncSessionLocal
from ..models import Project, RenderJob, TimelineModel
from .job_service import job_service
from .storage_service import storage_service
from .analysis.pipeline import analysis_pipeline

logger = logging.getLogger(__name__)

@asynccontextmanager
async def get_working_session(db: Optional[AsyncSession] = None):
    if db is not None:
        yield db
    else:
        async with AsyncSessionLocal() as session:
            yield session

async def run_full_pipeline(
    project_id: str,
    job_id: str,
    target_duration: Optional[float] = None,
    resolution: str = "1080x1920",
    fps: int = 30,
    db: Optional[AsyncSession] = None
) -> Dict[str, Any]:
    # Lazy imports to prevent circular dependency with API routers
    from ..api.v1.planning import generate_project_plan, compile_project_timeline
    from ..api.v1.rendering import execute_render_in_background
    """
    Executes the complete 20-step Miraaj V1 video generation pipeline:
    1. Upload / Project Ingest
    2. Media Ingestion (Proxy + WAV + Frames)
    3. Video & Face Analysis (Framing, stability, usable segments)
    4. Audio Acoustics & Silence Analysis
    5. Whisper Transcription (Word-level timestamps)
    6. Script Analysis (Keywords, moments, sentiment)
    7. Duration Estimation & Target Duration Selection
    8. AI Director EditPlan Formulation & Quality Rules
    9. EditPlan JSON Schema Validation & Structured Repair
    10. Remotion Timeline Engine Compilation
    11. Visual Asset Resolution & Props Mapping
    12. Deterministic Headless Remotion Render (1080x1920 @ 30 FPS)
    13. Master Speech Audio Extraction & Alignment
    14. FFmpeg Stream Post-Processing & Lossless Mux
    15. Quality Control Verification (Black frames, drift, resolution)
    16. Final Export MP4 Preparation
    """
    logger.info(f"Starting full pipeline for project {project_id} (job: {job_id})")

    async with get_working_session(db) as session:
        try:
            # Load project with relations
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
            res = await session.execute(q)
            project = res.scalar_one_or_none()
            if not project:
                raise ValueError(f"Project '{project_id}' not found")

            # Mark status
            project.status = "processing"
            await session.commit()

            # -------------------------------------------------------------
            # STEP 1: Media Ingestion & Comprehensive Analysis
            # -------------------------------------------------------------
            await job_service.update_job(
                session,
                job_id,
                status="analyzing",
                progress=15,
                stage_message="Ingesting media, extracting acoustics, transcribing speech..."
            )

            video_abs_path = None
            if project.source_video:
                video_abs_path = storage_service.get_absolute_path(project.source_video.storage_path)

            script_text = project.script.raw_text if project.script else "Welcome to Miraaj video production."

            analysis_result = await analysis_pipeline.run(
                project_id=project_id,
                script_text=script_text,
                video_path=video_abs_path,
                db=session,
                force_recompute=True
            )
            logger.info(f"Pipeline step 1 (Analysis) completed for project {project_id}")

            # -------------------------------------------------------------
            # STEP 2: AI Director EditPlan Formulation
            # -------------------------------------------------------------
            await job_service.update_job(
                session,
                job_id,
                status="planning",
                progress=40,
                stage_message="AI Director formulating structured EditPlan..."
            )

            effective_duration = target_duration
            if not effective_duration:
                dur_intel = analysis_result.get("duration_intelligence", {})
                effective_duration = float(dur_intel.get("recommended_duration") or 60.0)

            edit_plan = await generate_project_plan(
                project_id=project_id,
                target_duration=effective_duration,
                db=session
            )
            logger.info(f"Pipeline step 2 (AI Director) completed for project {project_id} ({len(edit_plan.scenes)} scenes)")

            # -------------------------------------------------------------
            # STEP 3: Timeline Compilation & Asset Generation
            # -------------------------------------------------------------
            await job_service.update_job(
                session,
                job_id,
                status="compiling",
                progress=60,
                stage_message="Compiling Remotion timeline and visual assets..."
            )

            timeline = await compile_project_timeline(project_id=project_id, db=session)
            logger.info(f"Pipeline step 3 (Timeline) completed for project {project_id} ({timeline.durationInFrames} frames)")

            # -------------------------------------------------------------
            # STEP 4: Remotion Render + Audio Muxing + Quality Control
            # -------------------------------------------------------------
            # Check or create RenderJob
            tl_stmt = select(TimelineModel).where(TimelineModel.project_id == project_id)
            tl_res = await session.execute(tl_stmt)
            tl_record = tl_res.scalar_one_or_none()
            timeline_id = tl_record.id if tl_record else project_id

            rj_stmt = select(RenderJob).where(RenderJob.id == job_id)
            rj_res = await session.execute(rj_stmt)
            existing_rj = rj_res.scalar_one_or_none()
            if not existing_rj:
                render_job = RenderJob(
                    id=job_id,
                    project_id=project_id,
                    timeline_id=timeline_id,
                    status="rendering",
                    resolution=resolution,
                    fps=fps,
                    output_format="mp4",
                    progress=65
                )
                session.add(render_job)
                await session.commit()

            await job_service.update_job(
                session,
                job_id,
                status="rendering",
                progress=65,
                stage_message="Starting headless Remotion WebGL renderer..."
            )

            # Render step with same active session
            await execute_render_in_background(
                job_id=job_id,
                project_id=project_id,
                resolution=resolution,
                fps=fps,
                db=session
            )
            return {"status": "completed", "project_id": project_id, "job_id": job_id}

        except Exception as e:
            logger.error(f"Full pipeline failed for project {project_id}: {e}", exc_info=True)
            await job_service.update_job(
                session,
                job_id,
                status="failed",
                error_message=str(e),
                stage_message=f"Pipeline error: {str(e)}"
            )
            return {"status": "failed", "error": str(e)}
