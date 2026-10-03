import logging
from typing import Dict, Any
from apps.api.src.core.ai.factory import get_ai_provider
from apps.api.src.core.ai.base import ScriptAnalysisResult

logger = logging.getLogger(__name__)

async def run_plan_task(
    script_text: str,
    analysis_dict: Dict[str, Any],
    video_metadata: Dict[str, Any],
    style_id: str = "modern_creator_v1"
) -> Dict[str, Any]:
    """AI Director generates structured edit plan JSON."""
    ai = get_ai_provider()
    analysis = ScriptAnalysisResult.model_validate(analysis_dict)
    plan = await ai.generate_edit_plan(
        script_text=script_text,
        script_analysis=analysis,
        video_metadata=video_metadata,
        style_id=style_id
    )
    return plan.model_dump()
