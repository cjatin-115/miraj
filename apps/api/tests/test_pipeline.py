import pytest
import sys
from pathlib import Path

# Add worker to sys.path
WORKER_ROOT = Path(__file__).resolve().parent.parent.parent.parent / "workers" / "video-worker"
if str(WORKER_ROOT) not in sys.path:
    sys.path.insert(0, str(WORKER_ROOT))

from src.worker import process_project_pipeline
from apps.api.src.services.project_service import project_service

@pytest.mark.asyncio
async def test_end_to_end_worker_pipeline(test_db):
    async with test_db() as session:
        # Create a test project
        project = await project_service.create_project(
            db=session,
            script_text="Miraaj transforms raw talking head videos into dynamic short form content. AI determines what happens. Code determines how it looks.",
            title="E2E Pipeline Test",
            style_id="modern_creator_v1"
        )
        assert project is not None
        assert project.script is not None
        project_id = project.id

    # Run the worker pipeline
    job_id = "test-job-e2e-1"
    await process_project_pipeline(job_id=job_id, project_id=project_id, session_factory=test_db)

    # Verify project status and generated models
    async with test_db() as session:
        loaded = await project_service.get_project(session, project_id)
        assert loaded is not None
        assert loaded.status == "ready"
        assert loaded.analysis is not None
        assert len(loaded.analysis.keywords) > 0
        assert loaded.edit_plan is not None
        assert len(loaded.edit_plan.scenes) > 0
        assert loaded.timeline is not None
        assert loaded.timeline.width == 1080
        assert loaded.timeline.height == 1920
        assert loaded.timeline.fps == 30
        assert len(loaded.timeline.scenes) > 0
