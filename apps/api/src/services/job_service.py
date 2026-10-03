import logging
from typing import Optional, Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models import Job
from ..core.redis import enqueue_video_job

logger = logging.getLogger(__name__)

class JobService:
    async def create_job(
        self,
        db: AsyncSession,
        project_id: str,
        job_type: str,
        payload: Optional[Dict[str, Any]] = None,
        stage_message: Optional[str] = "Job initiated"
    ) -> Job:
        job = Job(
            project_id=project_id,
            type=job_type,
            status="pending",
            progress=0,
            stage_message=stage_message,
            payload=payload or {}
        )
        db.add(job)
        await db.commit()
        await db.refresh(job)

        # Enqueue in Redis
        try:
            await enqueue_video_job(job.id, job.type, project_id, payload or {})
        except Exception as e:
            logger.warning(f"Could not enqueue job {job.id} to Redis: {e}")

        return job

    async def update_job(
        self,
        db: AsyncSession,
        job_id: str,
        status: Optional[str] = None,
        progress: Optional[int] = None,
        stage_message: Optional[str] = None,
        error_message: Optional[str] = None,
        result: Optional[Dict[str, Any]] = None
    ) -> Optional[Job]:
        query = select(Job).where(Job.id == job_id)
        res = await db.execute(query)
        job = res.scalar_one_or_none()
        if not job:
            return None

        if status is not None:
            job.status = status
        if progress is not None:
            job.progress = progress
        if stage_message is not None:
            job.stage_message = stage_message
        if error_message is not None:
            job.error_message = error_message
        if result is not None:
            job.result = result

        await db.commit()
        await db.refresh(job)
        return job

    async def get_job(self, db: AsyncSession, job_id: str) -> Optional[Job]:
        query = select(Job).where(Job.id == job_id)
        res = await db.execute(query)
        return res.scalar_one_or_none()

    async def list_jobs(
        self,
        db: AsyncSession,
        project_id: Optional[str] = None,
        limit: int = 50
    ) -> List[Job]:
        query = select(Job)
        if project_id:
            query = query.where(Job.project_id == project_id)
        query = query.order_by(Job.created_at.desc()).limit(limit)
        res = await db.execute(query)
        return list(res.scalars().all())

job_service = JobService()
