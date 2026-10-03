import subprocess
import logging
from pathlib import Path
from typing import Optional, Dict, Any

from ...core.media import media_env

logger = logging.getLogger(__name__)

class VideoPostProcessor:
    """
    Handles FFmpeg post-processing:
    - Master speech audio muxing & volume leveling
    - Audio fade-in / fade-out
    - Transcoding / faststart optimization for web playback
    """

    @staticmethod
    def mux_audio_and_video(
        video_path: str,
        audio_path: Optional[str],
        output_path: str,
        volume: float = 1.0,
        fade_duration: float = 0.2
    ) -> str:
        ffmpeg = media_env.ffmpeg_path
        if not ffmpeg:
            raise RuntimeError("FFmpeg is not available for video post-processing.")

        v_path = Path(video_path).resolve()
        out_path = Path(output_path).resolve()
        out_path.parent.mkdir(parents=True, exist_ok=True)

        # If audio_path is provided and exists on disk
        if audio_path and Path(audio_path).exists():
            a_path = Path(audio_path).resolve()
            logger.info(f"Muxing audio {a_path} with video {v_path} into {out_path}")

            # Audio filter with optional fade and volume leveling
            audio_filter = f"volume={volume:.2f}"
            if fade_duration > 0:
                audio_filter += f",afade=t=in:ss=0:d={fade_duration:.2f}"

            cmd = [
                ffmpeg, "-y",
                "-i", str(v_path),
                "-i", str(a_path),
                "-map", "0:v:0",
                "-map", "1:a:0",
                "-c:v", "copy",
                "-filter:a", audio_filter,
                "-c:a", "aac",
                "-b:a", "192k",
                "-shortest",
                "-movflags", "+faststart",
                str(out_path)
            ]
        else:
            logger.info(f"No separate audio provided. Applying faststart web optimization to {v_path}")
            cmd = [
                ffmpeg, "-y",
                "-i", str(v_path),
                "-c:v", "copy",
                "-c:a", "copy",
                "-movflags", "+faststart",
                str(out_path)
            ]

        try:
            res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
            logger.info(f"Post-processing completed successfully: {out_path} ({out_path.stat().st_size} bytes)")
            return str(out_path)
        except subprocess.CalledProcessError as e:
            logger.error(f"FFmpeg muxing failed: {e.stderr}")
            raise RuntimeError(f"FFmpeg audio muxing failed: {e.stderr}")

    @staticmethod
    def extract_qc_frames(video_path: str, output_dir: str, num_frames: int = 3) -> list:
        """Extract representative frames for automated Quality Control inspection."""
        ffmpeg = media_env.ffmpeg_path
        if not ffmpeg or not Path(video_path).exists():
            return []

        out_dir = Path(output_dir)
        out_dir.mkdir(parents=True, exist_ok=True)

        meta = media_env.probe_video(video_path)
        duration = meta.get("duration", 1.0)
        timestamps = [round(duration * (i + 1) / (num_frames + 1), 2) for i in range(num_frames)]

        extracted = []
        for idx, ts in enumerate(timestamps):
            frame_path = out_dir / f"qc_frame_{idx + 1}.jpg"
            cmd = [
                ffmpeg, "-y",
                "-ss", str(ts),
                "-i", video_path,
                "-vframes", "1",
                "-q:v", "2",
                str(frame_path)
            ]
            try:
                subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                if frame_path.exists():
                    extracted.append(str(frame_path))
            except Exception as e:
                logger.warning(f"Could not extract QC frame at {ts}s: {e}")

        return extracted

post_processor = VideoPostProcessor()
