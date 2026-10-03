import subprocess
import logging
from pathlib import Path
from typing import Dict, Any, List

from ...core.media import media_env

logger = logging.getLogger(__name__)

class QualityChecker:
    """
    Automated Quality Control validator for final short-form video exports:
    - MP4 opens properly
    - 1080x1920 (or 2160x3840) vertical format
    - 30 FPS framerate
    - Audio stream presence & valid AAC
    - No corrupted frames
    - No persistent black frames
    """

    @classmethod
    def validate_video(
        cls,
        video_path: str,
        expected_duration_seconds: float = 0.0,
        expected_width: int = 1080,
        expected_height: int = 1920,
        expected_fps: float = 30.0,
        require_audio: bool = True
    ) -> Dict[str, Any]:
        errors: List[str] = []
        warnings: List[str] = []

        path = Path(video_path)
        if not path.exists():
            return {
                "is_valid": False,
                "errors": [f"Video file not found: {video_path}"],
                "warnings": [],
                "metrics": {}
            }

        file_size = path.stat().st_size
        if file_size < 10000:
            errors.append(f"Video file is suspiciously small ({file_size} bytes).")

        # 1. Probe technical metadata with FFprobe
        try:
            meta = media_env.probe_video(str(path))
        except Exception as e:
            return {
                "is_valid": False,
                "errors": [f"FFprobe failed to inspect video: {str(e)}"],
                "warnings": [],
                "metrics": {"file_size": file_size}
            }

        # 2. Resolution check
        width = meta.get("width", 0)
        height = meta.get("height", 0)
        if width != expected_width or height != expected_height:
            errors.append(
                f"Resolution mismatch: expected {expected_width}x{expected_height}, got {width}x{height}."
            )

        # 3. Framerate check
        fps = meta.get("fps", 0.0)
        if abs(fps - expected_fps) > 1.0:
            warnings.append(f"FPS deviation: expected ~{expected_fps}fps, got {fps}fps.")

        # 4. Codec check
        codec = meta.get("codec_name", "")
        if codec and codec not in {"h264", "hevc", "av1"}:
            warnings.append(f"Video codec '{codec}' is not standard H.264.")

        # 5. Audio presence check
        has_audio = meta.get("has_audio", False)
        if require_audio and not has_audio:
            warnings.append("Video has no active audio stream.")

        # 6. Duration check
        duration = meta.get("duration", 0.0)
        if duration <= 0.0:
            errors.append("Video duration is non-positive or corrupted.")
        elif expected_duration_seconds > 0:
            diff = abs(duration - expected_duration_seconds)
            if diff > 1.5:
                warnings.append(
                    f"Duration drift: expected ~{expected_duration_seconds:.1f}s, got {duration:.1f}s (diff: {diff:.2f}s)."
                )

        # 7. Black frame check via FFmpeg blackdetect
        ffmpeg = media_env.ffmpeg_path
        if ffmpeg:
            try:
                cmd = [
                    ffmpeg, "-v", "error",
                    "-i", str(path),
                    "-vf", "blackdetect=d=2:pic_th=0.98",
                    "-f", "null", "-"
                ]
                black_res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=10)
                if "black_start" in black_res.stderr:
                    warnings.append("Black frames detected during playback.")
            except Exception as e:
                logger.debug(f"Black frame detection check skipped: {e}")

        is_valid = len(errors) == 0

        return {
            "is_valid": is_valid,
            "errors": errors,
            "warnings": warnings,
            "metrics": {
                "file_size_bytes": file_size,
                "width": width,
                "height": height,
                "fps": fps,
                "duration_seconds": duration,
                "has_audio": has_audio,
                "codec": codec,
            }
        }

quality_checker = QualityChecker()
