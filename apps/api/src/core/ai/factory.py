from ..config import settings
from .base import AIProvider
from .mock import MockAIProvider
from .openai_provider import OpenAIProvider
from .anthropic_provider import AnthropicProvider
from .gemini_provider import GeminiProvider

def get_ai_provider(provider_name: str = None) -> AIProvider:
    name = (provider_name or settings.AI_PROVIDER).lower()

    if name == "openai" and settings.OPENAI_API_KEY:
        return OpenAIProvider(settings.OPENAI_API_KEY)
    elif name == "anthropic" and settings.ANTHROPIC_API_KEY:
        return AnthropicProvider(settings.ANTHROPIC_API_KEY)
    elif name == "gemini" and settings.GEMINI_API_KEY:
        return GeminiProvider(settings.GEMINI_API_KEY)
    
    # Default to deterministic local-first provider
    return MockAIProvider()
