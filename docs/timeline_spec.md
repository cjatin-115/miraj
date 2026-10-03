# Miraaj Timeline JSON Specification

## Overview

The `Timeline` object is the definitive interface between the AI Director and the deterministic Remotion video renderer. It represents a 100% reproducible vertical video composition.

---

## Schema Properties

```typescript
interface Timeline {
  version: 1;
  width: number;            // 1080 (standard 9:16 vertical)
  height: number;           // 1920
  fps: number;              // 30
  durationInFrames: number; // Total frame count (e.g. 900 frames = 30 seconds)
  styleId: string;          // e.g. "modern_creator_v1"
  scenes: TimelineScene[];
  audioTracks: TimelineAudioTrack[];
  overlays: TimelineOverlay[];
  metadata?: Record<string, unknown>;
}
```

---

## Supported Scene Types

| Scene Type | Visual Intent & Props |
|---|---|
| `talking_head` | Anchor webcam footage with zoom reframing, rounded corners, and ambient blur. |
| `talking_head_zoom` | Dynamic punch-in reframing (1.25x - 1.4x zoom) emphasizing pivotal statements. |
| `talking_head_overlay` | Talking-head window nested with editorial text or UI cards. |
| `talking_head_split` | Split layout comparing creator with software demo or b-roll. |
| `fullscreen_text` | High-impact text scene with animated accent word highlighting. |
| `keyword_text` | Stacked or horizontal creator typography with neon popped keywords. |
| `editorial_text` | Elegant typography card with eyebrow, title, paragraph, and citation. |
| `caption` | Synchronized karaoke-style word highlighting at the bottom safe area. |
| `code` | Syntax-highlighted code editor window with highlighted lines. |
| `comparison` | Side-by-side comparison cards with green/red indicator chips. |
| `statistics` | Bold numeric metric with trend indicator (up/down). |
| `graph` | Animated bar, line, or circular metric representation. |
| `product_card` | Software or physical product spotlight card with badge and ratings. |
| `image_broll` | Ken-burns panned supporting imagery. |
| `video_broll` | Supporting video footage overlay. |
| `diagram` | Step-by-step sequential workflow visualizer. |
| `quote` | Prominent quote with attribution and avatar. |
| `cta` | High-converting call-to-action with animated pulsing button. |

---

## Supported Transitions

- `cut`: Instant cut between scenes (0 duration).
- `fade`: Smooth crossfade or fade from black.
- `zoom`: Camera zoom-in or zoom-out transition.
- `slide`: Directional slide (left, right, up, down).
- `blur`: High-speed motion blur dissolve.
- `scale`: Elastic scale entrance.
- `mask`: Geometric wipe mask.
- `whip`: Fast whip-pan camera transition with directional blur.
