# Miraaj V1 — Architecture Specification

## Overview

**Miraaj** (meaning mirage / illusion seen in deserts) is a personal AI-powered short-form video generation system designed to take an ordinary webcam / talking-head recording and script and transform it into a polished, highly-edited vertical short-form video (1080x1920 @ 30fps).

---

## Core Paradigm

> **AI determines WHAT should happen.**
> **Deterministic rendering code determines HOW it looks.**

Under this architectural principle:
- LLMs never generate arbitrary rendering code or free-form CSS/Canvas commands.
- The LLM acts strictly as an **AI Director**, outputting validated JSON conforming to the `EditPlan` schema.
- The pipeline compiles the `EditPlan` into a deterministic, reproducible `Timeline` JSON.
- Deterministic Remotion React components and CSS transition rules render every scene with pixel-perfect predictability.

---

## Complete Pipeline Workflow

```
SCRIPT + WEBCAM VIDEO
         ↓
  MEDIA INGESTION       (FFprobe extracts duration, resolution, audio streams)
         ↓
VIDEO/AUDIO ANALYSIS    (Face anchoring, speech intervals, silence detection)
         ↓
   TRANSCRIPTION        (Timestamped word boundaries)
         ↓
  SCRIPT ANALYSIS       (Keyword extraction, pacing, narrative hooks)
         ↓
DURATION ESTIMATION     (Speaking rate modeling ~150 wpm)
         ↓
    AI DIRECTOR         (Scene breakdown, visual intents, emphasis cues)
         ↓
  EDIT PLAN JSON        (Pydantic-validated structured plan)
         ↓
   TIMELINE JSON        (Deterministic 9:16 Remotion Timeline specification)
         ↓
 ASSET GENERATION       (Code cards, graphs, keyword typography, screenshot b-roll)
         ↓
     REMOTION           (React composition rendering with 30fps frame indexing)
         ↓
      FFMPEG            (Encoding, video muxing, high-efficiency MP4 export)
         ↓
 QUALITY CONTROL        (Duration verification, audio sync check)
         ↓
    FINAL MP4
```

---

## Monorepo Layout

```
/
  apps/
    web/            Next.js App Router frontend shell with live webcam recording & project viewer
    api/            FastAPI server with PostgreSQL & Redis integration, AI Provider abstractions
    renderer/       Remotion React compositions for all creator scenes & transitions

  packages/
    shared/         Shared TypeScript types matching Python backend entities
    timeline/       Timeline JSON schemas, validation utilities, and sample vertical timeline
    style-system/   modern_creator_v1 configuration-driven visual theme

  workers/
    video-worker/   Asynchronous Python queue worker executing pipeline tasks via Redis

  storage/
    projects/       Local filesystem asset storage (abstracted via StorageProvider)

  scripts/          Developer runner scripts (dev.ps1, dev.sh, setup_wsl_services.sh)
  docs/             Specifications for architecture, timeline, and style system
  docker-compose.yml Docker services for PostgreSQL and Redis
  .env.example      Exhaustive environment variables template
  README.md         Project handbook and startup documentation
```

---

## Core Entities & Data Models

1. **Project**: Top-level entity managing metadata, status (`draft`, `processing`, `ready`, `failed`), and relationships.
2. **Job**: Asynchronous unit of work queued in Redis and tracked in database with live progress percentage (0-100) and stage message.
3. **SourceVideo**: Recorded or uploaded talking-head video file with probed dimensions, duration, format, and audio stream.
4. **Script**: Spoken text narrative with word count, language, and calculated duration.
5. **Analysis**: Structured output of audio/video analysis, speech intervals, and keyword emphasis extraction.
6. **EditPlan**: AI Director's strategic breakdown of scenes, pacing, and visual intent.
7. **Timeline**: The central Remotion object specifying exact frame ranges, transitions, and scene props.
8. **Asset**: Supporting visual assets (b-roll, diagrams, code snippets, graphs, audio tracks).
9. **RenderJob**: Queue item for headless Remotion/FFmpeg rendering.
10. **RenderResult**: Generated final vertical MP4 details and storage URLs.
