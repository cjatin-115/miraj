# Miraaj Style System — modern_creator_v1

## Concept

The **Style System** ensures that all visual properties (typography, colors, padding, framing, caption layout, and animation physics) remain configuration-driven rather than scattered across rendering components.

---

## Configuration Categories

1. **Typography**:
   - `fontFamilyHeading`: Modern high-impact sans-serif.
   - `fontFamilyMono`: JetBrains Mono / code monospace.
   - Font sizes calibrated for 1080x1920: Hero (96px), H1 (72px), Body (26px), Captions (52px).

2. **Captions**:
   - `position`: "bottom" (safe from top platform notch and bottom action bar).
   - `maxWordsPerSegment`: 3 words (optimal cognitive absorption for rapid mobile feeds).
   - `highlightTextColor`: `#FFE600` (neon yellow creator signature).

3. **Keyword Emphasis**:
   - `highlightColors`: `["#FFE600", "#00F0FF", "#FF2E93", "#39FF14"]`.
   - `animation`: "bounce" with elastic scale factor (1.15x).

4. **Talking-Head Framing**:
   - `cornerRadius`: 36px rounded video window.
   - `borderWidth`: 3px subtle glow border.
   - `shadow`: Deep drop shadow for depth separation.
   - `backgroundTreatment`: Dynamic Gaussian blur of source video.
   - `punchInZoom`: 1.25x for reframing emphasis on key insights.

5. **Safe Areas**:
   - Top: 140px (status bar, profile icons).
   - Bottom: 240px (platform caption overlays, creator title, like/share icons).
   - Left / Right: 48px.
