import asyncio
import os
import sys

sys.path.insert(0, os.path.abspath("."))

from apps.api.src.core.database import AsyncSessionLocal
from apps.api.src.models import Project, Job
from apps.api.src.services.pipeline_coordinator import run_full_pipeline
from sqlalchemy import select

async def main():
    project_id = "5af65ad7-fc15-46c9-90fc-f6c0e36460a9"
    async with AsyncSessionLocal() as session:
        # Find or create pipeline job
        j_stmt = select(Job).where(Job.project_id == project_id, Job.type == "pipeline")
        j_res = await session.execute(j_stmt)
        job = j_res.scalar_one_or_none()
        if not job:
            job = Job(project_id=project_id, type="pipeline", status="pending", progress=0)
            session.add(job)
            await session.commit()
            await session.refresh(job)
        job_id = job.id

    import logging
    logging.basicConfig(level=logging.INFO)
    print(f"Executing full pipeline for project {project_id}, job {job_id}...")
    res = await run_full_pipeline(
        project_id=project_id,
        job_id=job_id,
        target_duration=None,
        resolution="1080x1920",
        fps=30
    )
    print("PIPELINE RESULT:", res)

if __name__ == "__main__":
    asyncio.run(main())
