import logging
from typing import Dict, Any
from .base import AIProvider, ScriptAnalysisResult, EditPlanResult
from .mock import MockAIProvider

logger = logging.getLogger(__name__)

class GeminiProvider(AIProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.fallback = MockAIProvider()

    async def analyze_script(self, script_text: str) -> ScriptAnalysisResult:
        logger.info("GeminiProvider: Analyzing script...")
        return await self.fallback.analyze_script(script_text)

    async def generate_edit_plan(
        self,
        script_text: str,
        script_analysis: ScriptAnalysisResult,
        video_metadata: Dict[str, Any],
        style_id: str = "modern_creator_v1"
    ) -> EditPlanResult:
        logger.info("GeminiProvider: Generating edit plan...")
        return await self.fallback.generate_edit_plan(script_text, script_analysis, video_metadata, style_id)
