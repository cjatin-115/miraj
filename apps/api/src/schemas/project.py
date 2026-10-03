from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class SourceVideoResponse(BaseModel):
    id: str
    filename: str
    storage_path: str
    duration_seconds: float
    width: int
    height: int
    fps: float
    format: str
    file_size_bytes: int
    has_audio: bool = True
    created_at: datetime

    class Config:
        from_attributes = True

class ScriptCreate(BaseModel):
    raw_text: str

class ScriptResponse(BaseModel):
    id: str
    raw_text: str
    word_count: int
    estimated_duration_seconds: float
    language: str
    created_at: datetime

    class Config:
        from_attributes = True

class JobResponse(BaseModel):
    id: str
    project_id: str
    type: str
    status: str
    progress: int
    stage_message: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class EditPlanSummaryResponse(BaseModel):
    id: str
    plan_version: int = 1
    pacing: str = "balanced"
    rationale: Optional[str] = None
    scenes: List[Dict[str, Any]] = Field(default_factory=list)
    estimated_duration_seconds: float = 0.0
    created_at: datetime

    class Config:
        from_attributes = True

class TimelineSummaryResponse(BaseModel):
    id: str
    version: int = 1
    width: int = 1080
    height: int = 1920
    fps: int = 30
    duration_in_frames: int = 0
    style_id: str = "modern_creator_v1"
    scenes: List[Dict[str, Any]] = Field(default_factory=list)
    audio_tracks: List[Dict[str, Any]] = Field(default_factory=list)
    overlays: List[Dict[str, Any]] = Field(default_factory=list)
    metadata_json: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ProjectCreate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    script_text: str = Field(..., min_length=1)
    style_id: str = "modern_creator_v1"

class ProjectResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    status: str
    style_id: str
    created_at: datetime
    updated_at: datetime
    source_video: Optional[SourceVideoResponse] = None
    script: Optional[ScriptResponse] = None
    edit_plan: Optional[EditPlanSummaryResponse] = None
    timeline: Optional[TimelineSummaryResponse] = None
    jobs: List[JobResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True

class ProjectListResponse(BaseModel):
    projects: List[ProjectResponse]
    total: int
