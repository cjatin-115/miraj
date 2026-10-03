import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ...core.database import get_db
from ...models import Project, SourceVideo, Script, Analysis, EditPlan as EditPlanModel, TimelineModel
from ...schemas.director import EditPlan, DirectorInput
from ...schemas.timeline import TimelineSchema
from ...services.director.ai_director import ai_director
from ...services.timeline.builder import timeline_builder
from ...services.analysis.pipeline import analysis_pipeline

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/planning", tags=["planning"])

@router.post("/projects/{project_id}/plan", response_model=EditPlan)
async def generate_project_plan(
    project_id: str,
    target_duration: Optional[float] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    AI Director: Formulate structured EditPlan JSON from script, transcript,
    and video analysis for a specific target duration.
    """
    query = (
        select(Project)
        .where(Project.id == project_id)
        .options(
            selectinload(Project.source_video),
            selectinload(Project.script),
            selectinload(Project.analysis),
            selectinload(Project.edit_plan)
        )
    )
    res = await db.execute(query)
    project = res.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Project {project_id} not found")

    script_text = project.script.raw_text if project.script else "Welcome to Miraaj video production."

    # Load cached or computed analysis
    analysis_data = {}
    if project.analysis and project.analysis.visual_metrics:
        analysis_data = {
            "transcript": project.analysis.transcript_data,
            "video_analysis": project.analysis.visual_metrics,
            "script_analysis": {
                "candidate_emphasis_words": project.analysis.keywords or []
            }
        }
    else:
        # Fetch or run analysis pipeline
        analysis_data = await analysis_pipeline.run(
            project_id=project_id,
            script_text=script_text,
            db=db
        )

    # Determine target duration
    effective_target_duration = target_duration
    if not effective_target_duration:
        dur_intel = analysis_data.get("duration_intelligence", {})
        effective_target_duration = float(dur_intel.get("recommended_duration") or 60.0)

    # Formulate DirectorInput
    director_input = DirectorInput(
        script=script_text,
        transcript=analysis_data.get("transcript"),
        word_timestamps=analysis_data.get("transcript", {}).get("words") if analysis_data.get("transcript") else None,
        video_metadata=analysis_data.get("video_metadata") or (
            {
                "width": project.source_video.width,
                "height": project.source_video.height,
                "duration": project.source_video.duration_seconds
            } if project.source_video else None
        ),
        face_analysis=analysis_data.get("video_analysis"),
        audio_analysis=analysis_data.get("audio_analysis"),
        script_analysis=analysis_data.get("script_analysis"),
        target_duration=effective_target_duration,
        style_id=project.style_id
    )

    try:
        edit_plan = await ai_director.create_edit_plan(director_input)

        # Persist or update EditPlanModel
        scenes_dicts = [s.model_dump() for s in edit_plan.scenes]
        plan_stmt = select(EditPlanModel).where(EditPlanModel.project_id == project_id)
        p_res = await db.execute(plan_stmt)
        existing_plan = p_res.scalar_one_or_none()

        if existing_plan:
            existing_plan.plan_version = edit_plan.version
            existing_plan.pacing = edit_plan.pacing
            existing_plan.rationale = edit_plan.rationale
            existing_plan.scenes = scenes_dicts
            existing_plan.estimated_duration_seconds = edit_plan.duration
        else:
            new_plan = EditPlanModel(
                project_id=project_id,
                plan_version=edit_plan.version,
                pacing=edit_plan.pacing,
                rationale=edit_plan.rationale,
                scenes=scenes_dicts,
                estimated_duration_seconds=edit_plan.duration
            )
            db.add(new_plan)

        await db.commit()
        logger.info(f"Generated EditPlan for project {project_id} ({len(edit_plan.scenes)} scenes, {edit_plan.duration}s)")
        return edit_plan

    except Exception as e:
        logger.error(f"AI Director plan generation failed: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to generate EditPlan: {str(e)}")

@router.get("/projects/{project_id}/plan", response_model=EditPlan)
async def get_project_plan(
    project_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve existing EditPlan for a project."""
    plan_stmt = select(EditPlanModel).where(EditPlanModel.project_id == project_id)
    res = await db.execute(plan_stmt)
    plan_record = res.scalar_one_or_none()
    if not plan_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No EditPlan found for project {project_id}")

    return EditPlan(
        version=plan_record.plan_version,
        duration=plan_record.estimated_duration_seconds,
        pacing=plan_record.pacing,
        rationale=plan_record.rationale,
        scenes=plan_record.scenes
    )

@router.post("/projects/{project_id}/timeline", response_model=TimelineSchema)
async def compile_project_timeline(
    project_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Timeline Engine: Compile EditPlan into deterministic, validated Timeline JSON
    for Remotion rendering.
    """
    query = (
        select(Project)
        .where(Project.id == project_id)
        .options(
            selectinload(Project.source_video),
            selectinload(Project.edit_plan),
            selectinload(Project.analysis),
            selectinload(Project.timeline)
        )
    )
    res = await db.execute(query)
    project = res.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Project {project_id} not found")

    # If EditPlan doesn't exist, create it first
    plan_stmt = select(EditPlanModel).where(EditPlanModel.project_id == project_id)
    p_res = await db.execute(plan_stmt)
    existing_plan = p_res.scalar_one_or_none()
    if not existing_plan:
        await generate_project_plan(project_id=project_id, db=db)
        p_res = await db.execute(plan_stmt)
        existing_plan = p_res.scalar_one_or_none()

    edit_plan = EditPlan(
        version=existing_plan.plan_version,
        duration=existing_plan.estimated_duration_seconds,
        pacing=existing_plan.pacing,
        rationale=existing_plan.rationale,
        scenes=existing_plan.scenes
    )

    video_url = f"/api/v1/storage/{project.source_video.storage_path}" if project.source_video else ""
    src_duration = project.source_video.duration_seconds if project.source_video else edit_plan.duration
    transcript_words = project.analysis.transcript_data.get("words", []) if project.analysis and project.analysis.transcript_data else []

    timeline = timeline_builder.build_timeline(
        edit_plan=edit_plan,
        video_url=video_url,
        source_duration_seconds=src_duration,
        transcript_words=transcript_words,
        project_id=project_id
    )

    # Persist or update TimelineModel
    scenes_dicts = [s.model_dump() for s in timeline.scenes]
    audio_dicts = [a.model_dump() for a in timeline.audioTracks]
    overlays_dicts = [o.model_dump() for o in timeline.overlays]

    tl_stmt = select(TimelineModel).where(TimelineModel.project_id == project_id)
    tl_res = await db.execute(tl_stmt)
    existing_timeline = tl_res.scalar_one_or_none()

    if existing_timeline:
        existing_timeline.version = timeline.version
        existing_timeline.width = timeline.width
        existing_timeline.height = timeline.height
        existing_timeline.fps = timeline.fps
        existing_timeline.duration_in_frames = timeline.durationInFrames
        existing_timeline.style_id = timeline.styleId
        existing_timeline.scenes = scenes_dicts
        existing_timeline.audio_tracks = audio_dicts
        existing_timeline.overlays = overlays_dicts
        existing_timeline.metadata_json = timeline.metadata
    else:
        new_timeline = TimelineModel(
            project_id=project_id,
            version=timeline.version,
            width=timeline.width,
            height=timeline.height,
            fps=timeline.fps,
            duration_in_frames=timeline.durationInFrames,
            style_id=timeline.styleId,
            scenes=scenes_dicts,
            audio_tracks=audio_dicts,
            overlays=overlays_dicts,
            metadata_json=timeline.metadata
        )
        db.add(new_timeline)

    project.status = "ready"
    await db.commit()
    return timeline

@router.get("/projects/{project_id}/timeline", response_model=TimelineSchema)
async def get_project_timeline(
    project_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve compiled Timeline JSON for project."""
    query = (
        select(Project)
        .where(Project.id == project_id)
        .options(selectinload(Project.timeline))
    )
    res = await db.execute(query)
    project = res.scalar_one_or_none()
    if not project or not project.timeline:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No Timeline found for project {project_id}")

    t = project.timeline
    return TimelineSchema(
        version=t.version,
        width=t.width,
        height=t.height,
        fps=t.fps,
        durationInFrames=t.duration_in_frames,
        styleId=t.style_id,
        scenes=t.scenes or [],
        audioTracks=t.audio_tracks or [],
        overlays=t.overlays or [],
        metadata=t.metadata_json or {}
    )


from pydantic import BaseModel, Field
from sqlalchemy.orm.attributes import flag_modified

class SceneRegenerateRequest(BaseModel):
    scene_type: Optional[str] = Field(None, description="Optional new scene type (e.g. talking_head_zoom, statistics, comparison, code)")
    crop_scale: Optional[float] = Field(None, ge=1.0, le=2.5, description="Zoom/crop factor")
    transition_type: Optional[str] = Field(None, description="Transition type: cut, zoom, slide, fade")
    props: Optional[Dict[str, Any]] = Field(None, description="Updated visual component props")


@router.post("/projects/{project_id}/scenes/{scene_id}/regenerate")
async def regenerate_project_scene(
    project_id: str,
    scene_id: str,
    req: Optional[SceneRegenerateRequest] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Regenerates a single scene in the EditPlan and Timeline without recomputing the entire project.
    Allows changing framing, visual card style, transition, or component properties in-place.
    """
    query = (
        select(Project)
        .where(Project.id == project_id)
        .options(
            selectinload(Project.edit_plan),
            selectinload(Project.timeline)
        )
    )
    res = await db.execute(query)
    project = res.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Project {project_id} not found")

    if not project.edit_plan or not project.timeline:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project must have a formulated EditPlan and compiled Timeline before scenes can be regenerated."
        )

    # 1. Locate scene in EditPlan
    plan_scenes = list(project.edit_plan.scenes or [])
    plan_scene = next((s for s in plan_scenes if s.get("id") == scene_id), None)
    if not plan_scene:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Scene {scene_id} not found in EditPlan")

    # 2. Locate scene in Timeline
    timeline_scenes = list(project.timeline.scenes or [])
    tl_scene = next((s for s in timeline_scenes if s.get("id") == scene_id), None)
    if not tl_scene:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Scene {scene_id} not found in Timeline")

    req_data = req or SceneRegenerateRequest()

    # 3. Apply updates to EditPlan scene
    if req_data.scene_type:
        plan_scene["type"] = req_data.scene_type
        plan_scene["scene_type"] = req_data.scene_type
        tl_scene["type"] = req_data.scene_type

    if req_data.crop_scale is not None:
        mode = "close" if req_data.crop_scale > 1.05 else "cover"
        plan_scene["crop"] = {"mode": mode, "scale": req_data.crop_scale}
        if "props" not in tl_scene:
            tl_scene["props"] = {}
        tl_scene["props"]["zoomLevel"] = req_data.crop_scale
    elif not req_data.scene_type and not req_data.props:
        # Default regeneration toggles between standard talking_head and talking_head_zoom (punch-in)
        current_type = plan_scene.get("type", "talking_head")
        if current_type == "talking_head":
            new_type = "talking_head_zoom"
            scale = 1.25
        elif current_type == "talking_head_zoom":
            new_type = "talking_head"
            scale = 1.0
        else:
            new_type = current_type
            scale = 1.0

        plan_scene["type"] = new_type
        plan_scene["scene_type"] = new_type
        plan_scene["crop"] = {"mode": "close" if scale > 1.05 else "cover", "scale": scale}
        tl_scene["type"] = new_type
        if "props" not in tl_scene:
            tl_scene["props"] = {}
        tl_scene["props"]["zoomLevel"] = scale

    if req_data.transition_type:
        plan_scene["transition"] = {"type": req_data.transition_type, "duration": 0.3}
        tl_scene["transitionIn"] = {"type": req_data.transition_type, "durationInFrames": 9}

    if req_data.props:
        plan_scene["props"] = req_data.props
        if "props" not in tl_scene:
            tl_scene["props"] = {}
        tl_scene["props"].update(req_data.props)

    # 4. Save modifications
    project.edit_plan.scenes = plan_scenes
    project.timeline.scenes = timeline_scenes
    flag_modified(project.edit_plan, "scenes")
    flag_modified(project.timeline, "scenes")

    await db.commit()
    logger.info(f"Regenerated scene {scene_id} in project {project_id}")

    return {
        "status": "success",
        "message": f"Scene {scene_id} regenerated successfully",
        "project_id": project_id,
        "scene_id": scene_id,
        "updated_plan_scene": plan_scene,
        "updated_timeline_scene": tl_scene,
    }
