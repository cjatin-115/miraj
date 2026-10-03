import asyncio
import os
import sys

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath("."))

from apps.api.src.core.database import AsyncSessionLocal
from apps.api.src.models import Project, Job, SourceVideo, Analysis, EditPlan, TimelineModel
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as session:
        p_res = await session.execute(select(Project).order_by(Project.created_at.desc()).limit(1))
        p = p_res.scalar_one_or_none()
        if not p:
            print("No project found")
            return
        
        print(f"LATEST PROJECT: {p.id} [{p.status}] - {p.title}")
        
        j_res = await session.execute(select(Job).where(Job.project_id == p.id).order_by(Job.created_at.desc()))
        for j in j_res.scalars().all():
            print(f"JOB: {j.type} | {j.status} | {j.progress}% | {j.stage_message} | Error: {j.error_message}")
            
        a_res = await session.execute(select(Analysis).where(Analysis.project_id == p.id))
        a = a_res.scalar_one_or_none()
        if a:
            print(f"ANALYSIS: Record exists! Has visual_metrics: {bool(a.visual_metrics)}, Has transcript: {bool(a.transcript_data)}")
            if a.transcript_data:
                words = a.transcript_data.get("words", [])
                print(f"  Transcript words count: {len(words)}")
                if words:
                    print(f"  First word: {words[0]}, Last word: {words[-1]}")
        else:
            print("ANALYSIS: None found")
            
        ep_res = await session.execute(select(EditPlan).where(EditPlan.project_id == p.id))
        ep = ep_res.scalar_one_or_none()
        print(f"EDIT PLAN: {'Exists' if ep else 'None'}")
        
        tl_res = await session.execute(select(TimelineModel).where(TimelineModel.project_id == p.id))
        tl = tl_res.scalar_one_or_none()
        print(f"TIMELINE: {'Exists' if tl else 'None'}")

if __name__ == "__main__":
    asyncio.run(main())
