import pytest
import io
import subprocess
import tempfile
from pathlib import Path
from unittest.mock import patch, AsyncMock

from apps.api.src.models import Project, SourceVideo, Script, EditPlan as EditPlanModel, TimelineModel, Job
from apps.api.src.services.pipeline_coordinator import run_full_pipeline


@pytest.mark.asyncio
async def test_full_pipeline_e2e_creation_and_execution(client, test_db):
    """
    End-to-end integration test verifying the full pipeline flow:
    Script + Video Upload -> Ingestion -> Analysis -> AI Director -> Timeline -> Scene Regeneration -> Status Tracking
    """
    # 1. Generate a synthetic 2-second talking-head MP4 for upload
    with tempfile.TemporaryDirectory() as tmpdir:
        synth_video = Path(tmpdir) / "webcam_e2e.mp4"
        cmd = [
            "ffmpeg", "-y",
            "-f", "lavfi", "-i", "color=c=navy:s=1080x1920:r=30:d=2",
            "-f", "lavfi", "-i", "sine=f=500:r=16000:d=2",
            "-c:v", "libx264", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "128k",
            str(synth_video)
        ]
        subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
        video_bytes = synth_video.read_bytes()

        # 2. Call POST /api/v1/projects with script + video
        script_content = "Miraaj automatically creates high impact short form video from raw webcam footage."
        response = await client.post(
            "/api/v1/projects",
            data={
                "title": "E2E Full Pipeline Project",
                "script_text": script_content,
                "style_id": "modern_creator_v1"
            },
            files={"video": ("webcam_test.mp4", io.BytesIO(video_bytes), "video/mp4")}
        )
        assert response.status_code == 201
        project_data = response.json()
        project_id = project_data["id"]
        assert project_data["title"] == "E2E Full Pipeline Project"
        assert project_data["status"] in ["processing", "draft"]
        assert project_data["source_video"] is not None
        assert project_data["script"]["word_count"] > 5

        # 3. Test starting the pipeline via POST /api/v1/projects/{project_id}/start-pipeline
        with patch("apps.api.src.services.pipeline_coordinator.execute_render_in_background", new_callable=AsyncMock) as mock_render:
            pipe_res = await client.post(f"/api/v1/projects/{project_id}/start-pipeline?sync=true&target_duration=60")
            assert pipe_res.status_code in [200, 202]
            pipe_data = pipe_res.json()
            assert pipe_data["job_id"] is not None

        # 4. Verify Analysis, EditPlan, and Timeline were generated and persisted
        plan_res = await client.get(f"/api/v1/planning/projects/{project_id}/plan")
        assert plan_res.status_code == 200
        plan = plan_res.json()
        assert len(plan["scenes"]) > 0
        assert plan["version"] >= 1
        first_scene_id = plan["scenes"][0]["id"]

        tl_res = await client.get(f"/api/v1/planning/projects/{project_id}/timeline")
        assert tl_res.status_code == 200
        timeline = tl_res.json()
        assert len(timeline["scenes"]) > 0
        assert timeline["width"] == 1080
        assert timeline["height"] == 1920
        assert timeline["fps"] == 30

        # 5. Test Scene Regeneration in-place without altering other scenes
        regen_res = await client.post(
            f"/api/v1/planning/projects/{project_id}/scenes/{first_scene_id}/regenerate",
            json={"crop_scale": 1.35, "transition_type": "zoom"}
        )
        assert regen_res.status_code == 200
        regen_data = regen_res.json()
        assert regen_data["status"] == "success"
        assert regen_data["updated_plan_scene"]["crop"]["scale"] == 1.35
        assert regen_data["updated_timeline_scene"]["props"]["zoomLevel"] == 1.35

        # 6. Test Render 4K request triggers correctly
        with patch("apps.api.src.api.v1.rendering.execute_render_in_background", new_callable=AsyncMock):
            r4k_res = await client.post(f"/api/v1/rendering/projects/{project_id}/render?resolution=2160x3840&fps=30")
            assert r4k_res.status_code == 200
            assert r4k_res.json()["resolution"] == "2160x3840"
