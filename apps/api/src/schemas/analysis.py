from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class DurationEstimateRequest(BaseModel):
    script_text: str = Field(..., description="Raw text of user script")
    audio_speech_duration: Optional[float] = Field(None, description="Optional measured speech duration from webcam recording")

class DurationPreset(BaseModel):
    label: str
    duration: int

class DurationEstimateResponse(BaseModel):
    estimated_min_duration: int
    estimated_max_duration: int
    recommended_duration: int
    confidence: float
    word_count: int
    speaking_rate_wpm: float
    available_presets: List[DurationPreset]

class DurationValidationRequest(BaseModel):
    target_duration: float = Field(..., description="Target video duration in seconds")
    script_text: Optional[str] = Field(None, description="Raw script text if estimate not provided")
    estimated_min_duration: Optional[int] = None
    estimated_max_duration: Optional[int] = None
    recommended_duration: Optional[int] = None

class DurationValidationResponse(BaseModel):
    is_valid: bool
    status: str # "optimal", "too_short", "too_long", "empty_script"
    target_duration: float
    warning: Optional[str] = None
    message: str
    can_expand: bool = False

class AnalyzeProjectRequest(BaseModel):
    force_recompute: bool = False

class AnalysisDetailResponse(BaseModel):
    project_id: str
    content_hash: str
    video_metadata: Optional[Dict[str, Any]] = None
    transcript: Optional[Dict[str, Any]] = None
    audio_analysis: Optional[Dict[str, Any]] = None
    video_analysis: Optional[Dict[str, Any]] = None
    script_analysis: Optional[Dict[str, Any]] = None
    duration_intelligence: Optional[DurationEstimateResponse] = None
    proxy_path: Optional[str] = None
    audio_path: Optional[str] = None
    frames: List[str] = []
