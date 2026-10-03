import logging
import numpy as np
from pathlib import Path
from typing import Dict, Any, List, Optional
import scipy.io.wavfile as wavfile

logger = logging.getLogger(__name__)

class AudioAnalyzer:
    def __init__(self, silence_threshold_db: float = -40.0, min_silence_duration: float = 0.35):
        self.silence_threshold_db = silence_threshold_db
        self.min_silence_duration = min_silence_duration

    def analyze(self, audio_path: Optional[Path], word_count: int = 0) -> Dict[str, Any]:
        """
        Analyze audio file for:
        - presence
        - duration
        - loudness (RMS dBFS)
        - peak amplitude (dBFS)
        - silence intervals & total silence duration
        - active speech duration
        - approximate speaking rate (WPM)
        """
        if not audio_path or not Path(audio_path).exists() or Path(audio_path).stat().st_size <= 44:
            return {
                "has_audio": False,
                "duration_seconds": 0.0,
                "speech_duration_seconds": 0.0,
                "silence_duration_seconds": 0.0,
                "loudness_dbfs": -99.0,
                "peak_dbfs": -99.0,
                "silence_regions": [],
                "speaking_rate_wpm": 0.0,
                "usable_audio_ratio": 0.0
            }

        try:
            sample_rate, data = wavfile.read(str(audio_path))
            
            # If multi-channel, convert to mono by taking average
            if len(data.shape) > 1:
                data = np.mean(data, axis=1)

            # Convert to float normalized [-1.0, 1.0]
            if data.dtype == np.int16:
                float_data = data.astype(np.float32) / 32768.0
            elif data.dtype == np.int32:
                float_data = data.astype(np.float32) / 2147483648.0
            elif data.dtype == np.uint8:
                float_data = (data.astype(np.float32) - 128.0) / 128.0
            else:
                float_data = data.astype(np.float32)

            total_samples = len(float_data)
            if total_samples == 0:
                return {
                    "has_audio": False,
                    "duration_seconds": 0.0,
                    "speech_duration_seconds": 0.0,
                    "silence_duration_seconds": 0.0,
                    "loudness_dbfs": -99.0,
                    "peak_dbfs": -99.0,
                    "silence_regions": [],
                    "speaking_rate_wpm": 0.0,
                    "usable_audio_ratio": 0.0
                }

            duration = round(total_samples / sample_rate, 2)

            # Peak amplitude
            peak = float(np.max(np.abs(float_data)))
            peak_dbfs = round(20.0 * np.log10(peak + 1e-9), 2)

            if peak < 0.002: # Virtually silent
                return {
                    "has_audio": False,
                    "duration_seconds": duration,
                    "speech_duration_seconds": 0.0,
                    "silence_duration_seconds": duration,
                    "loudness_dbfs": -99.0,
                    "peak_dbfs": peak_dbfs,
                    "silence_regions": [{"start": 0.0, "end": duration, "duration": duration}],
                    "speaking_rate_wpm": 0.0,
                    "usable_audio_ratio": 0.0
                }

            # Overall RMS Loudness
            rms = float(np.sqrt(np.mean(float_data ** 2)))
            loudness_dbfs = round(20.0 * np.log10(rms + 1e-9), 2)

            # Frame-by-frame silence detection (50ms windows)
            window_size = int(sample_rate * 0.05)
            num_windows = total_samples // window_size

            silence_linear_thresh = 10.0 ** (self.silence_threshold_db / 20.0)

            silence_regions: List[Dict[str, float]] = []
            in_silence = False
            silence_start = 0.0

            for i in range(num_windows):
                window = float_data[i * window_size : (i + 1) * window_size]
                win_rms = np.sqrt(np.mean(window ** 2))
                t = i * 0.05

                if win_rms < silence_linear_thresh:
                    if not in_silence:
                        in_silence = True
                        silence_start = t
                else:
                    if in_silence:
                        in_silence = False
                        silence_dur = t - silence_start
                        if silence_dur >= self.min_silence_duration:
                            silence_regions.append({
                                "start": round(silence_start, 2),
                                "end": round(t, 2),
                                "duration": round(silence_dur, 2)
                            })

            if in_silence:
                silence_dur = duration - silence_start
                if silence_dur >= self.min_silence_duration:
                    silence_regions.append({
                        "start": round(silence_start, 2),
                        "end": round(duration, 2),
                        "duration": round(silence_dur, 2)
                    })

            total_silence = round(sum(r["duration"] for r in silence_regions), 2)
            speech_duration = round(max(0.0, duration - total_silence), 2)
            usable_ratio = round(speech_duration / max(0.1, duration), 2)

            # Estimate speaking rate
            if word_count > 0 and speech_duration > 0.5:
                wpm = round((word_count / speech_duration) * 60.0, 1)
            else:
                wpm = 150.0

            return {
                "has_audio": True,
                "duration_seconds": duration,
                "speech_duration_seconds": speech_duration,
                "silence_duration_seconds": total_silence,
                "loudness_dbfs": loudness_dbfs,
                "peak_dbfs": peak_dbfs,
                "silence_regions": silence_regions,
                "speaking_rate_wpm": wpm,
                "usable_audio_ratio": usable_ratio
            }

        except Exception as e:
            logger.error(f"Error analyzing audio: {e}", exc_info=True)
            return {
                "has_audio": False,
                "duration_seconds": 0.0,
                "speech_duration_seconds": 0.0,
                "silence_duration_seconds": 0.0,
                "loudness_dbfs": -99.0,
                "peak_dbfs": -99.0,
                "silence_regions": [],
                "speaking_rate_wpm": 0.0,
                "usable_audio_ratio": 0.0,
                "error": str(e)
            }

audio_analyzer = AudioAnalyzer()
