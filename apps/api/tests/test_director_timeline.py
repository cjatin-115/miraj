import pytest
import json
from httpx import AsyncClient

from apps.api.src.schemas.director import DirectorInput, EditPlan, ScenePlan, CropConfig, TransitionConfig, AssetRequest
from apps.api.src.schemas.timeline import TimelineSchema
from apps.api.src.services.director.mock_director import mock_director
from apps.api.src.services.director.repair import repair_and_parse_edit_plan, clean_json_string
from apps.api.src.services.director.quality_rules import quality_validator
from apps.api.src.services.timeline.builder import timeline_builder

@pytest.fixture
def sample_director_input():
    script = (
        "Stop editing your short-form videos manually!\n\n"
        "Traditional video editing takes 5x longer and costs over $500 every single week.\n\n"
        "Miraaj is better than manual editors because our Python API automates 95% of the workflow.\n\n"
        "The SECRET is our deterministic rendering engine. This is a MASSIVE game-changer.\n\n"
        "Subscribe and follow for more AI video automation tutorials!"
    )
    return DirectorInput(
        script=script,
        transcript={
            "text": script,
            "words": [
                {"word": "Stop", "start": 0.0, "end": 0.4},
                {"word": "editing", "start": 0.4, "end": 0.8},
                {"word": "videos", "start": 0.8, "end": 1.2},
                {"word": "Traditional", "start": 2.5, "end": 3.0},
                {"word": "5x", "start": 3.2, "end": 3.6},
                {"word": "Miraaj", "start": 6.0, "end": 6.5},
                {"word": "SECRET", "start": 10.0, "end": 10.5},
                {"word": "Subscribe", "start": 14.0, "end": 14.6}
            ]
        },
        script_analysis={
            "candidate_visual_moments": [
                {"sentence_index": 1, "type": "statistics", "data": ["5x", "$500"], "recommended_scene": "statistics"},
                {"sentence_index": 2, "type": "comparison", "data": ["better than"], "recommended_scene": "comparison"},
                {"sentence_index": 3, "type": "code", "data": ["Python", "API"], "recommended_scene": "code"}
            ],
            "candidate_emphasis_words": ["SECRET", "MASSIVE", "5X"]
        },
        video_metadata={"width": 1080, "height": 1920, "fps": 30.0, "duration": 45.0},
        target_duration=45.0,
        style_id="modern_creator_v1"
    )

@pytest.mark.asyncio
async def test_mock_director_valid_output(sample_director_input):
    plan = await mock_director.create_edit_plan(sample_director_input)

    assert isinstance(plan, EditPlan)
    assert plan.version == 1
    assert abs(plan.duration - 45.0) < 0.5
    assert len(plan.scenes) >= 5

    # Check opening hook scene
    hook_scene = plan.scenes[0]
    assert hook_scene.type in {"talking_head_zoom", "talking_head"}
    if hook_scene.type == "talking_head_zoom":
        assert hook_scene.crop is not None
        assert hook_scene.crop.scale > 1.1

    # Check structured asset requests generated
    scene_types = [s.type for s in plan.scenes]
    assert "statistics" in scene_types or "comparison" in scene_types or "cta" in scene_types

    stats_scene = next((s for s in plan.scenes if s.type == "statistics"), None)
    if stats_scene:
        assert stats_scene.asset_request is not None
        assert stats_scene.asset_request.type == "statistics"

@pytest.mark.asyncio
async def test_mock_director_determinism(sample_director_input):
    plan_a = await mock_director.create_edit_plan(sample_director_input)
    plan_b = await mock_director.create_edit_plan(sample_director_input)

    assert plan_a.model_dump() == plan_b.model_dump()

def test_repair_malformed_json():
    # 1. Wrapped in markdown codeblocks and trailing comma
    raw_markdown = """```json
    {
      "version": 1,
      "duration": 30.0,
      "scenes": [
        {
          "id": "scene_001",
          "type": "stat",
          "duration": 5.0,
          "source_start": 0.0,
        }
      ],
    }
    ```"""
    repaired = repair_and_parse_edit_plan(raw_markdown)
    assert repaired is not None
    assert repaired.duration == 30.0
    assert len(repaired.scenes) == 1
    # Check alias mapping: 'stat' -> 'statistics'
    assert repaired.scenes[0].type == "statistics"

    # 2. Invalid scene type falls back to talking_head
    raw_invalid_type = """{
      "version": 1,
      "duration": 10.0,
      "scenes": [
        {"id": "sc1", "type": "totally_unknown_custom_3d_engine", "duration": 4.0}
      ]
    }"""
    repaired_invalid = repair_and_parse_edit_plan(raw_invalid_type)
    assert repaired_invalid is not None
    assert repaired_invalid.scenes[0].type == "talking_head"

def test_timeline_builder_normalization(sample_director_input):
    plan = EditPlan(
        version=1,
        duration=15.0,
        scenes=[
            ScenePlan(id="sc1", type="talking_head", duration=5.0, source_start=0.0, source_end=5.0),
            ScenePlan(id="sc2", type="talking_head_zoom", duration=4.0, source_start=5.0, source_end=9.0),
            ScenePlan(id="sc3", type="statistics", duration=6.0, source_start=9.0, source_end=15.0,
                      asset_request=AssetRequest(type="statistics", data={"statNumber": "95%", "statLabel": "Faster"}))
        ]
    )

    timeline = timeline_builder.build_timeline(
        edit_plan=plan,
        video_url="/storage/test_video.mp4",
        source_duration_seconds=45.0,
        project_id="test_project_timeline"
    )

    assert isinstance(timeline, TimelineSchema)
    assert timeline.width == 1080
    assert timeline.height == 1920
    assert timeline.fps == 30
    assert timeline.durationInFrames == 450 # 15s * 30fps

    # Ensure contiguous frames without gaps or overlaps
    scenes = timeline.scenes
    assert len(scenes) == 3
    assert scenes[0].startFrame == 0
    assert scenes[0].durationInFrames == 150
    assert scenes[1].startFrame == 150
    assert scenes[1].durationInFrames == 120
    assert scenes[2].startFrame == 270
    assert scenes[2].durationInFrames == 180

    # Ensure metadata has safe areas
    assert "safeAreas" in timeline.metadata
    assert timeline.metadata["safeAreas"]["top"] == 140

def test_timeline_builder_asset_resolution():
    plan = EditPlan(
        version=1,
        duration=10.0,
        scenes=[
            ScenePlan(
                id="sc1",
                type="comparison",
                duration=5.0,
                asset_request=AssetRequest(
                    type="comparison",
                    data={
                        "leftTitle": "Before",
                        "leftPoints": ["Slow"],
                        "rightTitle": "After",
                        "rightPoints": ["Fast"],
                        "winner": "right"
                    }
                )
            ),
            ScenePlan(
                id="sc2",
                type="code",
                duration=5.0,
                asset_request=AssetRequest(
                    type="code",
                    data={"code": "import miraaj", "language": "python"}
                )
            )
        ]
    )

    timeline = timeline_builder.build_timeline(plan)
    assert timeline.scenes[0].props["leftTitle"] == "Before"
    assert timeline.scenes[0].props["winner"] == "right"
    assert timeline.scenes[1].props["language"] == "python"
    assert timeline.scenes[1].props["code"] == "import miraaj"

def test_timeline_caption_alignment():
    plan = EditPlan(
        version=1,
        duration=10.0,
        scenes=[
            ScenePlan(id="sc1", type="talking_head", duration=5.0, script_slice="Hello world"),
            ScenePlan(id="sc2", type="talking_head", duration=5.0, script_slice="Miraaj AI")
        ]
    )

    words = [
        {"word": "Hello", "start": 0.5, "end": 1.0},
        {"word": "world", "start": 1.2, "end": 2.0},
        {"word": "Miraaj", "start": 5.5, "end": 6.2},
        {"word": "AI", "start": 6.5, "end": 7.0}
    ]

    timeline = timeline_builder.build_timeline(plan, transcript_words=words)
    sc1_captions = timeline.scenes[0].props.get("captionWords", [])
    sc2_captions = timeline.scenes[1].props.get("captionWords", [])

    assert len(sc1_captions) == 2
    assert sc1_captions[0]["word"] == "Hello"
    assert sc1_captions[0]["startFrame"] >= 0

    assert len(sc2_captions) == 2
    assert sc2_captions[0]["word"] == "Miraaj"
    # Relative startFrame within scene 2
    assert sc2_captions[0]["startFrame"] == int(round((5.5 - 5.0) * 30))

def test_quality_validator_rules():
    # Valid plan
    valid_plan = EditPlan(
        version=1,
        duration=30.0,
        scenes=[
            ScenePlan(id="sc1", type="talking_head", duration=6.0, script_slice="Quick intro hook."),
            ScenePlan(id="sc2", type="statistics", duration=4.0, script_slice="Stats show 90% boost."),
            ScenePlan(id="sc3", type="talking_head_zoom", duration=5.0, crop=CropConfig(scale=1.2)),
            ScenePlan(id="sc4", type="cta", duration=5.0, script_slice="Follow for more.")
        ]
    )
    v_res = quality_validator.validate(valid_plan)
    assert v_res["is_valid"] is True
    assert v_res["score"] >= 0.85

    # Excessive text and fast reading rate
    excessive_text = "word " * 45
    bad_plan = EditPlan(
        version=1,
        duration=5.0,
        scenes=[
            ScenePlan(id="sc1", type="editorial_text", duration=3.0, script_slice=excessive_text)
        ]
    )
    bad_res = quality_validator.validate(bad_plan)
    assert any("excessive text" in w.lower() for w in bad_res["warnings"])
    assert any("fast" in w.lower() for w in bad_res["warnings"])

@pytest.mark.asyncio
async def test_target_duration_adaptation(sample_director_input):
    for target in [45.0, 60.0, 70.0]:
        sample_director_input.target_duration = target
        plan = await mock_director.create_edit_plan(sample_director_input)
        assert abs(plan.duration - target) < 1.0

        timeline = timeline_builder.build_timeline(plan)
        expected_frames = int(round(target * 30))
        assert abs(timeline.durationInFrames - expected_frames) <= 30

@pytest.mark.asyncio
async def test_director_and_timeline_api_endpoints(client: AsyncClient):
    # 1. Create project
    proj_r = await client.post("/api/v1/projects", data={
        "title": "Director & Timeline Test Project",
        "script_text": (
            "Stop wasting time editing videos! "
            "Traditional editing costs $500 a week. "
            "Miraaj is better than manual tools because code renders everything. "
            "Follow and subscribe for more tutorials."
        )
    })
    assert proj_r.status_code == 201
    proj_id = proj_r.json()["id"]

    # 2. Generate EditPlan via AI Director endpoint
    plan_r = await client.post(f"/api/v1/planning/projects/{proj_id}/plan?target_duration=45")
    assert plan_r.status_code == 200
    plan_data = plan_r.json()
    assert plan_data["version"] == 1
    assert abs(plan_data["duration"] - 45.0) < 1.0
    assert len(plan_data["scenes"]) >= 3

    # 3. Retrieve EditPlan via GET
    get_plan_r = await client.get(f"/api/v1/planning/projects/{proj_id}/plan")
    assert get_plan_r.status_code == 200
    assert get_plan_r.json()["duration"] == plan_data["duration"]

    # 4. Compile Timeline via endpoint
    timeline_r = await client.post(f"/api/v1/planning/projects/{proj_id}/timeline")
    assert timeline_r.status_code == 200
    timeline_data = timeline_r.json()
    assert timeline_data["width"] == 1080
    assert timeline_data["height"] == 1920
    assert timeline_data["fps"] == 30
    assert len(timeline_data["scenes"]) == len(plan_data["scenes"])

    # 5. Retrieve Timeline via GET
    get_tl_r = await client.get(f"/api/v1/planning/projects/{proj_id}/timeline")
    assert get_tl_r.status_code == 200
    assert get_tl_r.json()["durationInFrames"] == timeline_data["durationInFrames"]

    # 6. Regenerate single scene via POST /projects/{id}/scenes/{scene_id}/regenerate
    first_scene_id = plan_data["scenes"][0]["id"]
    regen_r = await client.post(
        f"/api/v1/planning/projects/{proj_id}/scenes/{first_scene_id}/regenerate",
        json={"crop_scale": 1.35, "transition_type": "zoom"}
    )
    assert regen_r.status_code == 200
    regen_data = regen_r.json()
    assert regen_data["status"] == "success"
    assert regen_data["scene_id"] == first_scene_id
    assert regen_data["updated_plan_scene"]["crop"]["scale"] == 1.35
    assert regen_data["updated_timeline_scene"]["transitionIn"]["type"] == "zoom"
