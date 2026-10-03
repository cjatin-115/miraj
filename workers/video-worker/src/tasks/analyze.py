import logging
from typing import Dict, Any
from apps.api.src.core.ai.factory import get_ai_provider

logger = logging.getLogger(__name__)

async def run_analyze_task(script_text: str) -> Dict[str, Any]:
    """Analyzes script and extracts structure and timing."""
    ai = get_ai_provider()
    analysis = await ai.analyze_script(script_text)
    return analysis.model_dump()
