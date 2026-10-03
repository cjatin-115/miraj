import pytest
from apps.api.src.schemas.style import StyleConfigSchema

@pytest.mark.asyncio
async def test_styles_endpoint(client):
    response = await client.get("/api/v1/styles")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["id"] == "modern_creator_v1"

    # Validate against Schema
    style_obj = StyleConfigSchema.model_validate(data[0])
    assert style_obj.typography.fontSizes["hero"] == 96
    assert style_obj.captions.position == "bottom"
    assert style_obj.captions.highlightTextColor == "#FFE600"
    assert style_obj.safeAreas.top == 140
    assert style_obj.safeAreas.bottom == 240
