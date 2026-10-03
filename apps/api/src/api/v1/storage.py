import os
from pathlib import Path
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import FileResponse
from ...services.storage_service import storage_service

router = APIRouter(prefix="/storage", tags=["Storage"])

@router.get("/{file_path:path}")
async def serve_project_file(file_path: str):
    try:
        abs_path = storage_service.get_absolute_path(file_path)
        if not abs_path.exists() or not abs_path.is_file():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Stored asset file not found."
            )
        return FileResponse(
            path=str(abs_path),
            filename=abs_path.name
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to access file: {str(e)}"
        )
