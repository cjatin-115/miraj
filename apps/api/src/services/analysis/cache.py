import os
import json
import hashlib
import logging
from pathlib import Path
from typing import Optional, Dict, Any

from ...core.config import settings

logger = logging.getLogger(__name__)

class AnalysisCache:
    def __init__(self, cache_dir: Optional[Path] = None):
        if cache_dir is None:
            self.cache_dir = Path(settings.STORAGE_LOCAL_ROOT) / ".cache" / "analysis"
        else:
            self.cache_dir = cache_dir
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    @staticmethod
    def compute_file_hash(file_path: Path) -> str:
        """Compute SHA-256 hash of a file efficiently by streaming chunks."""
        hasher = hashlib.sha256()
        with open(file_path, "rb") as f:
            while chunk := f.read(65536):
                hasher.update(chunk)
        return hasher.hexdigest()

    @staticmethod
    def compute_text_hash(text: str) -> str:
        """Compute SHA-256 hash of normalized text."""
        normalized = text.strip().encode("utf-8")
        return hashlib.sha256(normalized).hexdigest()

    @classmethod
    def compute_content_hash(cls, video_path: Optional[Path], script_text: str) -> str:
        """Combine video content hash and script text hash into a single unique key."""
        script_hash = cls.compute_text_hash(script_text)
        if video_path and video_path.exists():
            video_hash = cls.compute_file_hash(video_path)
        else:
            video_hash = "no_video"
        
        combined = f"{video_hash}:{script_hash}".encode("utf-8")
        return hashlib.sha256(combined).hexdigest()

    def get(self, content_hash: str) -> Optional[Dict[str, Any]]:
        """Retrieve cached analysis if it exists."""
        cache_file = self.cache_dir / f"{content_hash}.json"
        if not cache_file.exists():
            return None
        
        try:
            with open(cache_file, "r", encoding="utf-8") as f:
                data = json.load(f)
            logger.info(f"Analysis cache hit for hash: {content_hash}")
            return data
        except Exception as e:
            logger.warning(f"Failed to read cache file {cache_file}: {e}")
            return None

    def set(self, content_hash: str, data: Dict[str, Any]) -> None:
        """Store analysis result in cache."""
        cache_file = self.cache_dir / f"{content_hash}.json"
        try:
            with open(cache_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            logger.info(f"Cached analysis result saved: {content_hash}")
        except Exception as e:
            logger.error(f"Failed to write cache file {cache_file}: {e}")

    def invalidate(self, content_hash: str) -> bool:
        """Invalidate a specific cache entry."""
        cache_file = self.cache_dir / f"{content_hash}.json"
        if cache_file.exists():
            cache_file.unlink()
            return True
        return False

analysis_cache = AnalysisCache()
