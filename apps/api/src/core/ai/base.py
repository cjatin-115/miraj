from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class KeywordItem(BaseModel):
    word: str
    category: str = "concept"
    importance: float = 1.0

class ScriptAnalysisResult(BaseModel):
    language: str = "en"
    word_count: int
    estimated_duration_seconds: float
    keywords: List[str]
    key_phrases: List[str]
    pacing_recommendation: str = "balanced"
    hook_sentence: str
    cta_sentence: Optional[str] = None
    summary: str

class ScenePlanItem(BaseModel):
    scene_index: int
    scene_type: str
    start_time_seconds: float
    duration_seconds: float
    script_slice: str
    visual_intent: str
    suggested_transition: str = "cut"
    emphasis_keywords: List[str] = Field(default_factory=list)
    props: Dict[str, Any] = Field(default_factory=dict)

class EditPlanResult(BaseModel):
    plan_version: int = 1
    pacing: str = "balanced"
    rationale: str
    estimated_duration_seconds: float
    scenes: List[ScenePlanItem]
    style_id: str = "modern_creator_v1"

class AIProvider(ABC):
    """Abstract base class for LLM / AI Directors."""

    @abstractmethod
    async def analyze_script(self, script_text: str) -> ScriptAnalysisResult:
        """Analyze script text, calculate timings, identify keywords and structure."""
        pass

    @abstractmethod
    async def generate_edit_plan(
        self,
        script_text: str,
        script_analysis: ScriptAnalysisResult,
        video_metadata: Dict[str, Any],
        style_id: str = "modern_creator_v1"
    ) -> EditPlanResult:
        """AI Director: Formulate deterministic scene plan JSON from analysis."""
        pass
