import os
import json
import logging
import subprocess
import concurrent.futures
from pathlib import Path
from typing import Dict, Any, List, Optional

from ...core.media import media_env
from ...core.config import settings

logger = logging.getLogger(__name__)

class MediaIngestService:
    def __init__(self):
        self.ffmpeg_path = media_env.ffmpeg_path
        self.ffprobe_path = media_env.ffprobe_path

    def probe_media(self, file_path: Path) -> Dict[str, Any]:
        """Run ffprobe on the input file and extract comprehensive stream metadata."""
        if not self.ffprobe_path:
            raise RuntimeError("ffprobe is not available on this system.")

        cmd = [
            self.ffprobe_path,
            "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            "-show_streams",
            str(file_path)
        ]

        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
        data = json.loads(result.stdout)

        format_info = data.get("format", {})
        streams = data.get("streams", [])

        video_stream = next((s for s in streams if s.get("codec_type") == "video"), None)
        audio_streams = [s for s in streams if s.get("codec_type") == "audio"]

        width = int(video_stream.get("width", 0)) if video_stream else 0
        height = int(video_stream.get("height", 0)) if video_stream else 0
        duration = float(format_info.get("duration", 0.0))

        fps = 30.0
        if video_stream and "r_frame_rate" in video_stream:
            try:
                num, den = video_stream["r_frame_rate"].split("/")
                fps = round(float(num) / float(den), 2)
            except Exception:
                fps = 30.0

        audio_info = []
        for a in audio_streams:
            audio_info.append({
                "codec": a.get("codec_name"),
                "sample_rate": int(a.get("sample_rate", 44100)),
                "channels": int(a.get("channels", 2)),
                "bitrate": int(a.get("bit_rate", 0)) if a.get("bit_rate") else None
            })

        return {
            "filename": file_path.name,
            "filepath": str(file_path),
            "width": width,
            "height": height,
            "fps": fps,
            "duration": duration,
            "format": format_info.get("format_name", "mp4"),
            "video_codec": video_stream.get("codec_name") if video_stream else None,
            "video_bitrate": int(video_stream.get("bit_rate", 0)) if video_stream and video_stream.get("bit_rate") else 0,
            "overall_bitrate": int(format_info.get("bit_rate", 0)) if format_info.get("bit_rate") else 0,
            "file_size_bytes": int(format_info.get("size", file_path.stat().st_size if file_path.exists() else 0)),
            "has_audio": len(audio_streams) > 0,
            "audio_streams": audio_info
        }

    def generate_proxy(self, input_path: Path, output_path: Path) -> Path:
        """
        Generate a fast, downscaled analysis proxy (width=540p) without audio.
        Ensures even dimensions and very fast encoding.
        """
        if not self.ffmpeg_path:
            raise RuntimeError("ffmpeg is not available on this system.")

        input_path = input_path.resolve()
        output_path = output_path.resolve()
        output_path.parent.mkdir(parents=True, exist_ok=True)

        cmd = [
            self.ffmpeg_path,
            "-y",
            "-i", str(input_path),
            "-vf", "scale=w=540:h=-2:force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2",
            "-c:v", "libx264",
            "-preset", "veryfast",
            "-crf", "28",
            "-pix_fmt", "yuv420p",
            "-threads", "2",
            "-an",
            str(output_path)
        ]

        logger.info(f"Generating analysis proxy: {output_path}")
        res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode != 0:
            raise RuntimeError(f"FFmpeg proxy generation failed (code {res.returncode}): {res.stderr}")
        return output_path

    def normalize_video(self, input_path: Path, output_path: Path) -> Path:
        """
        Normalize video to constant 30fps H.264 MP4 with faststart.
        Provides frame-accurate seeking and prevents compositor memory leaks.
        """
        if not self.ffmpeg_path:
            raise RuntimeError("ffmpeg is not available on this system.")

        input_path = input_path.resolve()
        output_path = output_path.resolve()
        output_path.parent.mkdir(parents=True, exist_ok=True)

        cmd = [
            self.ffmpeg_path,
            "-y",
            "-i", str(input_path),
            "-c:v", "libx264",
            "-preset", "veryfast",
            "-crf", "18",
            "-r", "30",
            "-pix_fmt", "yuv420p",
            "-c:a", "aac",
            "-b:a", "192k",
            "-movflags", "+faststart",
            str(output_path)
        ]
        logger.info(f"Normalizing video to CFR MP4: {output_path}")
        res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode != 0:
            raise RuntimeError(f"FFmpeg video normalization failed (code {res.returncode}): {res.stderr}")
        return output_path

    def extract_audio_wav(self, input_path: Path, output_path: Path) -> Optional[Path]:
        """Extract clean 16kHz mono 16-bit PCM WAV for Whisper and acoustic analysis."""
        if not self.ffmpeg_path:
            raise RuntimeError("ffmpeg is not available on this system.")

        input_path = input_path.resolve()
        output_path = output_path.resolve()
        output_path.parent.mkdir(parents=True, exist_ok=True)

        cmd = [
            self.ffmpeg_path,
            "-y",
            "-i", str(input_path),
            "-vn",
            "-acodec", "pcm_s16le",
            "-ar", "16000",
            "-ac", "1",
            str(output_path)
        ]

        try:
            logger.info(f"Extracting 16kHz WAV audio: {output_path}")
            res = subprocess.run(cmd, capture_output=True, text=True)
            if res.returncode == 0 and output_path.exists() and output_path.stat().st_size > 44:
                return output_path
            else:
                logger.warning(f"Audio extraction produced empty or invalid WAV: {res.stderr}")
                return None
        except Exception as e:
            logger.warning(f"Failed to extract audio from {input_path}: {e}")
            return None

    def extract_representative_frames(
        self,
        input_path: Path,
        output_dir: Path,
        fps_rate: float = 0.5
    ) -> List[str]:
        """Extract representative preview frames at regular intervals (e.g., 1 frame every 2 seconds)."""
        if not self.ffmpeg_path:
            raise RuntimeError("ffmpeg is not available on this system.")

        input_path = input_path.resolve()
        output_dir = output_dir.resolve()
        output_dir.mkdir(parents=True, exist_ok=True)
        out_pattern = output_dir / "frame_%04d.jpg"

        cmd = [
            self.ffmpeg_path,
            "-y",
            "-i", str(input_path),
            "-vf", f"fps={fps_rate}",
            "-q:v", "3",
            str(out_pattern)
        ]

        try:
            logger.info(f"Extracting representative frames to {output_dir}")
            subprocess.run(cmd, capture_output=True, text=True, check=True)
            frames = sorted([str(p) for p in output_dir.glob("frame_*.jpg")])
            return frames
        except Exception as e:
            logger.warning(f"Failed to extract representative frames: {e}")
            return []

    def ingest(self, video_path: Path, project_id: str) -> Dict[str, Any]:
        """
        Main ingestion entrypoint.
        Preserves original, generates analysis proxy, extracts 16k WAV, and extracts frames.
        Uses deterministic project-specific paths under storage/projects/{project_id}/analysis/
        """
        video_path = video_path.resolve()
        if not video_path.exists():
            raise FileNotFoundError(f"Video file does not exist: {video_path}")

        # Ensure analysis target dir
        analysis_dir = (Path(settings.STORAGE_LOCAL_ROOT) / project_id / "analysis").resolve()
        analysis_dir.mkdir(parents=True, exist_ok=True)

        proxy_path = analysis_dir / "proxy_540p.mp4"
        audio_path = analysis_dir / "audio_16k.wav"
        frames_dir = analysis_dir / "frames"

        # 1. Probe original metadata
        meta = self.probe_media(video_path)

        # 2 & 3. Concurrently generate proxy and extract audio
        extracted_audio = None
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
            fut_proxy = executor.submit(self.generate_proxy, video_path, proxy_path)
            fut_audio = None
            if meta.get("has_audio"):
                fut_audio = executor.submit(self.extract_audio_wav, video_path, audio_path)

            fut_proxy.result()
            if fut_audio:
                extracted_audio = fut_audio.result()

        # If input is WebM or not a standard MP4, normalize it for seamless rendering
        normalized_path = video_path.parent / "normalized.mp4"
        if not normalized_path.exists() and (video_path.suffix.lower() == ".webm" or meta.get("video_codec") == "vp9"):
            try:
                self.normalize_video(video_path, normalized_path)
            except Exception as e:
                logger.warning(f"Failed to create normalized source MP4: {e}")

        # 4. Extract representative frames from proxy
        frames = self.extract_representative_frames(proxy_path, frames_dir, fps_rate=0.5)

        return {
            "metadata": meta,
            "proxy_path": str(proxy_path),
            "audio_path": str(extracted_audio) if extracted_audio else None,
            "frames": frames,
            "analysis_dir": str(analysis_dir)
        }

media_ingest = MediaIngestService()
