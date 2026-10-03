import logging
from typing import Dict, Any, List, Optional
from ...schemas.director import EditPlan, ScenePlan
from ...schemas.timeline import (
    TimelineSchema,
    TimelineSceneSchema,
    TimelineTransitionSchema,
    TimelineAudioTrackSchema,
    TimelineOverlaySchema
)

logger = logging.getLogger(__name__)

class TimelineBuilder:
    """
    Transforms EditPlan JSON into a deterministic, validated Timeline JSON
    ready for Remotion rendering.
    """

    def __init__(
        self,
        fps: int = 30,
        width: int = 1080,
        height: int = 1920,
        style_id: str = "modern_creator_v1"
    ):
        self.fps = fps
        self.width = width
        self.height = height
        self.style_id = style_id

    def build_timeline(
        self,
        edit_plan: EditPlan,
        video_url: str = "",
        source_duration_seconds: float = 60.0,
        transcript_words: Optional[List[Dict[str, Any]]] = None,
        project_id: Optional[str] = None
    ) -> TimelineSchema:
        """
        Convert EditPlan to Timeline with normalized timing, resolved assets,
        validated transitions, and aligned audio tracks.
        """
        fps = self.fps
        max_source_frames = max(30, int(round(source_duration_seconds * fps)))

        timeline_scenes: List[TimelineSceneSchema] = []
        timeline_overlays: List[TimelineOverlaySchema] = []
        current_frame = 0

        words = transcript_words or []

        for sc_idx, scene in enumerate(edit_plan.scenes):
            # 1. Normalize timing to integer frame boundaries
            duration_frames = max(15, int(round(scene.duration * fps)))
            start_frame = current_frame

            # 2. Source video frame mapping
            src_start_frame = int(round(scene.source_start * fps))
            if src_start_frame >= max_source_frames:
                src_start_frame = src_start_frame % max_source_frames

            # 3. Transitions
            transition_in = None
            if scene.transition_in and scene.transition_in.type != "cut":
                t_frames = int(round(scene.transition_in.duration * fps))
                t_frames = min(15, max(4, min(t_frames, duration_frames // 3)))
                transition_in = TimelineTransitionSchema(
                    type=scene.transition_in.type,
                    durationInFrames=t_frames,
                    easing="ease-out"
                )

            # 4. Resolve component props based on scene type & asset requests
            props = dict(scene.props) if scene.props else {}

            if scene.type in {"talking_head", "talking_head_zoom", "talking_head_overlay", "talking_head_split"}:
                zoom_lvl = 1.0
                pan_x = 0.0
                pan_y = 0.0

                if scene.crop:
                    zoom_lvl = scene.crop.scale
                    pan_x = scene.crop.offset_x
                    pan_y = scene.crop.offset_y
                elif scene.type == "talking_head_zoom":
                    zoom_lvl = 1.22

                props.update({
                    "videoSrc": video_url,
                    "sourceStartFrame": src_start_frame,
                    "zoomLevel": round(zoom_lvl, 2),
                    "panX": round(pan_x, 3),
                    "panY": round(pan_y, 3),
                    "roundedCorners": True,
                    "backgroundTreatment": "blur",
                    "scriptSlice": scene.script_slice or ""
                })

            elif scene.type == "statistics":
                asset_data = scene.asset_request.data if scene.asset_request else {}
                props.update({
                    "statNumber": asset_data.get("statNumber", props.get("statNumber", "95%")),
                    "statLabel": asset_data.get("statLabel", props.get("statLabel", scene.script_slice or "Automated")),
                    "comparisonText": asset_data.get("comparisonText", "vs industry standard"),
                    "trend": asset_data.get("trend", "up")
                })

            elif scene.type == "comparison":
                asset_data = scene.asset_request.data if scene.asset_request else {}
                props.update({
                    "leftTitle": asset_data.get("leftTitle", "Traditional"),
                    "leftPoints": asset_data.get("leftPoints", ["Hours per edit", "Manual cuts"]),
                    "rightTitle": asset_data.get("rightTitle", "Miraaj V1"),
                    "rightPoints": asset_data.get("rightPoints", ["Instant AI Director", "Deterministic rendering"]),
                    "winner": asset_data.get("winner", "right")
                })

            elif scene.type == "code":
                asset_data = scene.asset_request.data if scene.asset_request else {}
                props.update({
                    "code": asset_data.get("code", props.get("code", "const timeline = await director.plan();")),
                    "language": asset_data.get("language", "typescript"),
                    "filename": "pipeline.ts",
                    "theme": "vivid-dark"
                })

            elif scene.type == "cta":
                asset_data = scene.asset_request.data if scene.asset_request else {}
                props.update({
                    "headline": asset_data.get("headline", props.get("headline", scene.script_slice or "Follow for More")),
                    "subtext": asset_data.get("subtext", "Automate video creation with Miraaj"),
                    "buttonText": asset_data.get("buttonText", "Subscribe"),
                    "arrowAnimation": True
                })

            elif scene.type in {"fullscreen_text", "keyword_text", "editorial_text"}:
                props.update({
                    "headline": scene.script_slice or "Miraaj V1",
                    "subheadline": "Deterministic Video Pipeline",
                    "keywords": [{"text": kw, "highlight": True} for kw in scene.emphasis_keywords]
                })

            # 5. Extract word-level captions belonging to this scene
            scene_sec_start = start_frame / fps
            scene_sec_end = (start_frame + duration_frames) / fps
            scene_words = []

            for w in words:
                w_start = float(w.get("start", 0.0))
                w_end = float(w.get("end", 0.0))
                if scene_sec_start <= w_start < scene_sec_end:
                    rel_start_frame = max(0, int(round((w_start - scene_sec_start) * fps)))
                    rel_end_frame = max(rel_start_frame + 2, int(round((w_end - scene_sec_start) * fps)))
                    scene_words.append({
                        "word": w.get("word", ""),
                        "startFrame": rel_start_frame,
                        "endFrame": rel_end_frame,
                        "highlight": w.get("word", "").upper() in [k.upper() for k in scene.emphasis_keywords]
                    })

            if scene_words:
                props["captionWords"] = scene_words

            # 6. Instantiate Scene
            t_scene = TimelineSceneSchema(
                id=scene.id or f"scene_{sc_idx + 1:03d}",
                type=scene.type,
                startFrame=start_frame,
                durationInFrames=duration_frames,
                transitionIn=transition_in,
                props=props
            )
            timeline_scenes.append(t_scene)

            current_frame += duration_frames

        # Total duration in frames
        total_duration_frames = current_frame

        # 7. Add Master Audio Track if video source is provided
        audio_tracks: List[TimelineAudioTrackSchema] = []
        if video_url:
            audio_tracks.append(
                TimelineAudioTrackSchema(
                    id="track_master_voice",
                    src=video_url,
                    type="voiceover",
                    startFrame=0,
                    durationInFrames=total_duration_frames,
                    volume=1.0
                )
            )

        # 8. Safe area metadata
        metadata = {
            "projectId": project_id,
            "generatedFrom": "EditPlan",
            "styleId": self.style_id,
            "safeAreas": {
                "top": 140,
                "bottom": 240,
                "left": 48,
                "right": 48
            },
            "scenesCount": len(timeline_scenes),
            "visualDensity": edit_plan.visual_density
        }

        # 9. Return validated TimelineSchema
        timeline = TimelineSchema(
            version=1,
            width=self.width,
            height=self.height,
            fps=self.fps,
            durationInFrames=total_duration_frames,
            styleId=self.style_id,
            scenes=timeline_scenes,
            audioTracks=audio_tracks,
            overlays=timeline_overlays,
            metadata=metadata
        )

        logger.info(
            f"Built timeline: {len(timeline_scenes)} scenes, "
            f"{total_duration_frames} frames ({total_duration_frames / fps:.1f}s)"
        )
        return timeline

timeline_builder = TimelineBuilder()
