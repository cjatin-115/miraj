import os
import uuid
from pathlib import Path
from typing import BinaryIO, Union
from ..core.storage import get_storage_provider, StorageProvider

class StorageService:
    def __init__(self, provider: StorageProvider = None):
        self.provider = provider or get_storage_provider()

    def store_project_file(
        self,
        project_id: str,
        filename: str,
        file_content: Union[bytes, BinaryIO],
        subfolder: str = "media"
    ) -> str:
        """
        Store a file associated with a project in a structured path:
        <project_id>/<subfolder>/<unique_prefix>_<filename>
        """
        clean_filename = Path(filename).name.replace(" ", "_")
        unique_name = f"{uuid.uuid4().hex[:8]}_{clean_filename}"
        relative_path = f"{project_id}/{subfolder}/{unique_name}"
        return self.provider.save_file(file_content, relative_path)

    def get_file_bytes(self, relative_path: str) -> bytes:
        return self.provider.read_file(relative_path)

    def get_public_url(self, relative_path: str) -> str:
        return self.provider.get_url(relative_path)

    def get_absolute_path(self, relative_path: str) -> Path:
        return self.provider.get_absolute_path(relative_path)

storage_service = StorageService()
