import pytest
import io

@pytest.mark.asyncio
async def test_create_project_with_script(client):
    payload = {
        "script_text": "Welcome to Miraaj V1. This is a personal AI video generation pipeline.",
        "title": "Welcome Episode",
        "style_id": "modern_creator_v1"
    }
    response = await client.post("/api/v1/projects", data=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Welcome Episode"
    assert data["status"] == "draft"
    assert data["script"]["word_count"] > 5
    assert data["script"]["estimated_duration_seconds"] > 0
    project_id = data["id"]

    # Verify retrieval
    get_res = await client.get(f"/api/v1/projects/{project_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == project_id

@pytest.mark.asyncio
async def test_create_project_with_video_file(client):
    fake_video = io.BytesIO(b"FAKE_MP4_HEADER_DATA_123456789")
    payload = {
        "script_text": "This is a talking-head clip testing multipart upload.",
        "title": "Video Upload Test"
    }
    files = {
        "video": ("sample_webcam.mp4", fake_video, "video/mp4")
    }
    response = await client.post("/api/v1/projects", data=payload, files=files)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Video Upload Test"
    assert data["status"] == "processing"
    assert data["source_video"] is not None
    assert data["source_video"]["filename"] == "sample_webcam.mp4"
    assert len(data["jobs"]) >= 1

@pytest.mark.asyncio
async def test_create_project_empty_script_fails(client):
    payload = {
        "script_text": "   "
    }
    response = await client.post("/api/v1/projects", data=payload)
    assert response.status_code == 422
