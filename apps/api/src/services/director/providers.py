import os
import json
import logging
import httpx
from typing import Optional, Dict, Any
from .base import LLMProvider
from ...core.config import settings

logger = logging.getLogger(__name__)

class GeminiProvider(LLMProvider):
    """Google Gemini LLM provider with structured JSON generation."""
    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-1.5-flash"):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.model = model

    @property
    def is_available(self) -> bool:
        return bool(self.api_key and len(self.api_key.strip()) > 5)

    async def generate(self, prompt: str, schema: Optional[Dict[str, Any]] = None) -> str:
        if not self.is_available:
            raise RuntimeError("Gemini API key is not configured.")

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.2,
                "response_mime_type": "application/json"
            }
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
            candidates = data.get("candidates", [])
            if not candidates:
                raise ValueError("No candidates returned from Gemini.")
            text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            return text

class LocalLLMProvider(LLMProvider):
    """Local OpenAI-compatible LLM endpoint (e.g. Ollama, vLLM, LocalAI)."""
    def __init__(self, endpoint_url: Optional[str] = None, model: str = "llama3:latest"):
        self.endpoint_url = endpoint_url or os.getenv("LOCAL_LLM_URL", "http://localhost:11434/v1/chat/completions")
        self.model = model

    @property
    def is_available(self) -> bool:
        return bool(self.endpoint_url)

    async def generate(self, prompt: str, schema: Optional[Dict[str, Any]] = None) -> str:
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": "You are an expert short-form video AI Director. Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.2
        }

        async with httpx.AsyncClient(timeout=45.0) as client:
            resp = await client.post(self.endpoint_url, json=payload)
            resp.raise_for_status()
            data = resp.json()
            text = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            return text
