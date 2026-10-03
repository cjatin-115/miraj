import re
from typing import Dict, Any, List
from .base import AIProvider, ScriptAnalysisResult, EditPlanResult, ScenePlanItem

class MockAIProvider(AIProvider):
    """
    Deterministic, local-first AI Provider that requires no external API keys.
    Extracts keywords, segments sentences, and builds a reference edit plan.
    """

    async def analyze_script(self, script_text: str) -> ScriptAnalysisResult:
        clean_text = script_text.strip()
        words = re.findall(r'\b\w+\b', clean_text)
        word_count = len(words)
        
        # Average talking speed: 150 words per minute (~2.5 words / sec)
        estimated_duration = max(3.0, round(word_count / 2.5, 2))

        # Extract sentences
        sentences = [s.strip() for s in re.split(r'[.!?]+', clean_text) if s.strip()]
        hook = sentences[0] if sentences else clean_text
        cta = sentences[-1] if len(sentences) > 1 else None

        # Extract uppercase or long words as keywords
        stop_words = {"the", "and", "a", "to", "of", "in", "it", "is", "that", "this", "you", "for", "with", "on", "as", "are"}
        keywords = []
        for w in words:
            wl = w.lower()
            if len(w) > 4 and wl not in stop_words and wl not in [k.lower() for k in keywords]:
                keywords.append(w.upper())
            if len(keywords) >= 8:
                break

        key_phrases = sentences[:3]

        return ScriptAnalysisResult(
            language="en",
            word_count=word_count,
            estimated_duration_seconds=estimated_duration,
            keywords=keywords,
            key_phrases=key_phrases,
            pacing_recommendation="rapid" if estimated_duration < 30 else "balanced",
            hook_sentence=hook,
            cta_sentence=cta,
            summary=f"Short-form script containing {word_count} words and {len(sentences)} key segments."
        )

    async def generate_edit_plan(
        self,
        script_text: str,
        script_analysis: ScriptAnalysisResult,
        video_metadata: Dict[str, Any],
        style_id: str = "modern_creator_v1"
    ) -> EditPlanResult:
        sentences = [s.strip() for s in re.split(r'[.!?]+', script_text) if s.strip()]
        if not sentences:
            sentences = [script_text]

        total_duration = max(video_metadata.get("duration", 0.0), script_analysis.estimated_duration_seconds)
        if total_duration <= 0:
            total_duration = 10.0

        scenes: List[ScenePlanItem] = []
        scene_types_cycle = [
            "talking_head",
            "keyword_text",
            "talking_head_zoom",
            "editorial_text",
            "cta"
        ]

        time_cursor = 0.0
        segment_duration = total_duration / max(1, len(sentences))

        for idx, sentence in enumerate(sentences):
            stype = scene_types_cycle[idx % len(scene_types_cycle)]
            dur = round(segment_duration, 2)
            
            # Match keywords in sentence
            emphasis = [k for k in script_analysis.keywords if k.lower() in sentence.lower()]
            if not emphasis and script_analysis.keywords:
                emphasis = [script_analysis.keywords[idx % len(script_analysis.keywords)]]

            props: Dict[str, Any] = {}
            if stype == "talking_head":
                props = {
                    "videoSrc": video_metadata.get("source_url", ""),
                    "sourceStartFrame": int(time_cursor * 30),
                    "zoomLevel": 1.0,
                    "overlayText": sentence[:40]
                }
            elif stype == "talking_head_zoom":
                props = {
                    "videoSrc": video_metadata.get("source_url", ""),
                    "sourceStartFrame": int(time_cursor * 30),
                    "zoomLevel": 1.25,
                    "panY": -0.05
                }
            elif stype == "keyword_text":
                props = {
                    "keywords": [{"text": kw, "highlight": True, "scale": 1.15} for kw in emphasis[:3]],
                    "layout": "stacked",
                    "animation": "pop"
                }
            elif stype == "editorial_text":
                props = {
                    "title": sentence[:30],
                    "paragraph": sentence,
                    "eyebrow": "INSIGHT"
                }
            elif stype == "cta":
                props = {
                    "headline": sentence[:40],
                    "buttonText": "Learn More",
                    "arrowAnimation": True
                }

            scenes.append(ScenePlanItem(
                scene_index=idx,
                scene_type=stype,
                start_time_seconds=round(time_cursor, 2),
                duration_seconds=dur,
                script_slice=sentence,
                visual_intent=f"High engagement {stype} segment highlighting key takeaway",
                suggested_transition="zoom" if idx % 2 == 1 else "cut",
                emphasis_keywords=emphasis,
                props=props
            ))
            time_cursor += dur

        return EditPlanResult(
            plan_version=1,
            pacing=script_analysis.pacing_recommendation,
            rationale="Dynamic talking-head anchor with punch-in reframing, bold text cards, and paced cuts.",
            estimated_duration_seconds=round(total_duration, 2),
            scenes=scenes,
            style_id=style_id
        )
