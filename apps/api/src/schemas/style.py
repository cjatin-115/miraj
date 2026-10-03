from typing import List, Optional, Literal, Dict
from pydantic import BaseModel, Field

class TypographySchema(BaseModel):
    fontFamilyHeading: str
    fontFamilyBody: str
    fontFamilyMono: str
    fontFamilyCaption: str
    fontSizes: Dict[str, int]
    fontWeights: Dict[str, int]
    lineHeights: Dict[str, float]
    letterSpacings: Dict[str, str]

class CaptionSchema(BaseModel):
    position: Literal["bottom", "center", "top"]
    maxWordsPerSegment: int
    fontSize: int
    fontWeight: int
    textCase: Literal["none", "uppercase", "capitalize"]
    textColor: str
    highlightTextColor: str
    highlightBackgroundColor: Optional[str] = None
    backgroundTreatment: Literal["none", "pill", "box", "subtle_shadow"]
    textShadow: str
    stroke: str

class KeywordEmphasisSchema(BaseModel):
    highlightColors: List[str]
    animation: Literal["scale", "glow", "bounce", "highlight_wipe"]
    scaleFactor: float
    bracketDecoration: bool
    boxHighlight: bool

class ColorPaletteSchema(BaseModel):
    background: str
    backgroundCard: str
    textPrimary: str
    textSecondary: str
    textMuted: str
    accentPrimary: str
    accentSecondary: str
    accentHighlight: str
    success: str
    warning: str
    danger: str
    borderSubtle: str
    borderGlow: str

class SpacingSchema(BaseModel):
    xs: int
    sm: int
    md: int
    lg: int
    xl: int
    xxl: int
    cardPadding: int
    screenPadding: int

class SafeAreasSchema(BaseModel):
    top: int
    bottom: int
    left: int
    right: int

class FramingSchema(BaseModel):
    defaultZoom: float
    punchInZoom: float
    superPunchInZoom: float
    cornerRadius: int
    borderWidth: int
    borderColor: str
    shadow: str
    anchorPosition: Literal["center", "bottom_center", "top_center"]
    backgroundTreatment: Literal["blur_source", "solid_gradient", "ambient_glow"]
    backgroundBlurSigma: int

class AnimationSpeedSchema(BaseModel):
    fastMs: int
    normalMs: int
    slowMs: int
    defaultTransitionFrames: int
    springConfig: Dict[str, float]

class TransitionsSchema(BaseModel):
    defaultType: str
    available: List[str]
    durationFrames: int

class StyleConfigSchema(BaseModel):
    id: str
    name: str
    description: str
    version: str
    visualDensity: Literal["compact", "comfortable", "editorial"]
    typography: TypographySchema
    captions: CaptionSchema
    keywordEmphasis: KeywordEmphasisSchema
    colors: ColorPaletteSchema
    spacing: SpacingSchema
    safeAreas: SafeAreasSchema
    framing: FramingSchema
    animationSpeed: AnimationSpeedSchema
    transitions: TransitionsSchema
