/**
 * Miraaj Timeline Schema
 * Deterministic, serializable timeline specifications for Remotion rendering.
 */

export type TimelineSceneType =
  | 'talking_head'
  | 'talking_head_zoom'
  | 'talking_head_overlay'
  | 'talking_head_split'
  | 'fullscreen_text'
  | 'keyword_text'
  | 'editorial_text'
  | 'caption'
  | 'screenshot'
  | 'browser'
  | 'code'
  | 'comparison'
  | 'statistics'
  | 'graph'
  | 'product_card'
  | 'image_broll'
  | 'video_broll'
  | 'diagram'
  | 'quote'
  | 'cta';

export type TimelineTransitionType =
  | 'cut'
  | 'fade'
  | 'zoom'
  | 'slide'
  | 'blur'
  | 'scale'
  | 'mask'
  | 'whip';

export interface TimelineTransition {
  type: TimelineTransitionType;
  durationInFrames: number;
  direction?: 'left' | 'right' | 'up' | 'down' | 'in' | 'out';
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'spring';
}

export interface TalkingHeadProps {
  videoSrc: string;
  sourceStartFrame: number;
  zoomLevel?: number; // 1.0 = normal, 1.25 = punch-in
  panX?: number; // -1 to 1 offset
  panY?: number;
  overlayText?: string;
  splitLayout?: 'left-right' | 'top-bottom';
  secondarySrc?: string;
  roundedCorners?: boolean;
  backgroundTreatment?: 'blur' | 'dark' | 'gradient';
}

export interface FullscreenTextProps {
  headline: string;
  subheadline?: string;
  accentWord?: string;
  accentColor?: string;
  theme?: 'dark' | 'neon' | 'editorial';
}

export interface KeywordTextProps {
  keywords: Array<{
    text: string;
    highlight?: boolean;
    color?: string;
    scale?: number;
  }>;
  layout?: 'stacked' | 'horizontal' | 'grid';
  animation?: 'pop' | 'typewriter' | 'fade-up';
}

export interface EditorialTextProps {
  eyebrow?: string;
  title: string;
  paragraph: string;
  citation?: string;
  bulletPoints?: string[];
}

export interface CaptionProps {
  words: Array<{
    word: string;
    startFrame: number;
    endFrame: number;
    highlight?: boolean;
  }>;
  position?: 'bottom' | 'center' | 'top';
  highlightColor?: string;
}

export interface CodeSceneProps {
  code: string;
  language: string;
  filename?: string;
  highlightLines?: number[];
  theme?: 'vivid-dark' | 'nord' | 'monokai';
}

export interface ComparisonSceneProps {
  leftTitle: string;
  leftPoints: string[];
  rightTitle: string;
  rightPoints: string[];
  winner?: 'left' | 'right' | 'none';
}

export interface StatisticsSceneProps {
  statNumber: string;
  statLabel: string;
  comparisonText?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface GraphSceneProps {
  graphType: 'bar' | 'line' | 'pie';
  title: string;
  labels: string[];
  values: number[];
  colorScheme?: string[];
}

export interface ProductCardSceneProps {
  productName: string;
  badge?: string;
  imageUrl?: string;
  rating?: number;
  keyFeatures: string[];
  price?: string;
}

export interface BrollSceneProps {
  mediaSrc: string;
  mediaType: 'image' | 'video';
  sourceStartFrame?: number;
  kenBurns?: 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right' | 'none';
  overlayCaption?: string;
}

export interface DiagramSceneProps {
  steps: Array<{
    title: string;
    description?: string;
    icon?: string;
  }>;
  currentStepIndex: number;
}

export interface QuoteSceneProps {
  quote: string;
  author: string;
  authorTitle?: string;
  avatarUrl?: string;
}

export interface CTASceneProps {
  headline: string;
  subtext?: string;
  buttonText: string;
  arrowAnimation?: boolean;
}

export type SceneProps =
  | TalkingHeadProps
  | FullscreenTextProps
  | KeywordTextProps
  | EditorialTextProps
  | CaptionProps
  | CodeSceneProps
  | ComparisonSceneProps
  | StatisticsSceneProps
  | GraphSceneProps
  | ProductCardSceneProps
  | BrollSceneProps
  | DiagramSceneProps
  | QuoteSceneProps
  | CTASceneProps
  | Record<string, unknown>;

export interface TimelineScene {
  id: string;
  type: TimelineSceneType;
  startFrame: number;
  durationInFrames: number;
  transitionIn?: TimelineTransition;
  transitionOut?: TimelineTransition;
  props: SceneProps;
}

export interface TimelineAudioTrack {
  id: string;
  src: string;
  type: 'voiceover' | 'ambient' | 'sfx' | 'music';
  startFrame: number;
  durationInFrames: number;
  volume: number; // 0.0 to 1.0
}

export interface TimelineOverlay {
  id: string;
  type: 'caption' | 'watermark' | 'lower_third' | 'progress_bar';
  startFrame: number;
  durationInFrames: number;
  props: Record<string, unknown>;
}

export interface Timeline {
  version: 1;
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  styleId: string;
  scenes: TimelineScene[];
  audioTracks: TimelineAudioTrack[];
  overlays: TimelineOverlay[];
  metadata?: {
    projectId?: string;
    generatedAt?: string;
    aiProvider?: string;
    generatorVersion?: string;
  };
}
