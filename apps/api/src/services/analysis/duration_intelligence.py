import re
import logging
from typing import Dict, Any, Optional, List

logger = logging.getLogger(__name__)

class DurationIntelligenceService:
    @staticmethod
    def estimate_duration(
        script_text: str,
        audio_speech_duration: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Produce duration intelligence bounds:
        - estimated_min_duration
        - estimated_max_duration
        - recommended_duration
        - confidence
        """
        cleaned = script_text.strip()
        words = re.findall(r"\b[A-Za-z0-9'-]+\b", cleaned)
        word_count = len(words)

        raw_sentences = re.split(r'(?<=[.!?])\s+', cleaned)
        sentences = [s for s in raw_sentences if s.strip()]
        sentence_count = len(sentences)

        paragraphs = [p for p in re.split(r'\n\s*\n', cleaned) if p.strip()]
        paragraph_count = max(1, len(paragraphs))

        if word_count == 0:
            return {
                "estimated_min_duration": 0,
                "estimated_max_duration": 0,
                "recommended_duration": 0,
                "confidence": 0.0,
                "word_count": 0,
                "speaking_rate_wpm": 150.0
            }

        # Fast pacing (~170 WPM) + tight pauses
        min_speech = (word_count / 170.0) * 60.0
        min_pause = (sentence_count * 0.15) + (paragraph_count * 0.2)
        est_min = max(3, int(round(min_speech + min_pause)))

        # Slow pacing (~130 WPM) + relaxed pauses
        max_speech = (word_count / 130.0) * 60.0
        max_pause = (sentence_count * 0.45) + (paragraph_count * 0.5)
        est_max = max(est_min + 2, int(round(max_speech + max_pause)))

        # Recommended pacing (~150 WPM) + balanced creator pauses
        rec_speech = (word_count / 150.0) * 60.0
        rec_pause = (sentence_count * 0.30) + (paragraph_count * 0.35)
        recommended = int(round(rec_speech + rec_pause))

        # Clamp recommended inside min and max
        recommended = max(est_min, min(est_max, recommended))

        # Base confidence calculation
        if word_count < 10:
            confidence = 0.65
        elif word_count < 30:
            confidence = 0.78
        elif word_count <= 250:
            confidence = 0.88
        else:
            confidence = 0.84

        # If recorded audio speech duration is available, integrate it
        if audio_speech_duration and audio_speech_duration > 1.0:
            # Shift recommended towards actual speech duration
            actual_rounded = int(round(audio_speech_duration))
            recommended = int(round(0.7 * actual_rounded + 0.3 * recommended))
            est_min = min(est_min, max(3, actual_rounded - 3))
            est_max = max(est_max, actual_rounded + 5)
            confidence = min(0.96, confidence + 0.08)

        confidence = round(confidence, 2)

        return {
            "estimated_min_duration": est_min,
            "estimated_max_duration": est_max,
            "recommended_duration": recommended,
            "confidence": confidence,
            "word_count": word_count,
            "speaking_rate_wpm": 150.0,
            "available_presets": [
                {"label": "Recommended", "duration": recommended},
                {"label": "45 sec", "duration": 45},
                {"label": "60 sec", "duration": 60},
                {"label": "70 sec", "duration": 70}
            ]
        }

    @staticmethod
    def validate_target_duration(
        target_duration: float,
        estimate_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Validate requested target duration against script capacity.
        Flags when script is shorter or longer than target duration.
        """
        est_min = estimate_info.get("estimated_min_duration", 0)
        est_max = estimate_info.get("estimated_max_duration", 0)
        recommended = estimate_info.get("recommended_duration", 0)

        if est_max == 0:
            return {
                "is_valid": True,
                "status": "empty_script",
                "target_duration": target_duration,
                "warning": None,
                "message": "Script is empty.",
                "can_expand": False
            }

        # Script is significantly shorter than requested duration
        # e.g., script naturally supports 35-40s but user requested 70s
        if target_duration > est_max * 1.25:
            diff = int(round(target_duration - recommended))
            return {
                "is_valid": False,
                "status": "too_short",
                "target_duration": target_duration,
                "warning": f"Script is shorter than the requested {int(target_duration)}s duration.",
                "message": (
                    f"Your script naturally supports {recommended}s (range: {est_min}–{est_max}s). "
                    f"Targeting {int(target_duration)}s would leave ~{diff}s of empty space or require an artificially sluggish pace."
                ),
                "can_expand": True # Architecture ready for future 'Expand script' feature
            }

        # Script is significantly longer than requested duration
        if target_duration < est_min * 0.75:
            return {
                "is_valid": False,
                "status": "too_long",
                "target_duration": target_duration,
                "warning": f"Script is too long for the requested {int(target_duration)}s duration.",
                "message": (
                    f"Your script naturally requires at least {est_min}s. "
                    f"Targeting {int(target_duration)}s would require speaking unnaturally fast (~{int((estimate_info.get('word_count', 100)/target_duration)*60)} WPM)."
                ),
                "can_expand": False
            }

        # Optimal or comfortably within tolerance
        return {
            "is_valid": True,
            "status": "optimal",
            "target_duration": target_duration,
            "warning": None,
            "message": "Target duration is well matched to script length.",
            "can_expand": False
        }

duration_intelligence = DurationIntelligenceService()
