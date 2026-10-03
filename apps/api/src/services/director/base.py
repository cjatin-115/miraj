from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
from ...schemas.director import EditPlan, DirectorInput

class LLMProvider(ABC):
    """Abstract base class for LLM backends (Gemini, LocalLLM, etc.)."""
    @abstractmethod
    async def generate(self, prompt: str, schema: Optional[Dict[str, Any]] = None) -> str:
        """Generate structured text response from LLM."""
        pass

class BaseDirector(ABC):
    """Abstract base class for Miraaj Video Directors."""
    @abstractmethod
    async def create_edit_plan(self, input_data: DirectorInput) -> EditPlan:
        """Analyze inputs and generate a deterministic EditPlan."""
        pass
