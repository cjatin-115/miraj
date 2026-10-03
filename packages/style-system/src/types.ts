/**
 * Style System Types
 * Configuration-driven visual language specification for Miraaj.
 */

export interface TypographyConfig {
  fontFamilyHeading: string;
  fontFamilyBody: string;
  fontFamilyMono: string;
  fontFamilyCaption: string;
  fontSizes: {
    hero: number;
    h1: number;
    h2: number;
    h3: number;
    bodyLarge: number;
    body: number;
    caption: number;
    badge: number;
  };
  fontWeights: {
    regular: number;
    medium: number;
    semibold: number;
    bold: number;
    black: number;
  };
  lineHeights: {
    tight: number;
    snug: number;
    normal: number;
    relaxed: number;
  };
  letterSpacings: {
    tighter: string;
    tight: string;
    normal: string;
    wide: string;
    widest: string;
  };
}

export interface CaptionConfig {
  position: 'bottom' | 'center' | 'top';
  maxWordsPerSegment: number;
  fontSize: number;
  fontWeight: number;
  textCase: 'none' | 'uppercase' | 'capitalize';
  textColor: string;
  highlightTextColor: string;
  highlightBackgroundColor?: string;
  backgroundTreatment: 'none' | 'pill' | 'box' | 'subtle_shadow';
  textShadow: string;
  stroke: string;
}

export interface KeywordEmphasisConfig {
  highlightColors: string[];
  animation: 'scale' | 'glow' | 'bounce' | 'highlight_wipe';
  scaleFactor: number;
  bracketDecoration: boolean;
  boxHighlight: boolean;
}

export interface ColorPaletteConfig {
  background: string;
  backgroundCard: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentPrimary: string;
  accentSecondary: string;
  accentHighlight: string;
  success: string;
  warning: string;
  danger: string;
  borderSubtle: string;
  borderGlow: string;
}

export interface SpacingConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  cardPadding: number;
  screenPadding: number;
}

export interface SafeAreasConfig {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface FramingConfig {
  defaultZoom: number;
  punchInZoom: number;
  superPunchInZoom: number;
  cornerRadius: number;
  borderWidth: number;
  borderColor: string;
  shadow: string;
  anchorPosition: 'center' | 'bottom_center' | 'top_center';
  backgroundTreatment: 'blur_source' | 'solid_gradient' | 'ambient_glow';
  backgroundBlurSigma: number;
}

export interface AnimationSpeedConfig {
  fastMs: number;
  normalMs: number;
  slowMs: number;
  defaultTransitionFrames: number;
  springConfig: {
    damping: number;
    mass: number;
    stiffness: number;
  };
}

export interface TransitionsConfig {
  defaultType: 'cut' | 'fade' | 'zoom' | 'slide' | 'blur' | 'scale' | 'mask' | 'whip';
  available: string[];
  durationFrames: number;
}

export interface StyleConfig {
  id: string;
  name: string;
  description: string;
  version: string;
  typography: TypographyConfig;
  captions: CaptionConfig;
  keywordEmphasis: KeywordEmphasisConfig;
  colors: ColorPaletteConfig;
  spacing: SpacingConfig;
  safeAreas: SafeAreasConfig;
  framing: FramingConfig;
  animationSpeed: AnimationSpeedConfig;
  transitions: TransitionsConfig;
  visualDensity: 'compact' | 'comfortable' | 'editorial';
}
