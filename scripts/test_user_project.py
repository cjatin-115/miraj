import asyncio
import os
import sys

sys.path.insert(0, os.path.abspath("."))

from apps.api.src.core.database import AsyncSessionLocal
from apps.api.src.models import Project, Job, Analysis, EditPlan, TimelineModel
from apps.api.src.api.v1.planning import generate_project_plan, compile_project_timeline
from apps.api.src.services.pipeline_coordinator import run_full_pipeline
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as session:
        project_id = "5af65ad7-fc15-46c9-90fc-f6c0e36460a9"
        p_res = await session.execute(select(Project).where(Project.id == project_id))
        p = p_res.scalar_one_or_none()
        print(f"Project: {p.id}, Status: {p.status}")
        
        j_res = await session.execute(select(Job).where(Job.project_id == project_id))
        for j in j_res.scalars().all():
            print(f"Job: {j.type}, status: {j.status}, progress: {j.progress}, error: {j.error_message}")
            
        a_res = await session.execute(select(Analysis).where(Analysis.project_id == project_id))
        a = a_res.scalar_one_or_none()
        print(f"Analysis exists: {bool(a)}")
        if a:
            print(f"Transcript data: {a.transcript_data}")
            print(f"Visual metrics: {bool(a.visual_metrics)}")
            print(f"Keywords: {a.keywords}")
            
        # Try running generate_project_plan now
        print("\n--- Testing generate_project_plan ---")
        try:
            plan = await generate_project_plan(project_id=project_id, target_duration=60, db=session)
            print(f"SUCCESS! Plan generated: {len(plan.scenes)} scenes, duration: {plan.duration}")
        except Exception as e:
            print(f"FAILED to generate plan: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
