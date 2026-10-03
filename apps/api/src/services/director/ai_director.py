import json
import logging
from typing import Optional
from .base import BaseDirector, LLMProvider
from .mock_director import MockDirector, mock_director
from .providers import GeminiProvider, LocalLLMProvider
from .repair import repair_and_parse_edit_plan
from .quality_rules import quality_validator
from ...schemas.director import EditPlan, DirectorInput

logger = logging.getLogger(__name__)

SYSTEM_DIRECTOR_PROMPT = """You are the AI Director for Miraaj, a high-impact vertical short-form video generation system.
Your job is to produce a deterministic EditPlan JSON.

PRINCIPLES:
- AI determines WHAT happens. Deterministic code determines HOW it looks.
- 9:16 vertical short-form video.
- Talking-head footage is the anchor.
- Add punch-ins (type: 'talking_head_zoom', scale: 1.20) on important statements.
- Insert structured visual cards (statistics, comparison, code, cta, quote) to break up monologue.
- Use clean transitions ('cut', 'slide', 'zoom', 'fade').
- Ensure total duration matches target_duration.

SUPPORTED SCENE TYPES:
talking_head, talking_head_zoom, talking_head_overlay, talking_head_split,
fullscreen_text, keyword_text, editorial_text, caption,
screenshot, browser, code, comparison, statistics, graph,
product_card, image_broll, video_broll, diagram, quote, cta

OUTPUT JSON SCHEMA:
{
  "version": 1,
  "duration": 60.0,
  "pacing": "balanced",
  "visual_density": 0.6,
  "rationale": "...",
  "scenes": [
    {
      "id": "scene_001",
      "type": "talking_head_zoom",
      "source_start": 0.0,
      "source_end": 3.5,
      "timeline_start": 0.0,
      "duration": 3.5,
      "crop": { "mode": "punch_in", "scale": 1.2, "offset_x": 0.0, "offset_y": 0.0 },
      "transition_in": { "type": "cut", "duration": 0.0 },
      "script_slice": "...",
      "props": {}
    }
  ]
}
Return ONLY valid JSON.
"""

class AIDirector(BaseDirector):
    def __init__(self, provider: Optional[LLMProvider] = None):
        self.provider = provider
        self.mock = mock_director

    def _get_active_provider(self) -> Optional[LLMProvider]:
        if self.provider and getattr(self.provider, "is_available", False):
            return self.provider

        gemini = GeminiProvider()
        if gemini.is_available:
            return gemini

        local_llm = LocalLLMProvider()
        if local_llm.is_available:
            return local_llm

        return None

    async def create_edit_plan(self, input_data: DirectorInput) -> EditPlan:
        active_provider = self._get_active_provider()

        if active_provider is None:
            logger.info("No external LLM provider configured; using deterministic MockDirector.")
            return await self.mock.create_edit_plan(input_data)

        # Build prompt for LLM Director
        user_prompt = f"""
SCRIPT:
{input_data.script}

ANALYSIS DATA:
- Candidate Visual Moments: {json.dumps(input_data.script_analysis.get('candidate_visual_moments', []) if input_data.script_analysis else [])}
- Emphasis Keywords: {json.dumps(input_data.script_analysis.get('candidate_emphasis_words', []) if input_data.script_analysis else [])}
- Target Duration: {input_data.target_duration} seconds
- Video Metadata: {json.dumps(input_data.video_metadata or {})}

Formulate the complete EditPlan JSON matching the target duration of {input_data.target_duration} seconds.
"""

        full_prompt = f"{SYSTEM_DIRECTOR_PROMPT}\n\n{user_prompt}"

        try:
            logger.info(f"Generating EditPlan via {active_provider.__class__.__name__}...")
            raw_response = await active_provider.generate(full_prompt)

            # 1. Attempt structured repair
            plan = repair_and_parse_edit_plan(raw_response)
            if plan is not None:
                # Validate quality rules
                quality = quality_validator.validate(plan)
                logger.info(f"LLM EditPlan generated and validated successfully (Quality score: {quality['score']}).")
                return plan

            logger.warning("LLM response could not be repaired into valid EditPlan; falling back to MockDirector.")
        except Exception as e:
            logger.warning(f"LLM Director failed ({e}); falling back to MockDirector.")

        # Fallback to MockDirector
        return await self.mock.create_edit_plan(input_data)

ai_director = AIDirector()
