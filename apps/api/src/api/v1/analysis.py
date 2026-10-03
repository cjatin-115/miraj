import logging
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ...core.database import get_db
from ...models import Project, SourceVideo, Script, Analysis
from ...services.storage_service import storage_service
from ...services.analysis.duration_intelligence import duration_intelligence
from ...services.analysis.pipeline import analysis_pipeline
from ...schemas.analysis import (
    DurationEstimateRequest,
    DurationEstimateResponse,
    DurationValidationRequest,
    DurationValidationResponse,
    AnalyzeProjectRequest,
    AnalysisDetailResponse
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analysis", tags=["analysis"])

@router.post("/estimate-duration", response_model=DurationEstimateResponse)
async def estimate_duration(request: DurationEstimateRequest):
    """
    Calculate duration intelligence bounds and recommendations for a given script text.
    Returns estimated min/max, recommended duration, and confidence.
    """
    res = duration_intelligence.estimate_duration(
        script_text=request.script_text,
        audio_speech_duration=request.audio_speech_duration
    )
    return res

@router.post("/validate-duration", response_model=DurationValidationResponse)
async def validate_duration(request: DurationValidationRequest):
    """
    Validate requested target duration against script capacity.
    Flags when script is too short or too long for target duration.
    """
    if request.estimated_max_duration is not None and request.estimated_min_duration is not None:
        estimate_info = {
            "estimated_min_duration": request.estimated_min_duration,
            "estimated_max_duration": request.estimated_max_duration,
            "recommended_duration": request.recommended_duration or request.estimated_min_duration,
            "word_count": len(request.script_text.split()) if request.script_text else 0
        }
    elif request.script_text:
        estimate_info = duration_intelligence.estimate_duration(request.script_text)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must provide either script_text or duration bounds."
        )

    res = duration_intelligence.validate_target_duration(
        target_duration=request.target_duration,
        estimate_info=estimate_info
    )
    return res

@router.post("/projects/{project_id}/analyze", response_model=AnalysisDetailResponse)
async def analyze_project(
    project_id: str,
    request: AnalyzeProjectRequest = AnalyzeProjectRequest(),
    db: AsyncSession = Depends(get_db)
):
    """
    Execute full ingestion and analysis pipeline on a project's uploaded video and script.
    Caches results by content hash to prevent redundant execution.
    """
    query = (
        select(Project)
        .where(Project.id == project_id)
        .options(
            selectinload(Project.source_video),
            selectinload(Project.script),
            selectinload(Project.analysis)
        )
    )
    res = await db.execute(query)
    project = res.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Project {project_id} not found")

    script_text = project.script.raw_text if project.script else ""
    video_path = None
    if project.source_video and project.source_video.storage_path:
        video_path = storage_service.get_absolute_path(project.source_video.storage_path)

    try:
        analysis_data = await analysis_pipeline.run(
            project_id=project_id,
            script_text=script_text,
            video_path=video_path,
            db=db,
            force_recompute=request.force_recompute
        )
        return analysis_data
    except Exception as e:
        logger.error(f"Analysis pipeline execution failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis pipeline failed: {str(e)}"
        )

@router.get("/projects/{project_id}/analysis", response_model=AnalysisDetailResponse)
async def get_project_analysis(
    project_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get latest analysis result for a project. If not yet run, automatically runs analysis.
    """
    query = (
        select(Project)
        .where(Project.id == project_id)
        .options(
            selectinload(Project.source_video),
            selectinload(Project.script),
            selectinload(Project.analysis)
        )
    )
    res = await db.execute(query)
    project = res.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Project {project_id} not found")

    script_text = project.script.raw_text if project.script else ""
    video_path = None
    if project.source_video and project.source_video.storage_path:
        video_path = storage_service.get_absolute_path(project.source_video.storage_path)

    # Check cache first
    content_hash = analysis_pipeline.cache.compute_content_hash(video_path, script_text)
    cached = analysis_pipeline.cache.get(content_hash)
    if cached:
        return cached

    # Otherwise run pipeline
    return await analysis_pipeline.run(
        project_id=project_id,
        script_text=script_text,
        video_path=video_path,
        db=db,
        force_recompute=False
    )
