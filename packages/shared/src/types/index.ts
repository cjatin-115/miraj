/**
 * Miraaj Core Shared Types
 * Strongly typed definitions shared across API, Frontend, and Renderer.
 */

export type ProjectStatus = 'draft' | 'processing' | 'analyzed' | 'ready' | 'failed';

export interface Timeline {
  id?: string;
  project_id?: string;
  version: number;
  width: number;
  height: number;
  fps: number;
  durationInFrames?: number;
  style_id?: string;
  styleId?: string;
  scenes?: any[];
  audio_tracks?: any[];
  audioTracks?: any[];
  overlays?: any[];
  metadata?: Record<string, unknown>;
  created_at?: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string | null;
  status: ProjectStatus;
  style_id: string;
  created_at: string;
  updated_at: string;
  source_video?: SourceVideo | null;
  script?: Script | null;
  analysis?: Analysis | null;
  edit_plan?: EditPlan | null;
  timeline?: Timeline | null;
  jobs?: Job[];
}

export type JobType = 'ingest' | 'analyze' | 'plan' | 'render' | 'composite';
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Job {
  id: string;
  project_id: string;
  type: JobType;
  status: JobStatus;
  progress: number;
  stage_message?: string | null;
  error_message?: string | null;
  payload?: Record<string, unknown> | null;
  result?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface SourceVideo {
  id: string;
  project_id: string;
  filename: string;
  storage_path: string;
  duration_seconds: number;
  width: number;
  height: number;
  fps: number;
  format: string;
  file_size_bytes: number;
  has_audio: boolean;
  created_at: string;
}

export interface Script {
  id: string;
  project_id: string;
  raw_text: string;
  word_count: number;
  estimated_duration_seconds: number;
  language: string;
  created_at: string;
}

export interface WordTimestamp {
  word: string;
  start_ms: number;
  end_ms: number;
  confidence: number;
}

export interface TranscriptSegment {
  id: number;
  start_ms: number;
  end_ms: number;
  text: string;
  words: WordTimestamp[];
}

export interface VideoFaceDetection {
  detected: boolean;
  box?: { x: number; y: number; width: number; height: number };
  center_x?: number;
  center_y?: number;
}

export interface Analysis {
  id: string;
  project_id: string;
  transcript?: {
    segments?: TranscriptSegment[];
    full_text?: string;
    detected_language?: string;
    words?: any[];
  } | null;
  transcript_data?: any;
  visual_metrics?: any;
  keywords?: string[];
  key_phrases?: string[];
  sentiment?: string;
  created_at?: string;
}

export interface CropConfig {
  mode?: string;
  scale?: number;
  pan_x?: number;
  pan_y?: number;
}

export interface TransitionConfig {
  type: string;
  duration?: number;
  direction?: string;
  easing?: string;
}

export interface AssetRequest {
  type: string;
  data?: Record<string, any>;
}

export interface ScenePlan {
  id: string;
  type: string;
  source_start: number;
  source_end: number;
  timeline_start: number;
  duration: number;
  crop?: CropConfig;
  asset?: AssetRequest;
  transition?: TransitionConfig;
  caption?: string;
  emphasis_words?: string[];
  visual_intent?: string;

  // Optional legacy fields for backward compatibility
  scene_index?: number;
  scene_type?: string;
  start_time_seconds?: number;
  duration_seconds?: number;
  script_slice?: string;
  suggested_transition?: string;
  emphasis_keywords?: string[];
  asset_type?: string;
  props?: Record<string, unknown>;
}

export interface EditPlan {
  id?: string;
  project_id?: string;
  version: number;
  duration: number;
  pacing: string;
  rationale?: string;
  scenes: ScenePlan[];
  quality_score?: number;
  plan_version?: number;
  estimated_duration_seconds?: number;
  created_at?: string;
}

export interface Asset {
  id: string;
  project_id: string;
  type: 'broll' | 'screenshot' | 'code' | 'graph' | 'card' | 'audio';
  name: string;
  storage_path: string;
  mime_type: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface RenderJob {
  id: string;
  project_id: string;
  timeline_id: string;
  status: JobStatus;
  resolution: '1080x1920' | '2160x3840';
  fps: number;
  output_format: 'mp4';
  progress: number;
  error?: string | null;
  created_at: string;
  completed_at?: string | null;
}

export interface RenderResult {
  id: string;
  render_job_id: string;
  storage_path: string;
  public_url: string;
  duration_seconds: number;
  file_size_bytes: number;
  width: number;
  height: number;
  fps: number;
  created_at: string;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  environment: string;
  services: {
    database: {
      status: 'connected' | 'disconnected' | 'error';
      type: string;
      message?: string;
    };
    redis: {
      status: 'connected' | 'disconnected' | 'error';
      message?: string;
    };
    ffmpeg: {
      available: boolean;
      version?: string;
      path?: string;
    };
    storage: {
      provider: string;
      root_writable: boolean;
    };
  };
}
