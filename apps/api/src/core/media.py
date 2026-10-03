import shutil
import subprocess
import json
import logging
from typing import Optional, Dict, Any
from pathlib import Path

from .config import settings

logger = logging.getLogger(__name__)

class MediaEnvironment:
    def __init__(self):
        self.ffmpeg_path: Optional[str] = None
        self.ffprobe_path: Optional[str] = None
        self.ffmpeg_version: Optional[str] = None
        self.is_valid: bool = False
        self.detect_tools()

    def detect_tools(self) -> None:
        # Check custom settings first, then PATH
        custom_ffmpeg = settings.FFMPEG_PATH
        custom_ffprobe = settings.FFPROBE_PATH

        self.ffmpeg_path = custom_ffmpeg if custom_ffmpeg and Path(custom_ffmpeg).exists() else shutil.which("ffmpeg")
        self.ffprobe_path = custom_ffprobe if custom_ffprobe and Path(custom_ffprobe).exists() else shutil.which("ffprobe")

        # If not found directly, check standard Windows locations (winget packages or local dirs)
        if not self.ffmpeg_path:
            local_appdata = Path.home() / "AppData" / "Local" / "Microsoft" / "WinGet" / "Packages"
            for match in local_appdata.glob("**/ffmpeg.exe"):
                self.ffmpeg_path = str(match)
                break

        if not self.ffprobe_path and self.ffmpeg_path:
            probe_candidate = Path(self.ffmpeg_path).parent / "ffprobe.exe"
            if probe_candidate.exists():
                self.ffprobe_path = str(probe_candidate)

        if self.ffmpeg_path:
            try:
                result = subprocess.run(
                    [self.ffmpeg_path, "-version"],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    check=True,
                    timeout=5
                )
                first_line = result.stdout.splitlines()[0] if result.stdout else ""
                self.ffmpeg_version = first_line
                self.is_valid = True
                logger.info(f"FFmpeg detected: {self.ffmpeg_path} ({self.ffmpeg_version})")
            except Exception as e:
                logger.error(f"Failed to execute ffmpeg at {self.ffmpeg_path}: {e}")
                self.is_valid = False
        else:
            logger.warning("FFmpeg was not found on this system.")
            self.is_valid = False

    def probe_video(self, file_path: str) -> Dict[str, Any]:
        """Use ffprobe to inspect video metadata (width, height, fps, duration, audio)."""
        if not self.ffprobe_path:
            raise RuntimeError("ffprobe is not available on this system.")

        cmd = [
            self.ffprobe_path,
            "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            "-show_streams",
            file_path
        ]

        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
        data = json.loads(result.stdout)

        video_stream = next((s for s in data.get("streams", []) if s.get("codec_type") == "video"), None)
        audio_stream = next((s for s in data.get("streams", []) if s.get("codec_type") == "audio"), None)
        format_info = data.get("format", {})

        width = int(video_stream.get("width", 0)) if video_stream else 0
        height = int(video_stream.get("height", 0)) if video_stream else 0
        duration = float(format_info.get("duration", 0.0))
        
        # Calculate fps
        fps = 30.0
        if video_stream and "r_frame_rate" in video_stream:
            try:
                num, den = video_stream["r_frame_rate"].split("/")
                fps = round(float(num) / float(den), 2)
            except Exception:
                fps = 30.0

        return {
            "width": width,
            "height": height,
            "fps": fps,
            "duration": duration,
            "format": format_info.get("format_name", "mp4"),
            "has_audio": audio_stream is not None,
            "codec_name": video_stream.get("codec_name") if video_stream else None,
            "bitrate": int(format_info.get("bit_rate", 0))
        }

media_env = MediaEnvironment()
