"""
apps/api/src/services/providers/base.py

Core abstract provider interfaces for Miraaj V1.
Ensures loose coupling, deterministic local defaults, and zero mandatory external API keys.
"""

from abc import ABC, abstractmethod
from pathlib import Path
from typing import Dict, Any, Optional, List


class LLMProvider(ABC):
    """Abstract interface for LLM text/structured generation."""

    @property
    @abstractmethod
    def is_available(self) -> bool:
        """Returns True if the provider is configured and reachable."""
        pass

    @abstractmethod
    async def generate(self, prompt: str, schema: Optional[Dict[str, Any]] = None) -> str:
        """Generates a text completion or JSON string given a prompt."""
        pass


class TranscriptionProvider(ABC):
    """Abstract interface for speech-to-text with word-level timestamps."""

    @property
    @abstractmethod
    def is_available(self) -> bool:
        pass

    @abstractmethod
    async def transcribe(self, audio_path: Optional[Path]) -> Dict[str, Any]:
        """
        Transcribes speech audio into word-level timestamps.
        Returns: {"text": str, "words": [{"word": str, "start": float, "end": float}], "language": str}
        """
        pass


class StorageProvider(ABC):
    """Abstract interface for media and artifact file persistence."""

    @abstractmethod
    def save_bytes(self, relative_path: str, data: bytes) -> str:
        pass

    @abstractmethod
    def get_absolute_path(self, relative_path: str) -> Path:
        pass

    @abstractmethod
    def file_exists(self, relative_path: str) -> bool:
        pass


class ImageProvider(ABC):
    """
    Abstract interface for visual asset generation.
    Priority:
    1. Deterministic React/Remotion SVG/Canvas component
    2. Local placeholder / existing asset
    3. Optional external image generation
    """

    @property
    @abstractmethod
    def is_available(self) -> bool:
        pass

    @abstractmethod
    async def generate_image(
        self, prompt: str, style_id: str = "modern_creator_v1", width: int = 1080, height: int = 1920
    ) -> Dict[str, Any]:
        """Returns visual asset metadata or path."""
        pass


class VideoProvider(ABC):
    """
    Abstract interface for video rendering and composition.
    Primary: Deterministic Remotion rendering engine.
    """

    @abstractmethod
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
        pass
