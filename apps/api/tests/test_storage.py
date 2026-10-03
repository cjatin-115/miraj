import pytest
import tempfile
import os
from pathlib import Path
from apps.api.src.core.storage import LocalStorageProvider

def test_local_storage_crud():
    with tempfile.TemporaryDirectory() as tmpdir:
        storage = LocalStorageProvider(root_dir=tmpdir)
        assert storage.is_healthy() is True

        # Save file
        test_data = b"Hello Miraaj Storage!"
        rel_path = "proj_1/video/test.txt"
        saved_path = storage.save_file(test_data, rel_path)
        assert saved_path == rel_path
        assert storage.file_exists(rel_path) is True

        # Read file
        read_data = storage.read_file(rel_path)
        assert read_data == test_data

        # Absolute path
        abs_p = storage.get_absolute_path(rel_path)
        assert abs_p.exists()

        # Delete file
        deleted = storage.delete_file(rel_path)
        assert deleted is True
        assert storage.file_exists(rel_path) is False

def test_storage_path_traversal_prevention():
    with tempfile.TemporaryDirectory() as tmpdir:
        storage = LocalStorageProvider(root_dir=tmpdir)
        with pytest.raises(ValueError):
            storage.save_file(b"bad", "../../../etc/passwd")
