import os
import sys
from pathlib import Path

sys.path.insert(0, os.path.abspath("."))

from apps.api.src.services.analysis.transcriber import transcriber

wav_path = Path("storage/projects/5af65ad7-fc15-46c9-90fc-f6c0e36460a9/analysis/audio_16k.wav")
print(f"File exists: {wav_path.exists()}, Size: {wav_path.stat().st_size if wav_path.exists() else 0}")

try:
    res = transcriber.transcribe(wav_path)
    print("Transcription result:")
    print("  text:", res.get("text"))
    print("  words count:", len(res.get("words", [])))
    print("  error:", res.get("error"))
    print("  engine:", res.get("engine"))
except Exception as e:
    print("Exception during transcribe:", e)
    import traceback
    traceback.print_exc()
