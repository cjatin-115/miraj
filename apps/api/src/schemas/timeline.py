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

class TimelineTransitionSchema(BaseModel):
    type: TransitionType = "cut"
    durationInFrames: int = Field(default=0, ge=0)
    direction: Optional[Literal["left", "right", "up", "down", "in", "out"]] = None
    easing: Optional[str] = "ease-out"

class TimelineSceneSchema(BaseModel):
    id: str
    type: SceneType
    startFrame: int = Field(ge=0)
    durationInFrames: int = Field(gt=0)
    transitionIn: Optional[TimelineTransitionSchema] = None
    transitionOut: Optional[TimelineTransitionSchema] = None
    props: Dict[str, Any] = Field(default_factory=dict)

class TimelineAudioTrackSchema(BaseModel):
    id: str
    src: str
    type: Literal["voiceover", "ambient", "sfx", "music"] = "voiceover"
    startFrame: int = Field(default=0, ge=0)
    durationInFrames: int = Field(gt=0)
    volume: float = Field(default=1.0, ge=0.0, le=1.0)

class TimelineOverlaySchema(BaseModel):
    id: str
    type: Literal["caption", "watermark", "lower_third", "progress_bar"]
    startFrame: int = Field(default=0, ge=0)
    durationInFrames: int = Field(gt=0)
    props: Dict[str, Any] = Field(default_factory=dict)

class TimelineSchema(BaseModel):
    version: int = Field(default=1, description="Timeline schema version")
    width: int = Field(default=1080, ge=720, description="Video width in pixels (e.g. 1080 for 9:16)")
    height: int = Field(default=1920, ge=1280, description="Video height in pixels (e.g. 1920 for 9:16)")
    fps: int = Field(default=30, description="Framerate (30 or 60)")
    durationInFrames: int = Field(gt=0, description="Total duration in frames")
    styleId: str = Field(default="modern_creator_v1", description="Associated style preset")
    scenes: List[TimelineSceneSchema] = Field(default_factory=list)
    audioTracks: List[TimelineAudioTrackSchema] = Field(default_factory=list)
    overlays: List[TimelineOverlaySchema] = Field(default_factory=list)
    metadata: Optional[Dict[str, Any]] = None
