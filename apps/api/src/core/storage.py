import os
import shutil
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Optional, Union, BinaryIO
import logging

from .config import settings

logger = logging.getLogger(__name__)

class StorageProvider(ABC):
    """Abstract base class for storage providers."""

    @abstractmethod
    def save_file(self, file_content: Union[bytes, BinaryIO], relative_path: str) -> str:
        """Save binary content and return the stored relative path."""
        pass

    @abstractmethod
    def read_file(self, relative_path: str) -> bytes:
        """Read and return binary content."""
        pass

    @abstractmethod
    def delete_file(self, relative_path: str) -> bool:
        """Delete file at relative path."""
        pass

    @abstractmethod
    def file_exists(self, relative_path: str) -> bool:
        """Check if file exists."""
        pass

    @abstractmethod
    def get_url(self, relative_path: str) -> str:
        """Get accessible URL or local path for the asset."""
        pass

    @abstractmethod
    def get_absolute_path(self, relative_path: str) -> Path:
        """Get absolute filesystem path for local processing."""
        pass

    @abstractmethod
    def is_healthy(self) -> bool:
        """Verify storage backend availability."""
        pass


class LocalStorageProvider(StorageProvider):
    """Local filesystem implementation of StorageProvider."""

    def __init__(self, root_dir: Optional[str] = None):
        self.root_dir = Path(root_dir or settings.STORAGE_LOCAL_ROOT).resolve()
        self.root_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"LocalStorageProvider initialized with root: {self.root_dir}")

    def _safe_resolve(self, relative_path: str) -> Path:
        # Normalize and prevent directory traversal
        clean_path = Path(relative_path).as_posix().lstrip("/")
        full_path = (self.root_dir / clean_path).resolve()
        if not str(full_path).startswith(str(self.root_dir)):
            raise ValueError(f"Path traversal detected: {relative_path}")
        return full_path

    def save_file(self, file_content: Union[bytes, BinaryIO], relative_path: str) -> str:
        target_path = self._safe_resolve(relative_path)
        target_path.parent.mkdir(parents=True, exist_ok=True)

        if isinstance(file_content, bytes):
            with open(target_path, "wb") as f:
                f.write(file_content)
        else:
            with open(target_path, "wb") as f:
                shutil.copyfileobj(file_content, f)

        logger.debug(f"Saved file to {target_path}")
        return relative_path

    def read_file(self, relative_path: str) -> bytes:
        target_path = self._safe_resolve(relative_path)
        if not target_path.exists():
            raise FileNotFoundError(f"File not found: {relative_path}")
        with open(target_path, "rb") as f:
            return f.read()

    def delete_file(self, relative_path: str) -> bool:
        target_path = self._safe_resolve(relative_path)
        if target_path.exists():
            target_path.unlink()
            return True
        return False

    def file_exists(self, relative_path: str) -> bool:
        return self._safe_resolve(relative_path).exists()

    def get_url(self, relative_path: str) -> str:
        # In V1 local development, expose via /api/v1/storage/{path} or direct static route
        clean_path = Path(relative_path).as_posix().lstrip("/")
        return f"/api/v1/storage/{clean_path}"

    def get_absolute_path(self, relative_path: str) -> Path:
        return self._safe_resolve(relative_path)

    def is_healthy(self) -> bool:
        try:
            test_file = self.root_dir / ".healthcheck_write_test"
            test_file.write_text("ok", encoding="utf-8")
            test_file.unlink()
            return True
        except Exception as e:
            logger.error(f"Storage healthcheck failed: {e}")
            return False


_storage_provider: Optional[StorageProvider] = None

def get_storage_provider() -> StorageProvider:
    global _storage_provider
    if _storage_provider is None:
        if settings.STORAGE_PROVIDER == "local":
            _storage_provider = LocalStorageProvider()
        else:
            # Future: S3StorageProvider
            _storage_provider = LocalStorageProvider()
    return _storage_provider
