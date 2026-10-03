import re
import json
import logging
from typing import Dict, Any, Optional
from ...schemas.director import EditPlan, ScenePlan, SceneType, TransitionType

logger = logging.getLogger(__name__)

VALID_SCENE_TYPES = {
    "talking_head",
    "talking_head_zoom",
    "talking_head_overlay",
    "talking_head_split",
    "fullscreen_text",
    "keyword_text",
    "editorial_text",
    "caption",
    "screenshot",
    "browser",
    "code",
    "comparison",
    "statistics",
    "graph",
    "product_card",
    "image_broll",
    "video_broll",
    "diagram",
    "quote",
    "cta"
}

SCENE_TYPE_ALIASES = {
    "broll": "image_broll",
    "video": "video_broll",
    "image": "image_broll",
    "talkinghead": "talking_head",
    "head": "talking_head",
    "zoom": "talking_head_zoom",
    "punch_in": "talking_head_zoom",
    "punchin": "talking_head_zoom",
    "text": "editorial_text",
    "stat": "statistics",
    "stats": "statistics",
    "compare": "comparison",
    "call_to_action": "cta"
}

VALID_TRANSITIONS = {"cut", "fade", "zoom", "slide", "blur", "scale", "mask", "whip"}

def clean_json_string(raw: str) -> str:
    """Strip markdown blocks and extraneous characters outside JSON boundaries."""
    text = raw.strip()
    # Strip markdown ```json ... ```
    if "```" in text:
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
        if match:
            text = match.group(1).strip()

    # Find boundaries of the outermost JSON object
    start_idx = text.find("{")
    end_idx = text.rfind("}")
    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
        text = text[start_idx : end_idx + 1]

    # Remove trailing commas before closing braces/brackets
    text = re.sub(r",\s*([\]}])", r"\1", text)
    return text

def repair_and_parse_edit_plan(raw_text: str) -> Optional[EditPlan]:
    """
    Attempt structured repair on raw LLM output.
    1. Clean markdown and JSON syntax
    2. Normalize scene and transition types
    3. Validate against Pydantic EditPlan schema
    """
    cleaned = clean_json_string(raw_text)

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as e:
        logger.warning(f"Initial JSON parse failed: {e}. Attempting regex recovery...")
        try:
            # Fix unquoted keys if any
            fixed = re.sub(r'([{,])\s*([A-Za-z0-9_]+)\s*:', r'\1"\2":', cleaned)
            data = json.loads(fixed)
        except Exception:
            logger.error("Could not recover JSON from raw LLM output.")
            return None

    if not isinstance(data, dict):
        return None

    # Normalize fields
    scenes_data = data.get("scenes", [])
    if not isinstance(scenes_data, list) or len(scenes_data) == 0:
        return None

    normalized_scenes = []
    current_time = 0.0

    for idx, sc in enumerate(scenes_data):
        if not isinstance(sc, dict):
            continue

        raw_type = str(sc.get("type", "talking_head")).lower().strip()
        mapped_type = SCENE_TYPE_ALIASES.get(raw_type, raw_type)
        if mapped_type not in VALID_SCENE_TYPES:
            mapped_type = "talking_head"

        # Sanitize duration
        dur = float(sc.get("duration", 3.0))
        if dur <= 0:
            dur = 3.0

        # Timeline start
        tl_start = float(sc.get("timeline_start", current_time))
        if tl_start < current_time:
            tl_start = current_time

        # Source timing
        src_start = float(sc.get("source_start", tl_start))
        src_end = float(sc.get("source_end", src_start + dur))
        if src_end <= src_start:
            src_end = src_start + dur

        # Sanitize transition
        t_in = sc.get("transition_in")
        norm_t_in = None
        if isinstance(t_in, dict):
            t_type = str(t_in.get("type", "cut")).lower().strip()
            if t_type not in VALID_TRANSITIONS:
                t_type = "cut"
            t_dur = min(0.5, max(0.0, float(t_in.get("duration", 0.0))))
            norm_t_in = {"type": t_type, "duration": t_dur}

        # Sanitize crop
        crop = sc.get("crop")
        norm_crop = None
        if isinstance(crop, dict):
            mode = crop.get("mode", "medium")
            if mode not in {"close", "medium", "wide", "fit", "punch_in"}:
                mode = "medium"
            scale = max(0.5, min(2.5, float(crop.get("scale", 1.0))))
            norm_crop = {
                "mode": mode,
                "scale": scale,
                "offset_x": float(crop.get("offset_x", 0.0)),
                "offset_y": float(crop.get("offset_y", 0.0))
            }
        elif mapped_type == "talking_head_zoom":
            norm_crop = {"mode": "punch_in", "scale": 1.2, "offset_x": 0.0, "offset_y": 0.0}

        scene_dict = {
            "id": sc.get("id") or f"scene_{idx + 1:03d}",
            "type": mapped_type,
            "source_start": round(src_start, 2),
            "source_end": round(src_end, 2),
            "timeline_start": round(tl_start, 2),
            "duration": round(dur, 2),
            "crop": norm_crop,
            "transition_in": norm_t_in,
            "asset_request": sc.get("asset_request"),
            "script_slice": sc.get("script_slice", ""),
            "emphasis_keywords": sc.get("emphasis_keywords", []),
            "props": sc.get("props", {})
        }

        normalized_scenes.append(scene_dict)
        current_time = tl_start + dur

    total_dur = float(data.get("duration", current_time))
    if total_dur <= 0:
        total_dur = current_time

    try:
        plan = EditPlan(
            version=1,
            duration=round(total_dur, 2),
            pacing=data.get("pacing", "balanced") if data.get("pacing") in {"rapid", "balanced", "contemplative"} else "balanced",
            visual_density=float(data.get("visual_density", 0.6)),
            rationale=data.get("rationale", "Structured AI Director Edit Plan"),
            scenes=normalized_scenes
        )
        return plan
    except Exception as e:
        logger.error(f"Failed to instantiate EditPlan after repair: {e}")
        return None
