import re
import logging
from typing import List, Dict, Any, Optional
from .base import BaseDirector
from ...schemas.director import (
    EditPlan,
    ScenePlan,
    CropConfig,
    TransitionConfig,
    AssetRequest,
    DirectorInput
)

logger = logging.getLogger(__name__)

class MockDirector(BaseDirector):
    """
    Deterministic rule-based AI Director.
    Generates high-converting, professional short-form EditPlan JSON
    from script, transcript, and analysis without requiring an external API key.
    """

    @staticmethod
    def _split_into_sentences(text: str) -> List[str]:
        raw = re.split(r'(?<=[.!?])\s+', text.strip())
        return [s.strip() for s in raw if s.strip()]

    async def create_edit_plan(self, input_data: DirectorInput) -> EditPlan:
        script = input_data.script.strip()
        sentences = self._split_into_sentences(script)
        if not sentences:
            sentences = ["Welcome to Miraaj video production."]

        target_dur = float(input_data.target_duration or 60.0)

        # Retrieve analysis data if present
        script_analysis = input_data.script_analysis or {}
        visual_moments = script_analysis.get("candidate_visual_moments", [])
        emphasis_words = set(w.upper() for w in script_analysis.get("candidate_emphasis_words", []))
        source_dur = float(input_data.video_metadata.get("duration", target_dur)) if input_data.video_metadata else target_dur

        # Calculate word counts per sentence
        sentence_words = [len(re.findall(r"\b\w+\b", s)) for s in sentences]
        total_words = max(1, sum(sentence_words))

        # Initial duration distribution proportional to words (with ~2.5s minimum)
        raw_durations = [max(2.0, (w / total_words) * target_dur) for w in sentence_words]
        dur_sum = sum(raw_durations)
        # Normalize to target duration
        scale_factor = target_dur / dur_sum if dur_sum > 0 else 1.0
        normalized_durations = [round(d * scale_factor, 2) for d in raw_durations]

        # Fix minor rounding drift
        drift = target_dur - sum(normalized_durations)
        if normalized_durations:
            normalized_durations[-1] = round(normalized_durations[-1] + drift, 2)

        scenes: List[ScenePlan] = []
        current_tl_time = 0.0
        current_src_time = 0.0

        visual_moment_map = {}
        for vm in visual_moments:
            s_idx = vm.get("sentence_index", -1)
            if s_idx >= 0 and s_idx not in visual_moment_map:
                visual_moment_map[s_idx] = vm

        for idx, sentence in enumerate(sentences):
            dur = normalized_durations[idx]
            s_words = sentence_words[idx]

            # Source video mapping
            src_start = current_src_time
            src_end = min(source_dur, src_start + dur)
            if src_start >= source_dur:
                src_start = max(0.0, (src_start % max(1.0, source_dur)))
                src_end = min(source_dur, src_start + dur)
            current_src_time = (current_src_time + dur) % max(1.0, source_dur)

            matched_moment = visual_moment_map.get(idx)
            scene_type = "talking_head"
            crop_config = None
            trans_in = None
            asset_req = None
            props: Dict[str, Any] = {}

            # Sentence emphasis check
            has_emphasis = any(w.upper() in emphasis_words for w in re.findall(r"\b\w+\b", sentence))

            # 1. Opening Hook (First scene)
            if idx == 0:
                if sentence.endswith("?") or "stop" in sentence.lower() or "here" in sentence.lower():
                    # Punch-in hook for high retention
                    scene_type = "talking_head_zoom"
                    crop_config = CropConfig(mode="punch_in", scale=1.22, offset_x=0.0, offset_y=0.0)
                    trans_in = TransitionConfig(type="cut", duration=0.0)
                    props = {
                        "overlayText": sentence,
                        "theme": "vivid_punch"
                    }
                else:
                    scene_type = "talking_head"
                    crop_config = CropConfig(mode="medium", scale=1.0, offset_x=0.0, offset_y=0.0)
                    trans_in = TransitionConfig(type="fade", duration=0.2)

            # 2. Last scene: Call to Action (CTA)
            elif idx == len(sentences) - 1 and len(sentences) > 2:
                scene_type = "cta"
                trans_in = TransitionConfig(type="slide", duration=0.3)
                asset_req = AssetRequest(
                    type="cta",
                    data={
                        "headline": sentence,
                        "subtext": "Automate your video creation with Miraaj",
                        "buttonText": "Follow for More"
                    }
                )
                props = {
                    "headline": sentence,
                    "buttonText": "Subscribe & Follow",
                    "arrowAnimation": True
                }

            # 3. Candidate visual moments from analysis
            elif matched_moment:
                m_type = matched_moment.get("type")
                m_data = matched_moment.get("data", [])

                if m_type == "statistics":
                    scene_type = "statistics"
                    stat_val = m_data[0] if m_data else "95%"
                    asset_req = AssetRequest(
                        type="statistics",
                        data={
                            "statNumber": stat_val,
                            "statLabel": sentence[:60],
                            "trend": "up"
                        }
                    )
                    trans_in = TransitionConfig(type="scale", duration=0.25)
                    props = {
                        "statNumber": stat_val,
                        "statLabel": sentence,
                        "trend": "up"
                    }

                elif m_type == "comparison":
                    scene_type = "comparison"
                    asset_req = AssetRequest(
                        type="comparison",
                        data={
                            "leftTitle": "Manual Editing",
                            "leftPoints": ["3+ hours per video", "Tedious keyframing", "Manual cuts"],
                            "rightTitle": "Miraaj AI",
                            "rightPoints": ["Seconds per video", "Deterministic rendering", "Automated pacing"]
                        }
                    )
                    trans_in = TransitionConfig(type="slide", duration=0.25)
                    props = {
                        "leftTitle": "Traditional",
                        "leftPoints": ["Manual cuts", "High effort"],
                        "rightTitle": "Miraaj V1",
                        "rightPoints": ["AI Director", "Code-driven"],
                        "winner": "right"
                    }

                elif m_type == "code":
                    scene_type = "code"
                    asset_req = AssetRequest(
                        type="code",
                        data={
                            "code": "const timeline = await director.plan(script);\nrenderToVideo(timeline);",
                            "language": "typescript"
                        }
                    )
                    trans_in = TransitionConfig(type="zoom", duration=0.25)
                    props = {
                        "code": "pipeline.execute({\n  talking_head: true,\n  captions: 'large'\n});",
                        "language": "python",
                        "theme": "vivid-dark"
                    }

                elif m_type == "cta":
                    scene_type = "cta"
                    trans_in = TransitionConfig(type="slide", duration=0.3)
                    asset_req = AssetRequest(type="cta", data={"headline": sentence, "buttonText": "Follow"})
                    props = {"headline": sentence, "buttonText": "Follow"}

                else:
                    scene_type = "talking_head_overlay"
                    crop_config = CropConfig(mode="close", scale=1.12)
                    trans_in = TransitionConfig(type="cut", duration=0.0)
                    props = {"overlayText": sentence}

            # 4. Talking head variations
            else:
                if has_emphasis or idx % 3 == 1:
                    # Reframing punch-in
                    scene_type = "talking_head_zoom"
                    crop_config = CropConfig(mode="punch_in", scale=1.20, offset_x=0.0, offset_y=0.0)
                    trans_in = TransitionConfig(type="cut", duration=0.0)
                else:
                    # Regular anchor framing
                    scene_type = "talking_head"
                    crop_config = CropConfig(mode="medium", scale=1.0, offset_x=0.0, offset_y=0.0)
                    trans_in = TransitionConfig(type="cut", duration=0.0)

            scene_plan = ScenePlan(
                id=f"scene_{idx + 1:03d}",
                type=scene_type,
                source_start=round(src_start, 2),
                source_end=round(src_end, 2),
                timeline_start=round(current_tl_time, 2),
                duration=round(dur, 2),
                crop=crop_config,
                transition_in=trans_in,
                asset_request=asset_req,
                script_slice=sentence,
                emphasis_keywords=[w for w in re.findall(r"\b\w+\b", sentence) if w.upper() in emphasis_words],
                props=props
            )

            scenes.append(scene_plan)
            current_tl_time += dur

        # Calculate visual density (non talking-head scenes vs total duration)
        visual_dur = sum(s.duration for s in scenes if s.type not in {"talking_head", "talking_head_zoom"})
        visual_density = round(visual_dur / max(1.0, target_dur), 2)

        return EditPlan(
            version=1,
            duration=round(target_dur, 2),
            pacing="rapid" if target_dur / total_words < 0.35 else "balanced",
            visual_density=visual_density,
            rationale=(
                f"Generated deterministic edit plan with {len(scenes)} scenes. "
                f"Anchored on talking-head footage with dynamic reframing punch-ins "
                f"and {len([s for s in scenes if s.asset_request])} structured visual inserts."
            ),
            scenes=scenes
        )

mock_director = MockDirector()
