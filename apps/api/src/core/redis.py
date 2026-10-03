import logging
from typing import Optional
import redis.asyncio as redis
from .config import settings

logger = logging.getLogger(__name__)

_redis_client: Optional[redis.Redis] = None

def get_redis_client() -> redis.Redis:
    global _redis_client
    if _redis_client is None:
        _redis_client = redis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            protocol=2 # Compatible with Redis 5, 6, and 7
        )
    return _redis_client

async def close_redis() -> None:
    global _redis_client
    if _redis_client is not None:
        await _redis_client.close()
        _redis_client = None

async def check_redis_health() -> dict:
    """Check Redis connectivity and return status details."""
    try:
        client = get_redis_client()
        pong = await client.ping()
        if pong:
            return {
                "status": "connected",
                "message": "Redis PING successful (PONG)"
            }
    except Exception as e:
        logger.warning(f"Redis health check failed: {e}")
        return {
            "status": "error",
            "message": str(e)
        }
    return {
        "status": "disconnected",
        "message": "No response from Redis"
    }

async def enqueue_video_job(job_id: str, job_type: str, project_id: str, payload: dict) -> bool:
    """Enqueue a job into Redis stream or list for workers."""
    try:
        client = get_redis_client()
        await client.lpush("miraaj:video_jobs", job_id)
        await client.hset(f"miraaj:job:{job_id}", mapping={
            "id": job_id,
            "project_id": project_id,
            "type": job_type,
            "status": "pending",
            "progress": "0"
        })
        return True
    except Exception as e:
        logger.error(f"Failed to enqueue job {job_id}: {e}")
        return False
