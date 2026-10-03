from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field

SceneType = Literal[
    "talking_head",
    "talking_head_zoom",
    "talking_head_overlay",
    "talking_head_split",
    "fullscreen_text",
    "keyword_text",
    "editorial_text",
    "caption",
    "screenshot",
    "browser",
    "code",
    "comparison",
    "statistics",
    "graph",
    "product_card",
    "image_broll",
    "video_broll",
    "diagram",
    "quote",
    "cta"
]

TransitionType = Literal[
    "cut",
    "fade",
    "zoom",
    "slide",
    "blur",
    "scale",
    "mask",
    "whip"
]

class AssetRequest(BaseModel):
    type: Literal[
        "statistics",
        "comparison",
        "code",
        "graph",
        "product_card",
        "quote",
        "cta",
        "browser",
        "screenshot",
        "image_broll",
        "video_broll"
    ]
    data: Dict[str, Any] = Field(default_factory=dict)

class CropConfig(BaseModel):
    mode: Literal["close", "medium", "wide", "fit", "punch_in"] = "medium"
    scale: float = Field(default=1.0, ge=0.5, le=2.5)
    offset_x: float = Field(default=0.0, ge=-1.0, le=1.0)
    offset_y: float = Field(default=0.0, ge=-1.0, le=1.0)

class TransitionConfig(BaseModel):
    type: TransitionType = "cut"
    duration: float = Field(default=0.0, ge=0.0, le=2.0, description="Duration in seconds")

class ScenePlan(BaseModel):
    id: str = Field(..., description="Unique scene ID e.g. scene_001")
    type: SceneType
    source_start: float = Field(default=0.0, ge=0.0, description="Source video start in seconds")
    source_end: float = Field(default=0.0, ge=0.0, description="Source video end in seconds")
    timeline_start: float = Field(default=0.0, ge=0.0, description="Timeline start position in seconds")
    duration: float = Field(gt=0.0, description="Duration in seconds")
    crop: Optional[CropConfig] = None
    transition_in: Optional[TransitionConfig] = None
    transition_out: Optional[TransitionConfig] = None
    asset_request: Optional[AssetRequest] = None
    script_slice: Optional[str] = None
    emphasis_keywords: List[str] = Field(default_factory=list)
    props: Dict[str, Any] = Field(default_factory=dict)

class EditPlan(BaseModel):
    version: int = Field(default=1)
    duration: float = Field(gt=0.0, description="Total video duration in seconds")
    pacing: Literal["rapid", "balanced", "contemplative"] = "balanced"
    visual_density: float = Field(default=0.6, ge=0.0, le=1.0, description="Visual cards vs talking-head ratio")
    rationale: Optional[str] = Field(None, description="Director explanation of pacing & edit decisions")
    scenes: List[ScenePlan] = Field(default_factory=list)

class DirectorInput(BaseModel):
    script: str
    transcript: Optional[Dict[str, Any]] = None
    word_timestamps: Optional[List[Dict[str, Any]]] = None
    video_metadata: Optional[Dict[str, Any]] = None
    face_analysis: Optional[Dict[str, Any]] = None
    representative_frames: Optional[List[str]] = None
    audio_analysis: Optional[Dict[str, Any]] = None
    script_analysis: Optional[Dict[str, Any]] = None
    target_duration: float = Field(default=60.0, gt=0.0)
    style_id: str = "modern_creator_v1"
