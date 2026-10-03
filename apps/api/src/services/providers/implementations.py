"""
apps/api/src/services/providers/implementations.py

Concrete implementations of provider abstractions for Miraaj V1.
Local, free, deterministic implementations are prioritized.
External APIs are optional and never required.
"""

import os
import logging
from pathlib import Path
from typing import Dict, Any, Optional

from .base import (
    LLMProvider,
    TranscriptionProvider,
    StorageProvider,
    ImageProvider,
    VideoProvider
)
from ..director.mock_director import MockDirector
from ..director.providers import LocalLLMProvider, GeminiProvider
from ..analysis.transcriber import transcriber
from ..storage_service import storage_service
from ..rendering.remotion_engine import remotion_engine

logger = logging.getLogger(__name__)


class MockDirectorProvider(LLMProvider):
    """Deterministic local AI Director provider requiring zero external API keys."""

    def __init__(self):
        self.director = MockDirector()

    @property
    def is_available(self) -> bool:
        return True

    async def generate(self, prompt: str, schema: Optional[Dict[str, Any]] = None) -> str:
        # Generate valid mock EditPlan
        plan = self.director.create_plan(
            script_text=prompt,
            transcript={"words": []},
            video_analysis={},
            target_duration=60.0
        )
        return plan.model_dump_json()


class LocalWhisperProvider(TranscriptionProvider):
    """Local speech transcription provider using faster-whisper with deterministic fallback."""

    def __init__(self):
        self.transcriber_service = transcriber

    @property
    def is_available(self) -> bool:
        return True

    async def transcribe(self, audio_path: Optional[Path]) -> Dict[str, Any]:
        return self.transcriber_service.transcribe(audio_path)


class LocalStorageProvider(StorageProvider):
    """Local filesystem storage persistence provider."""

    def __init__(self):
        self.service = storage_service

    def save_bytes(self, relative_path: str, data: bytes) -> str:
        return self.service.save_file(relative_path, data)

    def get_absolute_path(self, relative_path: str) -> Path:
        return self.service.get_full_path(relative_path)

    def file_exists(self, relative_path: str) -> bool:
        return self.service.exists(relative_path)


class DeterministicImageProvider(ImageProvider):
    """
    Local deterministic visual asset provider.
    Generates SVGs and card graphics without requiring AI image generation APIs.
    """

    @property
    def is_available(self) -> bool:
        return True

    async def generate_image(
        self, prompt: str, style_id: str = "modern_creator_v1", width: int = 1080, height: int = 1920
    ) -> Dict[str, Any]:
        """Returns deterministic SVG metadata for creator visuals."""
        return {
            "type": "svg_card",
            "prompt": prompt,
            "style_id": style_id,
            "width": width,
            "height": height,
            "svg_data": f"""<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#07090E"/>
                <text x="50%" y="50%" fill="#FFE600" font-size="48" font-family="sans-serif" text-anchor="middle">{prompt[:40]}</text>
            </svg>"""
        }


class RemotionVideoProvider(VideoProvider):
    """Deterministic Remotion rendering provider."""

    def __init__(self):
        self.engine = remotion_engine

    async def render_timeline(
        self,
        timeline_dict: Dict[str, Any],
        project_id: str,
        source_audio_path: Optional[str] = None,
        resolution: str = "1080x1920",
        fps: int = 30,
        frame_range: Optional[tuple] = None,
        on_progress: Optional[Any] = None,
    ) -> Dict[str, Any]:
        return await self.engine.render_timeline(
            timeline_dict=timeline_dict,
            project_id=project_id,
            source_audio_path=source_audio_path,
            resolution=resolution,
            fps=fps,
            frame_range=frame_range,
            on_progress=on_progress,
        )


# Provider Registry & Factories
def get_llm_provider(name: Optional[str] = None) -> LLMProvider:
    provider_name = (name or os.getenv("LLM_PROVIDER", "mock")).lower()
    if provider_name == "gemini":
        gemini = GeminiProvider()
        if gemini.is_available:
            return gemini
        logger.warning("Gemini requested but GEMINI_API_KEY missing. Falling back to MockDirectorProvider.")
        return MockDirectorProvider()
    elif provider_name == "local":
        return LocalLLMProvider()
    return MockDirectorProvider()


def get_transcription_provider(name: Optional[str] = None) -> TranscriptionProvider:
    return LocalWhisperProvider()


def get_storage_provider() -> StorageProvider:
    return LocalStorageProvider()


def get_image_provider() -> ImageProvider:
    return DeterministicImageProvider()


def get_video_provider() -> VideoProvider:
    return RemotionVideoProvider()
