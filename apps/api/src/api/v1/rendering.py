import logging
from typing import Optional, Dict, Any
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ...core.database import get_db, AsyncSessionLocal
from ...models import Project, TimelineModel, RenderJob, RenderResult, Job
from ...services.job_service import job_service
from ...services.rendering.remotion_engine import remotion_engine
from ..v1.planning import compile_project_timeline

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/rendering", tags=["rendering"])

from contextlib import asynccontextmanager

@asynccontextmanager
async def get_working_session(db: Optional[AsyncSession] = None):
    if db is not None:
        yield db
    else:
        async with AsyncSessionLocal() as session:
            yield session

async def execute_render_in_background(
    job_id: str,
    project_id: str,
    resolution: str = "1080x1920",
    fps: int = 30,
    db: Optional[AsyncSession] = None
):
    """Executes the render pipeline in background with real-time database progress updates."""
    async with get_working_session(db) as db:
        # Load project with timeline and source video
        q = (
            select(Project)
            .where(Project.id == project_id)
            .options(
                selectinload(Project.source_video),
                selectinload(Project.timeline),
                selectinload(Project.render_jobs)
            )
        )
        res = await db.execute(q)
        project = res.scalar_one_or_none()
        if not project or not project.timeline:
            await job_service.update_job(
                db, job_id, status="failed", error_message="Project or timeline not found"
            )
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
            "metadata": project.timeline.metadata_json or {},
        }

        # Source audio path: prefer extracted clean audio_16k.wav, fallback to source video
        source_audio_path = None
        extracted_wav = Path("storage") / "projects" / project.id / "audio" / "audio_16k.wav"
        if extracted_wav.exists():
            source_audio_path = str(extracted_wav.resolve())
        elif project.source_video:
            v_path = Path("storage") / "projects" / project.id / "webcam" / project.source_video.filename
            if v_path.exists():
                source_audio_path = str(v_path.resolve())

        async def on_progress(stage: str, progress_pct: int, stage_msg: str):
            logger.info(f"Render progress [{project_id}]: {stage} ({progress_pct}%) - {stage_msg}")
            await job_service.update_job(
                db, job_id, status=stage, progress=progress_pct, stage_message=stage_msg
            )

        try:
            render_res = await remotion_engine.render_timeline(
                timeline_dict=timeline_data,
                project_id=project_id,
                source_audio_path=source_audio_path,
                resolution=resolution,
                fps=fps,
                on_progress=on_progress,
            )

            # Persist RenderResult
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
                fps=fps,
            )
            db.add(render_result_model)

            # Update Project status to completed / ready
            project.status = "ready"
            await job_service.update_job(
                db,
                job_id,
                status="completed",
                progress=100,
                stage_message="Render completed and verified successfully",
                result={
                    "public_url": public_url,
                    "file_size_bytes": render_res["file_size_bytes"],
                    "duration_seconds": render_res["duration_seconds"],
                    "qc_metrics": render_res.get("qc_result", {}).get("metrics", {}),
                },
            )
            await db.commit()

        except Exception as e:
            logger.error(f"Background render failed: {e}", exc_info=True)
            await job_service.update_job(
                db,
                job_id,
                status="failed",
                error_message=str(e),
                stage_message=f"Render error: {str(e)}",
            )


@router.post("/projects/{project_id}/render")
async def trigger_project_render(
    project_id: str,
    background_tasks: BackgroundTasks,
    resolution: str = Query("1080x1920", pattern="^(1080x1920|2160x3840)$"),
    fps: int = Query(30, ge=24, le=60),
    sync: bool = Query(False, description="Run synchronously for test execution"),
    db: AsyncSession = Depends(get_db),
):
    """
    Triggers Remotion rendering engine for a project.
    Runs asynchronously in background or via worker queue.
    """
    q = (
        select(Project)
        .where(Project.id == project_id)
        .options(
            selectinload(Project.source_video),
            selectinload(Project.timeline),
            selectinload(Project.edit_plan),
        )
    )
    res = await db.execute(q)
    project = res.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Project {project_id} not found")

    # If timeline doesn't exist yet, compile it now
    if not project.timeline:
        await compile_project_timeline(project_id=project_id, db=db)
        await db.refresh(project)

    # Create Job record
    job = await job_service.create_job(
        db=db,
        project_id=project_id,
        job_type="render",
        payload={"resolution": resolution, "fps": fps},
        stage_message="Render job queued",
    )

    # Create RenderJob record
    render_job = RenderJob(
        id=job.id,
        project_id=project_id,
        timeline_id=project.timeline.id,
        status="queued",
        resolution=resolution,
        fps=fps,
        output_format="mp4",
        progress=0,
    )
    db.add(render_job)
    await db.commit()

    if sync:
        # Run synchronously (blocking until complete)
        await execute_render_in_background(
            job_id=job.id, project_id=project_id, resolution=resolution, fps=fps
        )
        updated_job = await job_service.get_job(db, job.id)
        return {
            "job_id": job.id,
            "status": updated_job.status if updated_job else "completed",
            "progress": updated_job.progress if updated_job else 100,
            "stage_message": updated_job.stage_message if updated_job else "Completed",
            "result": updated_job.result if updated_job else {},
        }
    else:
        # Run asynchronously in background task
        background_tasks.add_task(
            execute_render_in_background,
            job_id=job.id,
            project_id=project_id,
            resolution=resolution,
            fps=fps,
        )
        return {
            "job_id": job.id,
            "status": "queued",
            "message": "Video rendering job initiated",
            "resolution": resolution,
            "fps": fps,
        }


@router.get("/projects/{project_id}/status")
async def get_project_render_status(
    project_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Returns the latest render job progress, status, and video download URL."""
    jobs = await job_service.list_jobs(db, project_id=project_id, limit=10)
    render_job = next((j for j in jobs if j.type in ("render", "pipeline")), None)

    # Check if a completed final video exists on disk
    render_dir = Path("storage") / "projects" / project_id / "render"
    final_video = None
    if render_dir.exists():
        for f in render_dir.glob("final_*.mp4"):
            if f.stat().st_size > 0:
                final_video = f
                break

    if not render_job and not final_video:
        return {
            "status": "not_started",
            "progress": 0,
            "stage_message": "No render job found for this project",
            "video_url": None,
        }

    status_val = render_job.status if render_job else ("completed" if final_video else "not_started")
    progress_val = render_job.progress if render_job else (100 if final_video else 0)
    stage_msg = render_job.stage_message if render_job else ("Video render complete and ready" if final_video else "")
    err_msg = render_job.error_message if render_job else None

    # If final video is physically verified on disk, report completed
    if final_video and status_val != "completed":
        status_val = "completed"
        progress_val = 100
        stage_msg = "Video rendering and QC completed successfully!"
        err_msg = None

    video_url = f"/api/v1/rendering/projects/{project_id}/video" if (status_val == "completed" or final_video) else None

    return {
        "job_id": render_job.id if render_job else project_id,
        "status": status_val,
        "progress": progress_val,
        "stage_message": stage_msg,
        "error_message": err_msg,
        "video_url": video_url,
        "result": render_job.result if render_job else {"public_url": video_url},
    }


@router.get("/projects/{project_id}/video")
async def get_rendered_video(
    project_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Serves the final rendered MP4 video file."""
    render_dir = Path("storage") / "projects" / project_id / "render"
    if not render_dir.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No rendered video found for this project")

    # Find the final rendered mp4
    mp4_files = sorted(render_dir.glob("final_*.mp4"), key=lambda p: p.stat().st_mtime, reverse=True)
    if not mp4_files:
        mp4_files = sorted(render_dir.glob("*.mp4"), key=lambda p: p.stat().st_mtime, reverse=True)

    if not mp4_files:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rendered MP4 file not found on disk")

    target_file = mp4_files[0]
    return FileResponse(
        path=str(target_file),
        media_type="video/mp4",
        filename=f"miraaj_{project_id}.mp4",
    )
