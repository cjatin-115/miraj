import os
import sys
import json
import shutil
import asyncio
import logging
from pathlib import Path
from typing import Optional, Dict, Any, Callable, Awaitable

from ...core.config import settings
from ...core.media import media_env
from ..storage_service import storage_service
from .post_processor import post_processor
from .quality_checker import quality_checker

logger = logging.getLogger(__name__)

def _get_project_root() -> Path:
    cur = Path(__file__).resolve()
    for p in [cur] + list(cur.parents):
        if (p / "package.json").exists() and (p / "apps").exists():
            return p
    return Path.cwd().resolve()

PROJECT_ROOT = _get_project_root()

class RemotionRenderEngine:
    """
    Coordinates end-to-end rendering:
    Timeline JSON -> Remotion (1080x1920 MP4) -> FFmpeg Audio Muxing -> Quality Control
    """

    def __init__(self):
        self.cli_path = PROJECT_ROOT / "apps" / "renderer" / "src" / "render-cli.ts"

    async def render_timeline(
        self,
        timeline_dict: Dict[str, Any],
        project_id: str,
        source_audio_path: Optional[str] = None,
        resolution: str = "1080x1920",
        fps: int = 30,
        frame_range: Optional[tuple] = None,
        on_progress: Optional[Callable[[str, int, str], Awaitable[None]]] = None,
    ) -> Dict[str, Any]:
        """
        Executes Remotion render runner, muxes audio, runs QC, and returns result metadata.
        """
        work_dir = PROJECT_ROOT / "storage" / "projects" / project_id / "render"
        work_dir.mkdir(parents=True, exist_ok=True)

        timeline_path = work_dir / "timeline.json"
        raw_output_path = work_dir / "remotion_raw.mp4"
        final_output_path = work_dir / f"final_{resolution}_{fps}fps.mp4"

        # 1. Save timeline JSON
        with open(timeline_path, "w", encoding="utf-8") as f:
            json.dump(timeline_dict, f, indent=2)

        if on_progress:
            await on_progress("queued", 5, "Preparing composition and bundler")

        # 2. Build command for render-cli.ts
        npx_bin = shutil.which("npx") or "npx"
        base_cmd = [
            npx_bin, "tsx", str(self.cli_path),
            "--timeline", str(timeline_path),
            "--output", str(raw_output_path),
            "--resolution", resolution,
            "--fps", str(fps),
        ]
        if frame_range:
            base_cmd.extend(["--frameRange", f"{frame_range[0]},{frame_range[1]}"])

        if sys.platform == "win32":
            cmd = ["cmd.exe", "/c"] + base_cmd
        else:
            cmd = base_cmd

        logger.info(f"Launching Remotion render process: {' '.join(cmd)}")

        # 3. Execute subprocess and stream real progress
        process = await asyncio.create_subprocess_exec(
            *cmd,
            cwd=str(PROJECT_ROOT),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )

        last_progress = 5
        while True:
            line = await process.stdout.readline()
            if not line:
                break
            text = line.decode("utf-8", errors="replace").strip()
            if not text:
                continue

            try:
                data = json.loads(text)
                msg_type = data.get("type")

                if msg_type == "status":
                    stage = data.get("stage", "processing")
                    msg = data.get("message", "Processing")
                    if on_progress:
                        await on_progress(stage, last_progress, msg)

                elif msg_type == "progress":
                    # Scale Remotion progress (0-100) to overall pipeline (10-85%)
                    raw_pct = data.get("progress", 0)
                    scaled_pct = 10 + int(raw_pct * 0.75)
                    last_progress = scaled_pct
                    rendered = data.get("renderedFrames", 0)
                    total = data.get("totalFrames", 1)
                    stage_msg = f"Rendering Remotion frames ({rendered}/{total} frames - {raw_pct}%)"
                    if on_progress:
                        await on_progress("rendering", scaled_pct, stage_msg)

                elif msg_type == "completed":
                    logger.info(f"Remotion raw render completed: {raw_output_path}")

            except json.JSONDecodeError:
                logger.debug(f"[Remotion runner]: {text}")

        return_code = await process.wait()
        if return_code != 0:
            stderr = await process.stderr.read()
            err_msg = stderr.decode("utf-8", errors="replace")
            logger.error(f"Remotion render failed (code {return_code}): {err_msg}")
            raise RuntimeError(f"Remotion rendering failed: {err_msg}")

        # 4. FFmpeg Audio Muxing & Post-Processing
        if on_progress:
            await on_progress("encoding", 88, "Encoding & muxing master speech audio")

        muxed_path = post_processor.mux_audio_and_video(
            video_path=str(raw_output_path),
            audio_path=source_audio_path,
            output_path=str(final_output_path),
            volume=1.0,
            fade_duration=0.2,
        )

        # 5. Automated Quality Control Validation
        if on_progress:
            await on_progress("quality_check", 95, "Running automated Quality Control checks")

        expected_dur = float(timeline_dict.get("durationInFrames", 300)) / float(fps)
        w_exp, h_exp = [int(v) for v in resolution.split("x")]
        qc_result = quality_checker.validate_video(
            video_path=muxed_path,
            expected_duration_seconds=expected_dur,
            expected_width=w_exp,
            expected_height=h_exp,
            expected_fps=float(fps),
            require_audio=bool(source_audio_path),
        )

        if not qc_result["is_valid"]:
            logger.warning(f"QC check reported errors: {qc_result['errors']}")

        # 6. Extract representative QC frames
        qc_dir = work_dir / "qc_frames"
        qc_frames = post_processor.extract_qc_frames(muxed_path, str(qc_dir), num_frames=3)

        if on_progress:
            await on_progress("completed", 100, "Video rendering and QC completed successfully!")

        final_size = Path(muxed_path).stat().st_size
        logger.info(f"Final video generated: {muxed_path} ({final_size} bytes)")

        return {
            "output_path": muxed_path,
            "file_size_bytes": final_size,
            "resolution": resolution,
            "fps": fps,
            "duration_seconds": qc_result.get("metrics", {}).get("duration_seconds", expected_dur),
            "qc_result": qc_result,
            "qc_frames": qc_frames,
            "is_valid": qc_result["is_valid"],
        }

remotion_engine = RemotionRenderEngine()
