import pytest
import pytest_asyncio
import tempfile
import os
import subprocess
from pathlib import Path
from unittest.mock import patch, AsyncMock

from apps.api.src.models import Project, TimelineModel
from apps.api.src.services.rendering.quality_checker import quality_checker
from apps.api.src.services.rendering.post_processor import post_processor


@pytest.mark.asyncio
async def test_rendering_resolution_validation(client):
    # Invalid resolution format should return validation error 422
    res = await client.post("/api/v1/rendering/projects/non_existent/render?resolution=800x600")
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_render_status_not_started(client, test_db):
    async with test_db() as session:
        proj = Project(
            id="proj_render_test",
            title="Render Test Proj",
            status="draft",
            style_id="modern_creator_v1",
        )
        session.add(proj)
        await session.commit()

    res = await client.get("/api/v1/rendering/projects/proj_render_test/status")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "not_started"
    assert data["progress"] == 0


@pytest.mark.asyncio
async def test_trigger_render_queued(client, test_db):
    async with test_db() as session:
        proj = Project(
            id="proj_render_trigger",
            title="Render Trigger Proj",
            status="draft",
            style_id="modern_creator_v1",
        )
        timeline = TimelineModel(
            id="tl_render_trigger",
            project_id="proj_render_trigger",
            version=1,
            width=1080,
            height=1920,
            fps=30,
            duration_in_frames=90,
            scenes=[],
            audio_tracks=[],
            overlays=[],
        )
        session.add(proj)
        session.add(timeline)
        await session.commit()

    with patch("apps.api.src.api.v1.rendering.execute_render_in_background", new_callable=AsyncMock):
        res = await client.post("/api/v1/rendering/projects/proj_render_trigger/render?resolution=1080x1920&fps=30")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "queued"
        assert "job_id" in data
        assert data["resolution"] == "1080x1920"


@pytest.mark.asyncio
async def test_quality_checker_validates_mp4():
    # Generate a tiny 1-second 1080x1920 synthetic mp4 with audio for testing QC
    with tempfile.TemporaryDirectory() as tmpdir:
        test_video = Path(tmpdir) / "test_qc.mp4"
        cmd = [
            "ffmpeg", "-y",
            "-f", "lavfi", "-i", "color=c=black:s=1080x1920:r=30:d=1",
            "-f", "lavfi", "-i", "sine=f=440:r=48000:d=1",
            "-c:v", "libx264", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "128k",
            str(test_video)
        ]
        ret = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        if ret.returncode == 0 and test_video.exists():
            qc_res = quality_checker.validate_video(
                video_path=str(test_video),
                expected_width=1080,
                expected_height=1920,
                expected_fps=30.0,
                expected_duration_seconds=1.0,
                require_audio=True,
            )
            assert qc_res["is_valid"] is True
            assert qc_res["metrics"]["width"] == 1080
            assert qc_res["metrics"]["height"] == 1920
            assert qc_res["metrics"]["fps"] == 30.0
            assert qc_res["metrics"]["has_audio"] is True
            assert qc_res["metrics"]["codec"] == "h264"


@pytest.mark.asyncio
async def test_post_processor_muxing():
    # Test audio muxing and faststart
    with tempfile.TemporaryDirectory() as tmpdir:
        raw_video = Path(tmpdir) / "raw.mp4"
        audio_file = Path(tmpdir) / "audio.wav"
        output_video = Path(tmpdir) / "output.mp4"

        # Create raw silent video
        cmd_v = [
            "ffmpeg", "-y",
            "-f", "lavfi", "-i", "color=c=blue:s=1080x1920:r=30:d=1",
            "-c:v", "libx264", "-pix_fmt", "yuv420p",
            str(raw_video)
        ]
        subprocess.run(cmd_v, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

        # Create audio file
        cmd_a = [
            "ffmpeg", "-y",
            "-f", "lavfi", "-i", "sine=f=1000:r=48000:d=1",
            str(audio_file)
        ]
        subprocess.run(cmd_a, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

        if raw_video.exists() and audio_file.exists():
            res_path = post_processor.mux_audio_and_video(
                video_path=str(raw_video),
                audio_path=str(audio_file),
                output_path=str(output_video),
            )
            assert Path(res_path).exists()
            assert Path(res_path).stat().st_size > 0

            # Verify muxed audio is present via probe
            meta = quality_checker.validate_video(
                video_path=res_path,
                expected_width=1080,
                expected_height=1920,
                require_audio=True,
            )
            assert meta["metrics"]["has_audio"] is True
