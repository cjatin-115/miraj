import os
import subprocess
import pytest
from pathlib import Path
from httpx import AsyncClient

from apps.api.src.core.media import media_env
from apps.api.src.services.analysis.cache import analysis_cache
from apps.api.src.services.analysis.media_ingest import media_ingest
from apps.api.src.services.analysis.video_analyzer import video_analyzer
from apps.api.src.services.analysis.transcriber import transcriber
from apps.api.src.services.analysis.audio_analyzer import audio_analyzer
from apps.api.src.services.analysis.script_analyzer import script_analyzer
from apps.api.src.services.analysis.duration_intelligence import duration_intelligence
from apps.api.src.services.analysis.pipeline import analysis_pipeline

@pytest.fixture(scope="module")
def sample_media(tmp_path_factory):
    """Generate synthetic test media fixtures using ffmpeg."""
    temp_dir = tmp_path_factory.mktemp("test_media")
    valid_video = temp_dir / "valid_talking_head.mp4"
    no_audio_video = temp_dir / "no_audio.mp4"
    corrupt_video = temp_dir / "corrupted.mp4"
    short_video = temp_dir / "short_1s.mp4"

    ffmpeg = media_env.ffmpeg_path or "ffmpeg"

    # 1. Valid video with video + sine audio (2 seconds)
    subprocess.run([
        ffmpeg, "-y",
        "-f", "lavfi", "-i", "testsrc=duration=2:size=640x360:rate=24",
        "-f", "lavfi", "-i", "sine=frequency=1000:duration=2",
        "-c:v", "libx264", "-c:a", "aac",
        str(valid_video)
    ], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    # 2. Video without audio stream (1.5 seconds)
    subprocess.run([
        ffmpeg, "-y",
        "-f", "lavfi", "-i", "testsrc=duration=1.5:size=640x360:rate=24",
        "-c:v", "libx264",
        str(no_audio_video)
    ], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    # 3. Short 0.5s video
    subprocess.run([
        ffmpeg, "-y",
        "-f", "lavfi", "-i", "testsrc=duration=0.5:size=320x240:rate=10",
        "-c:v", "libx264",
        str(short_video)
    ], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    # 4. Corrupted video (truncated header / random noise)
    with open(corrupt_video, "wb") as f:
        f.write(b"NOT_A_VALID_MP4_HEADER_RANDOM_CORRUPTED_BYTES" * 50)

    return {
        "valid": valid_video,
        "no_audio": no_audio_video,
        "corrupt": corrupt_video,
        "short": short_video,
        "temp_dir": temp_dir
    }

def test_media_ingest_valid_video(sample_media):
    valid_vid = sample_media["valid"]
    res = media_ingest.ingest(valid_vid, project_id="test_proj_valid")

    meta = res["metadata"]
    assert meta["width"] == 640
    assert meta["height"] == 360
    assert meta["has_audio"] is True
    assert meta["duration"] >= 1.9

    proxy = Path(res["proxy_path"])
    assert proxy.exists()
    assert proxy.stat().st_size > 0

    audio = Path(res["audio_path"])
    assert audio.exists()
    assert audio.stat().st_size > 44

    assert isinstance(res["frames"], list)

def test_media_ingest_missing_audio(sample_media):
    no_audio_vid = sample_media["no_audio"]
    res = media_ingest.ingest(no_audio_vid, project_id="test_proj_no_audio")

    meta = res["metadata"]
    assert meta["has_audio"] is False
    assert res["audio_path"] is None

    # Audio analyzer on None or non-existent audio returns has_audio=False
    audio_res = audio_analyzer.analyze(None)
    assert audio_res["has_audio"] is False
    assert audio_res["speech_duration_seconds"] == 0.0

def test_media_ingest_corrupted_file(sample_media):
    corrupt_vid = sample_media["corrupt"]
    with pytest.raises(Exception):
        media_ingest.probe_media(corrupt_vid)

def test_short_video_ingest(sample_media):
    short_vid = sample_media["short"]
    res = media_ingest.ingest(short_vid, project_id="test_proj_short")
    assert res["metadata"]["duration"] < 1.0

def test_video_analyzer_metrics(sample_media):
    valid_vid = sample_media["valid"]
    analysis = video_analyzer.analyze(valid_vid, sample_fps=4.0)

    assert "duration" in analysis
    assert "face_detected_ratio" in analysis
    assert "dominant_framing" in analysis
    assert "camera_stability" in analysis
    assert 0.0 <= analysis["camera_stability"] <= 1.0
    assert "usable_segments" in analysis

def test_transcription_silence_and_resilience():
    # Calling transcribe with None or missing path returns empty transcript cleanly
    empty_res = transcriber.transcribe(None)
    assert empty_res["speech_detected"] is False
    assert empty_res["text"] == ""
    assert empty_res["words"] == []

    # Nonexistent path
    fake_path = Path("nonexistent_file_path_12345.wav")
    fake_res = transcriber.transcribe(fake_path)
    assert fake_res["speech_detected"] is False

def test_audio_analyzer_with_wav(sample_media):
    valid_vid = sample_media["valid"]
    ingest_res = media_ingest.ingest(valid_vid, project_id="test_proj_audio")
    audio_path = Path(ingest_res["audio_path"])

    audio_res = audio_analyzer.analyze(audio_path, word_count=5)
    assert audio_res["has_audio"] is True
    assert audio_res["duration_seconds"] > 1.5
    assert audio_res["loudness_dbfs"] > -90.0
    assert audio_res["peak_dbfs"] > -90.0

def test_script_analyzer_variations():
    # 1. Empty script
    empty_res = script_analyzer.analyze("")
    assert empty_res["word_count"] == 0
    assert empty_res["sentence_count"] == 0
    assert empty_res["estimated_speaking_duration"] == 0.0

    # 2. Short script
    short_text = "Here is why you need Miraaj today."
    short_res = script_analyzer.analyze(short_text)
    assert short_res["word_count"] == 7
    assert len(short_res["likely_hooks"]) >= 1
    assert short_res["likely_hooks"][0]["text"] == short_text

    # 3. Rich script with stats, comparisons, code, CTA, and emphasis words
    rich_text = """
    Stop doing manual video editing right now!
    Traditional video editing takes 5x longer and costs over $500 per video.
    Miraaj is better than manual editors because it automates 95% of the workflow.
    Just write your script or call our Python API endpoint with your code.
    The SECRET is our deterministic rendering pipeline. This is a MASSIVE game-changer.
    Follow and subscribe for more AI tools!
    """
    rich_res = script_analyzer.analyze(rich_text)
    assert rich_res["word_count"] > 50
    assert rich_res["sentence_count"] >= 5
    assert len(rich_res["likely_hooks"]) >= 1

    visual_types = [m["type"] for m in rich_res["candidate_visual_moments"]]
    assert "statistics" in visual_types # $500, 5x, 95%
    assert "comparison" in visual_types # better than
    assert "code" in visual_types # python, api, code
    assert "cta" in visual_types # follow, subscribe

    emphasis = rich_res["candidate_emphasis_words"]
    assert "SECRET" in emphasis
    assert "MASSIVE" in emphasis

def test_duration_intelligence_bounds_and_validation():
    script_text = (
        "Are you struggling to create short-form content consistently? "
        "Most creators spend three hours editing a single 60-second video. "
        "With Miraaj, your script and webcam footage are transformed in seconds. "
        "Try it now and boost your productivity."
    )
    est = duration_intelligence.estimate_duration(script_text)

    min_dur = est["estimated_min_duration"]
    rec_dur = est["recommended_duration"]
    max_dur = est["estimated_max_duration"]

    assert 3 <= min_dur <= rec_dur <= max_dur
    assert 0.0 <= est["confidence"] <= 1.0

    # Optimal target duration
    valid_opt = duration_intelligence.validate_target_duration(rec_dur, est)
    assert valid_opt["is_valid"] is True
    assert valid_opt["status"] == "optimal"

    # Mismatch: User requests 70 seconds for a script that naturally supports ~15-20s
    valid_short = duration_intelligence.validate_target_duration(70, est)
    assert valid_short["is_valid"] is False
    assert valid_short["status"] == "too_short"
    assert valid_short["can_expand"] is True # Architecture ready for script expansion
    assert "shorter" in valid_short["warning"].lower()

    # Mismatch: User requests 5 seconds for a script that requires 20s
    valid_long = duration_intelligence.validate_target_duration(5, est)
    assert valid_long["is_valid"] is False
    assert valid_long["status"] == "too_long"
    assert "long" in valid_long["warning"].lower()

def test_analysis_cache_operations(sample_media):
    valid_vid = sample_media["valid"]
    script_text = "This is a cache test script for Miraaj."

    hash1 = analysis_cache.compute_content_hash(valid_vid, script_text)
    hash2 = analysis_cache.compute_content_hash(valid_vid, script_text)
    assert hash1 == hash2

    data = {"project_id": "test_p", "content_hash": hash1, "val": 123}
    analysis_cache.set(hash1, data)

    cached = analysis_cache.get(hash1)
    assert cached is not None
    assert cached["val"] == 123

    # Invalidate
    analysis_cache.invalidate(hash1)
    assert analysis_cache.get(hash1) is None

@pytest.mark.asyncio
async def test_analysis_api_endpoints(client: AsyncClient):
    # 1. Estimate duration endpoint
    est_payload = {
        "script_text": "Here is a quick video test script about AI development and video generation."
    }
    r = await client.post("/api/v1/analysis/estimate-duration", json=est_payload)
    assert r.status_code == 200
    res_json = r.json()
    assert "estimated_min_duration" in res_json
    assert "recommended_duration" in res_json
    assert "available_presets" in res_json

    # 2. Validate duration endpoint (mismatch case)
    val_payload = {
        "target_duration": 70,
        "script_text": "Short 5 word script.",
        "estimated_min_duration": 3,
        "estimated_max_duration": 6,
        "recommended_duration": 4
    }
    r_val = await client.post("/api/v1/analysis/validate-duration", json=val_payload)
    assert r_val.status_code == 200
    val_json = r_val.json()
    assert val_json["is_valid"] is False
    assert val_json["status"] == "too_short"
    assert val_json["can_expand"] is True

    # 3. Create project and analyze via API
    proj_payload = {
        "title": "Analysis Test Project",
        "script_text": "Why do traditional tools make video editing so painful? Because manual trimming is slow."
    }
    proj_r = await client.post("/api/v1/projects", data=proj_payload)
    assert proj_r.status_code == 201
    proj_id = proj_r.json()["id"]

    analyze_r = await client.post(f"/api/v1/analysis/projects/{proj_id}/analyze", json={"force_recompute": False})
    assert analyze_r.status_code == 200
    analysis_data = analyze_r.json()
    assert analysis_data["project_id"] == proj_id
    assert "script_analysis" in analysis_data
    assert "duration_intelligence" in analysis_data

    # 4. Get cached analysis
    get_r = await client.get(f"/api/v1/analysis/projects/{proj_id}/analysis")
    assert get_r.status_code == 200
    assert get_r.json()["content_hash"] == analysis_data["content_hash"]
