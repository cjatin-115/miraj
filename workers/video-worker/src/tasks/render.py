import logging
from typing import Dict, Any, Optional, Callable, Awaitable
from pathlib import Path

from apps.api.src.services.rendering.remotion_engine import remotion_engine
from apps.api.src.services.storage_service import storage_service

logger = logging.getLogger(__name__)

async def run_render_task(
    project_id: str,
    timeline_dict: Dict[str, Any],
    source_audio_path: Optional[str] = None,
    resolution: str = "1080x1920",
    fps: int = 30,
    on_progress: Optional[Callable[[str, int, str], Awaitable[None]]] = None,
) -> Dict[str, Any]:
    """
    Executes the complete rendering task in the worker:
    Timeline JSON -> Remotion -> 1080x1920 MP4 -> FFmpeg Audio Muxing -> Quality Control
    """
    logger.info(f"Running video render task for project {project_id} ({resolution} @ {fps}fps)")

    result = await remotion_engine.render_timeline(
        timeline_dict=timeline_dict,
        project_id=project_id,
        source_audio_path=source_audio_path,
        resolution=resolution,
        fps=fps,
        on_progress=on_progress,
    )

    return result
