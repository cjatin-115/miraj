import os
import sys
import time
import subprocess
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from apps.api.src.core.media import media_env
from apps.api.src.services.analysis.cache import analysis_cache
from apps.api.src.services.analysis.media_ingest import media_ingest
from apps.api.src.services.analysis.video_analyzer import video_analyzer
from apps.api.src.services.analysis.audio_analyzer import audio_analyzer
from apps.api.src.services.analysis.transcriber import transcriber
from apps.api.src.services.analysis.script_analyzer import script_analyzer
from apps.api.src.services.analysis.duration_intelligence import duration_intelligence

def main():
    print("=" * 60)
    print("MIRAAJ V1 - MEDIA INGESTION & ANALYSIS PIPELINE VERIFICATION")
    print("=" * 60)

    work_dir = PROJECT_ROOT / "storage" / "projects" / "verification_sample"
    work_dir.mkdir(parents=True, exist_ok=True)
    sample_mp4 = work_dir / "sample_webcam_input.mp4"

    ffmpeg = media_env.ffmpeg_path
    if not ffmpeg:
        print("ERROR: FFmpeg is not found in media_env.")
        sys.exit(1)

    print(f"[1/8] Generating 3-second 9:16 vertical test recording...")
    # Generate 540x960 vertical video with video test pattern and 1kHz sine wave audio
    cmd = [
        ffmpeg, "-y",
        "-f", "lavfi", "-i", "testsrc=duration=3:size=540x960:rate=30",
        "-f", "lavfi", "-i", "sine=frequency=880:duration=3",
        "-c:v", "libx264", "-preset", "ultrafast",
        "-c:a", "aac",
        str(sample_mp4)
    ]
    subprocess.run(cmd, check=True, capture_output=True, text=True)
    print(f"  -> Generated: {sample_mp4} ({sample_mp4.stat().st_size} bytes)")

    # 1. Media Ingestion
    print("\n[2/8] Testing Media Ingestion (probe, proxy, 16k WAV, frames)...")
    t0 = time.time()
    ingest_res = media_ingest.ingest(sample_mp4, project_id="verification_sample")
    t_ingest = time.time() - t0
    meta = ingest_res["metadata"]
    print(f"  -> Ingestion completed in {t_ingest:.2f}s")
    print(f"  -> Resolution: {meta['width']}x{meta['height']} @ {meta['fps']}fps, Duration: {meta['duration']}s")
    print(f"  -> Proxy Path: {ingest_res['proxy_path']}")
    print(f"  -> Audio WAV: {ingest_res['audio_path']}")
    print(f"  -> Extracted Frames: {len(ingest_res['frames'])} frames")
    assert Path(ingest_res["proxy_path"]).exists()
    assert Path(ingest_res["audio_path"]).exists()

    # 2. Video Analysis
    print("\n[3/8] Testing Video Analysis (OpenCV / face detection & stability)...")
    t0 = time.time()
    proxy_path = Path(ingest_res["proxy_path"])
    video_res = video_analyzer.analyze(proxy_path, sample_fps=4.0)
    t_video = time.time() - t0
    print(f"  -> Video Analysis completed in {t_video:.2f}s")
    print(f"  -> Dominant Framing: {video_res['dominant_framing']}")
    print(f"  -> Camera Stability Score: {video_res['camera_stability']:.2f}")
    print(f"  -> Centered: {video_res['is_centered']}")
    print(f"  -> Usable Segments: {len(video_res['usable_segments'])}")

    # 3. Audio Analysis
    print("\n[4/8] Testing Audio Analysis (loudness, peak, silence detection)...")
    t0 = time.time()
    audio_path = Path(ingest_res["audio_path"])
    audio_res = audio_analyzer.analyze(audio_path, word_count=8)
    t_audio = time.time() - t0
    print(f"  -> Audio Analysis completed in {t_audio:.2f}s")
    print(f"  -> Active Speech Duration: {audio_res['speech_duration_seconds']}s")
    print(f"  -> Silence Duration: {audio_res['silence_duration_seconds']}s")
    print(f"  -> RMS Loudness: {audio_res['loudness_dbfs']} dBFS")
    print(f"  -> Peak Amplitude: {audio_res['peak_dbfs']} dBFS")

    # 4. Transcription
    print("\n[5/8] Testing Whisper Transcription (faster-whisper CPU int8)...")
    t0 = time.time()
    transcript_res = transcriber.transcribe(audio_path)
    t_trans = time.time() - t0
    print(f"  -> Transcription completed in {t_trans:.2f}s")
    print(f"  -> Speech Detected: {transcript_res['speech_detected']}")
    print(f"  -> Timed Words Count: {len(transcript_res['words'])}")

    # 5. Script Analysis
    test_script = (
        "Stop editing your short-form videos manually!\n\n"
        "Traditional video editing takes 5x longer and costs over $500 every single week.\n\n"
        "Miraaj is better than manual editors because our Python API and code automate 95% of the workflow.\n\n"
        "The SECRET is our deterministic rendering engine. This is a MASSIVE game-changer.\n\n"
        "Subscribe and follow for more AI video automation tutorials!"
    )
    print("\n[6/8] Testing Script Analysis (hooks, candidate moments, emphasis)...")
    t0 = time.time()
    script_res = script_analyzer.analyze(test_script)
    t_script = time.time() - t0
    print(f"  -> Script Analysis completed in {t_script:.4f}s")
    print(f"  -> Word Count: {script_res['word_count']}, Sentences: {script_res['sentence_count']}")
    print(f"  -> Likely Hooks: {len(script_res['likely_hooks'])} found")
    print(f"     Hook: \"{script_res['likely_hooks'][0]['text']}\"")
    print(f"  -> Candidate Visual Moments: {len(script_res['candidate_visual_moments'])}")
    for vm in script_res['candidate_visual_moments']:
        print(f"     - Type: {vm['type']} -> Scene: {vm['recommended_scene']} -> Match: {vm['data']}")
    print(f"  -> Emphasis Words: {script_res['candidate_emphasis_words']}")

    # 6. Duration Intelligence & Validation
    print("\n[7/8] Testing Duration Intelligence & Target Validation...")
    dur_est = duration_intelligence.estimate_duration(test_script, audio_speech_duration=audio_res["speech_duration_seconds"])
    print(f"  -> Estimated Duration Range: {dur_est['estimated_min_duration']}-{dur_est['estimated_max_duration']}s")
    print(f"  -> Recommended Duration: {dur_est['recommended_duration']}s")
    print(f"  -> Confidence: {dur_est['confidence']:.2f}")

    # Test Validation on Mismatch (Target 70s vs 25s script)
    val_mismatch = duration_intelligence.validate_target_duration(70, dur_est)
    print(f"  -> Target: 70s -> is_valid: {val_mismatch['is_valid']}, status: {val_mismatch['status']}")
    print(f"     Warning: {val_mismatch['warning']}")
    print(f"     Architecture Hook: can_expand = {val_mismatch['can_expand']}")
    assert val_mismatch["is_valid"] is False
    assert val_mismatch["can_expand"] is True

    # Test Validation on Optimal Target (Recommended)
    val_optimal = duration_intelligence.validate_target_duration(dur_est['recommended_duration'], dur_est)
    print(f"  -> Target: {dur_est['recommended_duration']}s (Recommended) -> is_valid: {val_optimal['is_valid']}, status: {val_optimal['status']}")
    assert val_optimal["is_valid"] is True

    # 7. Analysis Cache
    print("\n[8/8] Testing Content Hash Caching...")
    hash_key = analysis_cache.compute_content_hash(sample_mp4, test_script)
    print(f"  -> Content SHA-256 Hash: {hash_key}")
    cache_payload = {
        "metadata": meta,
        "script": script_res,
        "duration": dur_est
    }
    analysis_cache.set(hash_key, cache_payload)
    cached_get = analysis_cache.get(hash_key)
    assert cached_get is not None
    print(f"  -> Analysis cache retrieve: SUCCESS (hash {hash_key[:16]}...)")

    print("\n" + "=" * 60)
    print("ALL MEDIA INGESTION & ANALYSIS PIPELINE CHECKS PASSED!")
    print(f"Total Pipeline Benchmark: {t_ingest + t_video + t_audio + t_trans + t_script:.2f}s")
    print("=" * 60)

if __name__ == "__main__":
    main()
