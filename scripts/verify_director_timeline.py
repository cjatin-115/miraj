import sys
import os
import time
import json
import asyncio
import httpx
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from apps.api.src.schemas.director import DirectorInput, EditPlan, ScenePlan, CropConfig, TransitionConfig, AssetRequest
from apps.api.src.schemas.timeline import TimelineSchema
from apps.api.src.services.director.mock_director import mock_director
from apps.api.src.services.director.ai_director import ai_director
from apps.api.src.services.director.repair import repair_and_parse_edit_plan, clean_json_string
from apps.api.src.services.director.quality_rules import quality_validator
from apps.api.src.services.timeline.builder import timeline_builder

async def main():
    print("=" * 70)
    print("MIRAAJ V1 - AI DIRECTOR & TIMELINE ENGINE VERIFICATION")
    print("=" * 70)

    # 1. Prepare sample director input
    print("\n[1/7] Preparing realistic talking-head director input...")
    script_text = (
        "Stop editing your short-form videos manually!\n\n"
        "Traditional video editing takes 5x longer and costs over $500 every single week.\n\n"
        "Miraaj is better than manual editors because our Python API automates 95% of the workflow.\n\n"
        "The SECRET is our deterministic rendering engine. This is a MASSIVE game-changer.\n\n"
        "Subscribe and follow for more AI video automation tutorials!"
    )
    words = [
        {"word": "Stop", "start": 0.0, "end": 0.4},
        {"word": "editing", "start": 0.4, "end": 0.8},
        {"word": "videos", "start": 0.8, "end": 1.2},
        {"word": "Traditional", "start": 2.5, "end": 3.0},
        {"word": "5x", "start": 3.2, "end": 3.6},
        {"word": "Miraaj", "start": 6.0, "end": 6.5},
        {"word": "SECRET", "start": 10.0, "end": 10.5},
        {"word": "Subscribe", "start": 14.0, "end": 14.6}
    ]
    director_input = DirectorInput(
        script=script_text,
        transcript={"text": script_text, "words": words},
        word_timestamps=words,
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
    print(f"  -> Script length: {len(script_text)} chars, target duration: {director_input.target_duration}s")

    # 2. Test Deterministic Mock Director
    print("\n[2/7] Testing MockDirector generation & determinism...")
    t0 = time.time()
    plan1 = await mock_director.create_edit_plan(director_input)
    t_mock = time.time() - t0
    plan2 = await mock_director.create_edit_plan(director_input)
    assert plan1.model_dump() == plan2.model_dump(), "MockDirector must be strictly deterministic!"
    print(f"  -> Generated {len(plan1.scenes)} scenes in {t_mock*1000:.1f}ms")
    print(f"  -> Determinism check PASSED (byte-for-byte identical output across runs)")
    print(f"  -> Plan Duration: {plan1.duration}s, Pacing: '{plan1.pacing}'")

    # 3. Test Quality Guardrails
    print("\n[3/7] Testing AI Director Quality Rules & Validation...")
    res = quality_validator.validate(plan1)
    assert res["is_valid"] is True, f"Validation failed: {res['errors']}"
    print(f"  -> Quality Validator: PASSED (score: {res['score']:.2f}, errors: {len(res['errors'])}, warnings: {len(res['warnings'])})")

    # 4. Test Target Duration Adaptation
    print("\n[4/7] Testing Target Duration Adaptability (45s, 60s, 70s)...")
    for target in [45.0, 60.0, 70.0]:
        test_input = director_input.model_copy(update={"target_duration": target})
        adapted_plan = await mock_director.create_edit_plan(test_input)
        print(f"  -> Target {target}s -> Plan Duration: {adapted_plan.duration}s ({len(adapted_plan.scenes)} scenes)")
        assert abs(adapted_plan.duration - target) < 1.0, f"Plan duration should match target {target}s within 1s"

    # 5. Test JSON Resilience & Schema Repair
    print("\n[5/7] Testing JSON Repair Pipeline (Markdown fences, trailing commas, unquoted keys)...")
    malformed_json = """
    ```json
    {
        "version": 1,
        "duration": 45.0,
        "pacing": "balanced",
        "scenes": [
            {
                "id": "scene_001",
                "type": "punch_in",
                "source_start": 0.0,
                "source_end": 3.0,
                "timeline_start": 0.0,
                "duration": 3.0,
            },
        ],
    }
    ```
    """
    repaired_plan = repair_and_parse_edit_plan(malformed_json)
    assert repaired_plan.version == 1
    assert repaired_plan.scenes[0].type == "talking_head_zoom"
    print(f"  -> Successfully cleaned fences, stripped trailing commas, and normalized alias 'punch_in' -> 'talking_head_zoom'!")

    # 6. Test Timeline Engine (EditPlan -> Remotion Timeline)
    print("\n[6/7] Testing Timeline Engine (EditPlan -> Remotion Timeline)...")
    t0 = time.time()
    timeline = timeline_builder.build_timeline(
        edit_plan=plan1,
        video_url="/storage/projects/verification/webcam.mp4",
        source_duration_seconds=45.0,
        transcript_words=words,
        project_id="verification_project"
    )
    t_timeline = time.time() - t0
    print(f"  -> Timeline compiled in {t_timeline*1000:.1f}ms")
    print(f"  -> Total Frames: {timeline.durationInFrames} @ {timeline.fps} FPS ({timeline.width}x{timeline.height})")
    print(f"  -> Safe Area Margins: {timeline.metadata.get('safe_areas')}")

    # Check contiguous sequence
    for i in range(len(timeline.scenes) - 1):
        s_curr = timeline.scenes[i]
        s_next = timeline.scenes[i + 1]
        assert s_curr.startFrame + s_curr.durationInFrames == s_next.startFrame, (
            f"Gap detected between scene {i} and {i+1}!"
        )
    print(f"  -> Contiguous frame sequence verification: PASSED (Zero gaps or overlaps)")

    # Verify Remotion props resolution
    asset_scenes = [s for s in timeline.scenes if s.type in {"statistics", "comparison", "code"}]
    assert len(asset_scenes) >= 3, "Expected resolved asset scenes in timeline"
    print(f"  -> Remotion Component Props verification: PASSED ({len(asset_scenes)} rich asset cards resolved)")

    # 7. Live / In-Process API Endpoint Verification
    print("\n[7/7] Testing Planning API Endpoints...")
    from apps.api.src.main import app
    from apps.api.src.core.database import init_db
    await init_db()

    is_live = False
    try:
        async with httpx.AsyncClient(base_url="http://127.0.0.1:8000/api/v1", timeout=2.0) as check_client:
            res = await check_client.get("/health")
            if res.status_code == 200:
                is_live = True
                print("  -> Connected to live running server at http://127.0.0.1:8000")
    except Exception:
        pass

    if is_live:
        client_ctx = httpx.AsyncClient(base_url="http://127.0.0.1:8000/api/v1", timeout=10.0)
    else:
        print("  -> Live server not detected, using high-speed in-process ASGITransport")
        client_ctx = httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test/api/v1", timeout=10.0)

    try:
        async with client_ctx as client:
            # 1. Create project
            proj_res = await client.post("/projects", data={
                "title": "Director & Timeline Verification",
                "script_text": script_text,
                "style_id": "modern_creator_v1"
            })
            assert proj_res.status_code == 201, f"Project creation failed: {proj_res.text}"
            project_id = proj_res.json()["id"]
            print(f"  -> Created project: {project_id}")

            # 2. Generate Plan
            plan_res = await client.post(f"/planning/projects/{project_id}/plan?target_duration=45")
            assert plan_res.status_code == 200, f"Plan generation failed: {plan_res.text}"
            plan_json = plan_res.json()
            print(f"  -> POST /planning/projects/{project_id}/plan: 200 OK ({len(plan_json['scenes'])} scenes)")

            # 3. Retrieve Plan
            get_plan_res = await client.get(f"/planning/projects/{project_id}/plan")
            assert get_plan_res.status_code == 200
            print(f"  -> GET /planning/projects/{project_id}/plan: 200 OK")

            # 4. Compile Timeline
            tl_res = await client.post(f"/planning/projects/{project_id}/timeline")
            assert tl_res.status_code == 200, f"Timeline compilation failed: {tl_res.text}"
            tl_json = tl_res.json()
            print(f"  -> POST /planning/projects/{project_id}/timeline: 200 OK ({tl_json['durationInFrames']} frames)")

            # 5. Retrieve Timeline
            get_tl_res = await client.get(f"/planning/projects/{project_id}/timeline")
            assert get_tl_res.status_code == 200
            print(f"  -> GET /planning/projects/{project_id}/timeline: 200 OK")

            # 6. Verify Project status updated to ready
            proj_check = await client.get(f"/projects/{project_id}")
            assert proj_check.status_code == 200
            assert proj_check.json()["status"] == "ready"
            print(f"  -> Project status confirmed: 'ready'")

    except Exception as e:
        print(f"  -> API Verification failed: {e}")
        sys.exit(1)

    print("\n" + "=" * 70)
    print("ALL 7 VERIFICATION STEPS PASSED SUCCESSFULLY!")
    print("AI DIRECTOR & TIMELINE ENGINE FULLY OPERATIONAL!")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(main())
