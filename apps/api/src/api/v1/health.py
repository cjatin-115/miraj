from fastapi import APIRouter, status
from ...core.database import check_db_health
from ...core.redis import check_redis_health
from ...core.media import media_env
from ...core.storage import get_storage_provider
from ...schemas.health import HealthResponse

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("", response_model=HealthResponse, status_code=status.HTTP_200_OK)
async def get_health():
    db_health = await check_db_health()
    redis_health = await check_redis_health()
    storage_provider = get_storage_provider()
    storage_healthy = storage_provider.is_healthy()

    ffmpeg_healthy = media_env.is_valid

    # Determine overall status: Database, Local Storage, and FFmpeg are primary required engines.
    # Redis is an optional cache acceleration layer.
    is_healthy = (
        db_health.get("status") == "connected" and
        storage_healthy and
        ffmpeg_healthy
    )
    is_degraded = (
        db_health.get("status") == "connected" and
        storage_healthy and
        not ffmpeg_healthy
    )

    overall_status = "healthy" if is_healthy else ("degraded" if is_degraded else "unhealthy")

    return HealthResponse(
        status=overall_status,
        version="1.0.0",
        environment="development",
        services={
            "database": db_health,
            "redis": redis_health,
            "ffmpeg": {
                "available": ffmpeg_healthy,
                "version": media_env.ffmpeg_version,
                "path": media_env.ffmpeg_path
            },
            "storage": {
                "provider": "local",
                "root_writable": storage_healthy
            }
        }
    )
