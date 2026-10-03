from fastapi import APIRouter, HTTPException, status
from ...schemas.style import StyleConfigSchema

router = APIRouter(prefix="/styles", tags=["Styles"])

MODERN_CREATOR_V1_CONFIG = {
    "id": "modern_creator_v1",
    "name": "Modern Creator V1",
    "description": "Signature short-form creator aesthetic with talking-head reframing, bold editorial captions, and high-impact visual cards.",
    "version": "1.0.0",
    "visualDensity": "comfortable",
    "typography": {
        "fontFamilyHeading": "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        "fontFamilyBody": "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        "fontFamilyMono": "JetBrains Mono, Fira Code, Consolas, monospace",
        "fontFamilyCaption": "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        "fontSizes": {
            "hero": 96,
            "h1": 72,
            "h2": 54,
            "h3": 40,
            "bodyLarge": 32,
            "body": 26,
            "caption": 48,
            "badge": 20
        },
        "fontWeights": {
            "regular": 400,
            "medium": 500,
            "semibold": 600,
            "bold": 700,
            "black": 900
        },
        "lineHeights": {
            "tight": 1.05,
            "snug": 1.2,
            "normal": 1.4,
            "relaxed": 1.6
        },
        "letterSpacings": {
            "tighter": "-0.05em",
            "tight": "-0.025em",
            "normal": "0em",
            "wide": "0.025em",
            "widest": "0.08em"
        }
    },
    "captions": {
        "position": "bottom",
        "maxWordsPerSegment": 3,
        "fontSize": 52,
        "fontWeight": 900,
        "textCase": "uppercase",
        "textColor": "#FFFFFF",
        "highlightTextColor": "#FFE600",
        "highlightBackgroundColor": "rgba(0, 0, 0, 0.4)",
        "backgroundTreatment": "subtle_shadow",
        "textShadow": "0 4px 16px rgba(0, 0, 0, 0.95), 0 2px 4px rgba(0, 0, 0, 0.8)",
        "stroke": "2px black"
    },
    "keywordEmphasis": {
        "highlightColors": [
            "#FFE600",
            "#00F0FF",
            "#FF2E93",
            "#39FF14"
        ],
        "animation": "bounce",
        "scaleFactor": 1.15,
        "bracketDecoration": False,
        "boxHighlight": True
    },
    "colors": {
        "background": "#07090E",
        "backgroundCard": "#111625",
        "textPrimary": "#F8FAFC",
        "textSecondary": "#94A3B8",
        "textMuted": "#64748B",
        "accentPrimary": "#3B82F6",
        "accentSecondary": "#8B5CF6",
        "accentHighlight": "#FFE600",
        "success": "#10B981",
        "warning": "#F59E0B",
        "danger": "#EF4444",
        "borderSubtle": "rgba(255, 255, 255, 0.1)",
        "borderGlow": "rgba(59, 130, 246, 0.4)"
    },
    "spacing": {
        "xs": 8,
        "sm": 16,
        "md": 24,
        "lg": 36,
        "xl": 48,
        "xxl": 64,
        "cardPadding": 40,
        "screenPadding": 54
    },
    "safeAreas": {
        "top": 140,
        "bottom": 240,
        "left": 48,
        "right": 48
    },
    "framing": {
        "defaultZoom": 1.0,
        "punchInZoom": 1.25,
        "superPunchInZoom": 1.45,
        "cornerRadius": 36,
        "borderWidth": 3,
        "borderColor": "rgba(255, 255, 255, 0.15)",
        "shadow": "0 25px 60px -15px rgba(0, 0, 0, 0.8)",
        "anchorPosition": "center",
        "backgroundTreatment": "blur_source",
        "backgroundBlurSigma": 32
    },
    "animationSpeed": {
        "fastMs": 150,
        "normalMs": 300,
        "slowMs": 500,
        "defaultTransitionFrames": 8,
        "springConfig": {
            "damping": 14,
            "mass": 0.8,
            "stiffness": 120
        }
    },
    "transitions": {
        "defaultType": "cut",
        "available": ["cut", "fade", "zoom", "slide", "blur", "scale", "mask", "whip"],
        "durationFrames": 8
    }
}

@router.get("", response_model=list[StyleConfigSchema])
async def list_styles():
    return [MODERN_CREATOR_V1_CONFIG]

@router.get("/{style_id}", response_model=StyleConfigSchema)
async def get_style(style_id: str):
    if style_id == "modern_creator_v1":
        return MODERN_CREATOR_V1_CONFIG
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Style '{style_id}' not found."
    )
