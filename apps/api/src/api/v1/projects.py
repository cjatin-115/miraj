from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, BackgroundTasks, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_db
from ...services.project_service import project_service
from ...services.job_service import job_service
from ...services.pipeline_coordinator import run_full_pipeline
from ...schemas.project import ProjectResponse, ProjectListResponse

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    script_text: str = Form(..., description="The user's talking-head script"),
    title: Optional[str] = Form(None, description="Optional title for the project"),
    description: Optional[str] = Form(None, description="Optional notes"),
    style_id: str = Form("modern_creator_v1", description="Style preset identifier"),
    video: Optional[UploadFile] = File(None, description="Webcam video recording file"),
    db: AsyncSession = Depends(get_db)
):
    if not script_text.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Script text cannot be empty."
        )

    video_bytes = None
    filename = None
    if video:
        filename = video.filename or "webcam.mp4"
        video_bytes = await video.read()

    project = await project_service.create_project(
        db=db,
        script_text=script_text,
        title=title,
        description=description,
        style_id=style_id,
        video_filename=filename,
        video_file=video_bytes
    )

    return project

@router.get("", response_model=ProjectListResponse)
async def list_projects(
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    projects = await project_service.list_projects(db=db, limit=limit, offset=offset)
    return ProjectListResponse(projects=projects, total=len(projects))

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    db: AsyncSession = Depends(get_db)
):
    project = await project_service.get_project(db=db, project_id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID '{project_id}' not found."
        )
    return project

@router.post("/{project_id}/start-pipeline", status_code=status.HTTP_202_ACCEPTED)
async def start_pipeline(
    project_id: str,
    background_tasks: BackgroundTasks,
    target_duration: Optional[float] = Query(None, description="Target duration in seconds"),
    sync: bool = Query(False, description="Run synchronously for integration tests"),
    db: AsyncSession = Depends(get_db)
):
    project = await project_service.get_project(db=db, project_id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project '{project_id}' not found."
        )

    # Queue an end-to-end pipeline job
    job = await job_service.create_job(
        db=db,
        project_id=project_id,
        job_type="pipeline",
        stage_message="Queued for full end-to-end video pipeline",
        payload={
            "project_id": project_id,
            "style_id": project.style_id,
            "target_duration": target_duration
        }
    )

    project.status = "processing"
    await db.commit()

    if sync:
        res = await run_full_pipeline(
            project_id=project_id,
            job_id=job.id,
            target_duration=target_duration,
            db=db
        )
        return {
            "message": "Pipeline completed",
            "job_id": job.id,
            "status": res.get("status", "completed"),
            "result": res
        }
    else:
        background_tasks.add_task(
            run_full_pipeline,
            project_id=project_id,
            job_id=job.id,
            target_duration=target_duration
        )
        return {
            "message": "Pipeline initiated",
            "job_id": job.id,
            "status": "queued"
        }

