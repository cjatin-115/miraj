from fastapi import APIRouter, status
from ...schemas.timeline import TimelineSchema

router = APIRouter(prefix="/timelines", tags=["Timelines"])

@router.get("/schema", status_code=status.HTTP_200_OK)
async def get_timeline_json_schema():
    """Return JSON Schema representation of the deterministic Timeline model."""
    return TimelineSchema.model_json_schema()

@router.get("/sample", response_model=TimelineSchema, status_code=status.HTTP_200_OK)
async def get_sample_timeline():
    """Returns a deterministic reference 9:16 vertical video timeline."""
    return {
        "version": 1,
        "width": 1080,
        "height": 1920,
        "fps": 30,
        "durationInFrames": 360,
        "styleId": "modern_creator_v1",
        "scenes": [
            {
                "id": "scene-1",
                "type": "talking_head",
                "startFrame": 0,
                "durationInFrames": 60,
                "transitionIn": {"type": "fade", "durationInFrames": 6},
                "transitionOut": {"type": "cut", "durationInFrames": 0},
                "props": {
                    "videoSrc": "/storage/sample-webcam.mp4",
                    "sourceStartFrame": 0,
                    "zoomLevel": 1.0,
                    "overlayText": "Introducing Miraaj V1",
                    "roundedCorners": True,
                    "backgroundTreatment": "dark"
                }
            },
            {
                "id": "scene-2",
                "type": "keyword_text",
                "startFrame": 60,
                "durationInFrames": 60,
                "transitionIn": {"type": "zoom", "durationInFrames": 8},
                "transitionOut": {"type": "cut", "durationInFrames": 0},
                "props": {
                    "keywords": [
                        {"text": "DETERMINISTIC", "highlight": True, "color": "#FFE600", "scale": 1.2},
                        {"text": "RENDERING", "highlight": False, "color": "#FFFFFF"},
                        {"text": "PIPELINE", "highlight": True, "color": "#00F0FF"}
                    ],
                    "layout": "stacked",
                    "animation": "pop"
                }
            },
            {
                "id": "scene-3",
                "type": "talking_head_zoom",
                "startFrame": 120,
                "durationInFrames": 60,
                "transitionIn": {"type": "cut", "durationInFrames": 0},
                "transitionOut": {"type": "slide", "durationInFrames": 8, "direction": "left"},
                "props": {
                    "videoSrc": "/storage/sample-webcam.mp4",
                    "sourceStartFrame": 60,
                    "zoomLevel": 1.28,
                    "panY": -0.05,
                    "roundedCorners": True,
                    "backgroundTreatment": "blur"
                }
            },
            {
                "id": "scene-4",
                "type": "code",
                "startFrame": 180,
                "durationInFrames": 90,
                "transitionIn": {"type": "slide", "durationInFrames": 8, "direction": "right"},
                "transitionOut": {"type": "fade", "durationInFrames": 8},
                "props": {
                    "filename": "pipeline.py",
                    "language": "python",
                    "code": "def execute_pipeline(script, video):\n    plan = ai_director.plan(script)\n    timeline = build_timeline(plan)\n    return remotion.render(timeline)",
                    "highlightLines": [2, 3],
                    "theme": "vivid-dark"
                }
            },
            {
                "id": "scene-5",
                "type": "cta",
                "startFrame": 270,
                "durationInFrames": 90,
                "transitionIn": {"type": "fade", "durationInFrames": 8},
                "transitionOut": {"type": "fade", "durationInFrames": 10},
                "props": {
                    "headline": "MIRAAJ V1",
                    "subtext": "AI Determines WHAT. Code Renders HOW.",
                    "buttonText": "Try The Pipeline",
                    "arrowAnimation": True
                }
            }
        ],
        "audioTracks": [
            {
                "id": "voice-track",
                "src": "/storage/sample-webcam.mp4",
                "type": "voiceover",
                "startFrame": 0,
                "durationInFrames": 360,
                "volume": 1.0
            }
        ],
        "overlays": [
            {
                "id": "progress-bar",
                "type": "progress_bar",
                "startFrame": 0,
                "durationInFrames": 360,
                "props": {
                    "height": 6,
                    "color": "#FFE600",
                    "position": "top"
                }
            }
        ],
        "metadata": {
            "projectId": "sample-project",
            "generatorVersion": "miraaj-v1"
        }
    }
