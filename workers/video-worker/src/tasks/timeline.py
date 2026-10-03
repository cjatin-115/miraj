import logging
from typing import Dict, Any, List
from apps.api.src.schemas.timeline import TimelineSchema, TimelineSceneSchema, TimelineTransitionSchema

logger = logging.getLogger(__name__)

async def run_compile_timeline_task(
    project_id: str,
    edit_plan_dict: Dict[str, Any],
    video_url: str = "",
    style_id: str = "modern_creator_v1",
    fps: int = 30
) -> Dict[str, Any]:
    """Compiles an EditPlan into a Remotion Timeline JSON."""
    scenes_plan = edit_plan_dict.get("scenes", [])
    timeline_scenes = []
    
    current_frame = 0
    for s in scenes_plan:
        dur_sec = s.get("duration_seconds", 3.0)
        dur_frames = max(15, int(round(dur_sec * fps)))
        stype = s.get("scene_type", "talking_head")
        trans_name = s.get("suggested_transition", "cut")

        # Props
        props = s.get("props", {})
        if "videoSrc" in props and not props["videoSrc"]:
            props["videoSrc"] = video_url

        trans_in = None
        if trans_name != "cut":
            trans_in = {"type": trans_name, "durationInFrames": 8}

        timeline_scenes.append({
            "id": f"scene-{s.get('scene_index', 0)}",
            "type": stype,
            "startFrame": current_frame,
            "durationInFrames": dur_frames,
            "transitionIn": trans_in,
            "transitionOut": {"type": "cut", "durationInFrames": 0},
            "props": props
        })
        current_frame += dur_frames

    total_frames = max(fps * 3, current_frame)

    timeline_data = {
        "version": 1,
        "width": 1080,
        "height": 1920,
        "fps": fps,
        "durationInFrames": total_frames,
        "styleId": style_id,
        "scenes": timeline_scenes,
        "audioTracks": [
            {
                "id": "master-audio",
                "src": video_url,
                "type": "voiceover",
                "startFrame": 0,
                "durationInFrames": total_frames,
                "volume": 1.0
            }
        ],
        "overlays": [
            {
                "id": "progress-indicator",
                "type": "progress_bar",
                "startFrame": 0,
                "durationInFrames": total_frames,
                "props": {"color": "#FFE600", "height": 6, "position": "top"}
            }
        ],
        "metadata": {
            "projectId": project_id,
            "generator": "miraaj-v1-worker"
        }
    }

    # Validate against TimelineSchema
    validated = TimelineSchema.model_validate(timeline_data)
    return validated.model_dump()
