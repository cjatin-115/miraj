# Miraaj (معراج) — AI Short-Form Video Generation Pipeline (V1)

> **"Miraaj"** refers to a mirage or illusion seen in deserts. In video creation, Miraaj takes a creator's ordinary webcam talking-head recording and script and transforms it into a polished, high-impact vertical short-form video (1080x1920 @ 30 FPS).

---

## Architecture Principle

```
AI determines WHAT should happen.
Deterministic rendering code determines HOW it looks.
```

An LLM is never permitted to write arbitrary CSS or free-form rendering code. Instead, the AI Director outputs structured JSON conforming to the `EditPlan` schema, which compiles into a deterministic `Timeline` JSON rendered with pixel perfection by Remotion.

---

## Complete 20-Step Core Pipeline

```
1. SCRIPT + WEBCAM VIDEO UPLOAD
         ↓
2. PROJECT & SCRIPT INGESTION (Word count, duration estimation)
         ↓
3. MEDIA INGESTION           (FFprobe extracts duration, resolution, audio streams)
         ↓
4. PROXY & AUDIO EXTRACTION  (16kHz mono WAV + 720p analysis proxy)
         ↓
5. FRAME EXTRACTION          (Representative frames extracted every 1s)
         ↓
6. FACE & FRAMING ANALYSIS   (OpenCV/MediaPipe face anchoring, centering, stability)
         ↓
7. AUDIO ACOUSTIC ANALYSIS   (Speech vs silence intervals, RMS loudness, peak dBFS)
         ↓
8. LOCAL SPEECH RECOGNITION  (Whisper word-level timestamped transcription)
         ↓
9. SCRIPT INTELLIGENCE       (Candidate visual moments, keyword extraction, sentiment)
         ↓
10. DURATION ESTIMATION      (Cadence modeling ~150 WPM, natural speaking range)
         ↓
11. TARGET DURATION SELECTOR (Recommended, 45s, 60s, 70s, or Custom)
         ↓
12. MIRAaj AI DIRECTOR       (Scene breakdown, visual intents, punch-in cues)
         ↓
13. EDITPLAN SCHEMA VALIDATION & REPAIR (Pydantic V2 + structured JSON repair)
         ↓
14. TIMELINE COMPILATION     (Deterministic Remotion Timeline JSON with safe margins)
         ↓
15. ASSET RESOLUTION         (Cards, statistics, comparison, code, graphs, quotes, CTA)
         ↓
16. HEADLESS REMOTION RENDER (Chromium WebGL canvas rendering with byte-range proxy)
         ↓
17. MASTER AUDIO ALIGNMENT   (Master speech track alignment and sample sync)
         ↓
18. FFMPEG POST-PROCESSING   (Lossless muxing: -c:v copy -c:a aac -b:a 192k +faststart)
         ↓
19. QUALITY CONTROL (QC)     (Blackdetect 0 frames, drift < 0.05s, resolution & fps check)
         ↓
20. FINAL VALIDATED MP4      (Ready for download, playback, and 4K UHD export)
```

---

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, React 19, Tailwind CSS
- **Backend API**: Python 3.13+, FastAPI, SQLAlchemy 2.0 (async), Pydantic V2
- **Queue & Real-Time Jobs**: Redis / SQLite async jobs with real-time stage progress
- **Database**: SQLite default local-first (`miraaj_local.db`) with PostgreSQL option
- **Media Engine**: FFmpeg 9.0+, FFprobe
- **Rendering**: Remotion composition engine, React 19, TypeScript, WebGL canvas
- **Storage**: Pluggable `StorageProvider` (defaulting to local filesystem under `storage/projects`)
- **AI Providers**: Pluggable provider abstraction with Local-First `MockDirectorProvider` (100% free, deterministic, offline-capable) and Gemini / OpenAI / Anthropic options.
- **Speech Recognition**: Local Whisper (`base` model, CPU/GPU, word timestamps)

---

## Monorepo Layout

```
/
  apps/
    web/            Next.js App Router frontend with live webcam recording, stage tracker, and 4K controls
    api/            FastAPI server with full 20-step pipeline, AI Director, and Remotion CLI engine
    renderer/       Remotion React compositions (talking-head zoom, captions, cards, motion graphics)

  packages/
    shared/         Shared TypeScript types matching Python backend entities
    timeline/       Timeline JSON schemas, validation utilities, and sample vertical timeline
    style-system/   modern_creator_v1 configuration-driven visual theme and safe area constants

  storage/
    projects/       Deterministic project directory storage (webcam, proxy, frames, render)

  scripts/          CLI runners, pipeline verification scripts, and dev launchers
  docker-compose.yml Optional containerized infrastructure for PostgreSQL and Redis
  .env.example      Template for environment configuration
```

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v20+ or v24+
- **Python**: 3.11+ (Python 3.13 tested)
- **FFmpeg**: Must be available on system PATH (`ffmpeg` and `ffprobe`)

### 2. Environment Configuration
```bash
cp .env.example .env
```
Default `.env` settings are completely local-first and require **zero external API keys or cloud accounts**.

### 3. Install Dependencies
```bash
# Install Node workspace dependencies
npm install

# Install Python backend dependencies
pip install -r apps/api/requirements.txt
```

### 4. Run Automated Verification Tests
```bash
# Run backend pytest suite (37 unit, integration, and E2E pipeline tests)
python -m pytest apps/api/tests -v

# Run monorepo TypeScript typecheck across all 5 workspaces
npm run typecheck --workspaces --if-present

# Verify production Next.js build
npm run build --workspace=@miraaj/web
```

### 5. Launch Development Services

#### Backend API (Port 8000)
```bash
python -m uvicorn apps.api.src.main:app --host 127.0.0.1 --port 8000 --reload
```

#### Frontend Web Application (Port 3000)
```bash
npm run dev --workspace=@miraaj/web
```

#### Remotion Studio Preview (Optional, Port 3001)
```bash
npm run preview --workspace=@miraaj/renderer
```

Access the applications:
- **Web App**: [http://localhost:3000](http://localhost:3000)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **API Health Check**: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

---

## Fully Working Features (Miraaj V1)

- [x] **Webcam Recording & File Ingestion**: In-browser camera capture + file upload with deterministic storage.
- [x] **Comprehensive Local Analysis**: Audio acoustics, silence regions, RMS loudness, OpenCV face tracking, camera stability.
- [x] **Word-Level Transcription**: Faster-Whisper / Whisper integration with exact word start/end timestamps.
- [x] **Duration Intelligence Engine**: WPM cadence calculation, natural duration range, target duration selector.
- [x] **AI Director Abstraction**: Structured `EditPlan` formulation with JSON schema validation and deterministic repair.
- [x] **Deterministic Mock Director**: 100% offline, reproducible, and tested without API keys.
- [x] **Remotion Timeline Engine**: Contiguous frame indexing (30 FPS), safe margins (T:140, B:240, S:48px), audio tracks.
- [x] **Rich Scene Component Library**:
  - Talking Head: `FullscreenTalkingHead`, `PunchInTalkingHead`, `RoundedTalkingHead`, `SplitTalkingHead`
  - Typography: `WordCaption`, `KeywordCaption`, `BigStatement`, `EditorialText`, `CTA`
  - Visuals: `Screenshot`, `BrowserWindow`, `CodeBlock`, `ComparisonCard`, `StatCard`, `ProductCard`, `Graph`, `Quote`
  - Motion & Transitions: `Cut`, `Zoom`, `Fade`, `Slide`, `Blur`, `Scale`
- [x] **Ephemeral Media Server**: Built-in HTTP server supporting byte-range requests (`206 Partial Content`) for headless Chromium Remotion workers.
- [x] **FFmpeg Lossless Muxer**: Master speech audio stream extraction and alignment with `-c:v copy -c:a aac -b:a 192k +faststart`.
- [x] **Automated Quality Control**: Verifies dimensions (1080x1920 & 2160x3840), 30.0 fps, AAC audio, duration drift (<0.05s), and runs `blackdetect` (0 black frames).
- [x] **In-Place Scene Regeneration**: Regenerate individual scenes without recomputing the entire timeline.
- [x] **Real-Time 10-Stage Tracker**: Granular live backend job progress (Upload, Media analysis, Transcription, Script analysis, Duration analysis, AI Director, Timeline, Assets, Rendering %, Quality Check).
- [x] **4K UHD Experimental Export**: One-click 2160x3840 rendering option.
