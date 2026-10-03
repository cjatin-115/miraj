import logging
from typing import Dict, Any, List
from ...schemas.director import EditPlan, ScenePlan

logger = logging.getLogger(__name__)

class QualityValidator:
    """
    Validates aesthetic and technical quality rules on EditPlans:
    - no excessive text
    - no caption overflow
    - no face cropping errors
    - no unnecessary transitions
    - no illegal overlaps
    - readable caption duration
    - natural talking-head continuity
    - meaningful visual inserts
    - consistent pacing
    """

    @classmethod
    def validate(cls, plan: EditPlan) -> Dict[str, Any]:
        warnings: List[str] = []
        errors: List[str] = []

        if not plan.scenes:
            errors.append("EditPlan contains no scenes.")
            return {"is_valid": False, "score": 0.0, "errors": errors, "warnings": warnings}

        talking_head_duration = 0.0
        visual_inserts_count = 0
        prev_end = 0.0

        for sc in plan.scenes:
            # 1. Timing & overlap check
            if sc.duration <= 0.0:
                errors.append(f"Scene {sc.id} has invalid non-positive duration: {sc.duration}s")
            if sc.timeline_start < prev_end - 0.05: # Allow 50ms tolerance
                warnings.append(f"Scene {sc.id} overlaps with previous scene at {sc.timeline_start}s")
            prev_end = sc.timeline_start + sc.duration

            # 2. Pacing check
            if sc.duration > 8.5:
                warnings.append(f"Scene {sc.id} is too long ({sc.duration}s); creator video scenes should be under 8s.")
            elif sc.duration < 1.0:
                warnings.append(f"Scene {sc.id} is very short ({sc.duration}s); minimum recommended is 1.0s.")

            # 3. Excessive text check
            if sc.script_slice:
                word_count = len(sc.script_slice.split())
                if word_count > 35:
                    warnings.append(f"Scene {sc.id} has excessive text ({word_count} words). Short-form cards should stay concise.")

                # Reading speed (words per second)
                reading_speed = word_count / max(0.5, sc.duration)
                if reading_speed > 4.2:
                    warnings.append(f"Scene {sc.id} caption cadence is very fast ({reading_speed:.1f} words/s); risk of caption overflow.")

            # 4. Face cropping check
            if sc.crop:
                if sc.crop.scale > 1.6:
                    warnings.append(f"Scene {sc.id} crop scale is too extreme ({sc.crop.scale}x); may cause pixelation or face clipping.")
                if abs(sc.crop.offset_x) > 0.4 or abs(sc.crop.offset_y) > 0.4:
                    warnings.append(f"Scene {sc.id} crop offset is large; may position subject off-screen.")

            # 5. Transition check
            if sc.transition_in:
                if sc.transition_in.duration > sc.duration * 0.4:
                    warnings.append(f"Scene {sc.id} transition duration ({sc.transition_in.duration}s) exceeds 40% of scene duration.")

            # Category tracking
            if sc.type in {"talking_head", "talking_head_zoom", "talking_head_overlay", "talking_head_split"}:
                talking_head_duration += sc.duration
            else:
                visual_inserts_count += 1

        # 6. Talking-head continuity check
        th_ratio = talking_head_duration / max(1.0, plan.duration)
        if th_ratio < 0.35 and plan.duration >= 15.0:
            warnings.append(f"Talking-head coverage is low ({th_ratio * 100:.1f}%). High-converting creator videos maintain ~50-70% face anchor.")

        # 7. Meaningful visual inserts check
        if visual_inserts_count == 0 and plan.duration >= 20.0:
            warnings.append("No visual cards or b-roll inserts found. Short-form videos benefit from dynamic graphics.")

        # Calculate quality score (0.0 to 1.0)
        deduction = (len(errors) * 0.3) + (len(warnings) * 0.05)
        score = max(0.1, min(1.0, round(1.0 - deduction, 2)))

        is_valid = len(errors) == 0

        return {
            "is_valid": is_valid,
            "score": score,
            "errors": errors,
            "warnings": warnings,
            "talking_head_ratio": round(th_ratio, 2),
            "visual_inserts_count": visual_inserts_count
        }

quality_validator = QualityValidator()
