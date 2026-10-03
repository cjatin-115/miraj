import pytest
from apps.api.src.schemas.timeline import TimelineSchema

def test_timeline_schema_validation():
    sample_data = {
        "version": 1,
        "width": 1080,
        "height": 1920,
        "fps": 30,
        "durationInFrames": 300,
        "styleId": "modern_creator_v1",
        "scenes": [
            {
                "id": "scene-1",
                "type": "talking_head",
                "startFrame": 0,
                "durationInFrames": 90,
                "transitionIn": {"type": "fade", "durationInFrames": 6},
                "transitionOut": {"type": "cut", "durationInFrames": 0},
                "props": {
                    "videoSrc": "/media/test.mp4",
                    "zoomLevel": 1.0
                }
            },
            {
                "id": "scene-2",
                "type": "keyword_text",
                "startFrame": 90,
                "durationInFrames": 60,
                "props": {
                    "keywords": [{"text": "MIRAAJ", "highlight": True}]
                }
            }
        ],
        "audioTracks": [],
        "overlays": []
    }

    timeline = TimelineSchema.model_validate(sample_data)
    assert timeline.version == 1
    assert timeline.width == 1080
    assert timeline.height == 1920
    assert len(timeline.scenes) == 2
    assert timeline.scenes[0].type == "talking_head"

@pytest.mark.asyncio
async def test_timeline_endpoints(client):
    schema_res = await client.get("/api/v1/timelines/schema")
    assert schema_res.status_code == 200
    schema = schema_res.json()
    assert "properties" in schema
    assert "scenes" in schema["properties"]

    sample_res = await client.get("/api/v1/timelines/sample")
    assert sample_res.status_code == 200
    sample = sample_res.json()
    assert sample["version"] == 1
    assert sample["styleId"] == "modern_creator_v1"
    assert len(sample["scenes"]) > 0
