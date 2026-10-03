import { Timeline } from '@miraaj/timeline';

export const sampleTimeline: Timeline = {
  version: 1,
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 300, // 10.0 seconds
  styleId: 'modern_creator_v1',
  scenes: [
    {
      id: 'scene_001',
      type: 'talking_head_zoom',
      startFrame: 0,
      durationInFrames: 90,
      transitionIn: { type: 'cut', durationInFrames: 0 },
      props: {
        videoSrc: '',
        zoomLevel: 1.25,
        sourceStartFrame: 0,
        overlayText: 'Stop Editing Manually!',
      },
    },
    {
      id: 'scene_002',
      type: 'statistics',
      startFrame: 90,
      durationInFrames: 90,
      transitionIn: { type: 'zoom', durationInFrames: 10 },
      props: {
        statNumber: '5x',
        statLabel: 'Faster production with AI automation',
        comparisonText: 'Compared to traditional manual editing',
        trend: 'up',
      },
    },
    {
      id: 'scene_003',
      type: 'comparison',
      startFrame: 180,
      durationInFrames: 60,
      transitionIn: { type: 'fade', durationInFrames: 10 },
      props: {
        leftTitle: 'Traditional',
        leftPoints: ['5 hours per video', '$500/week cost', 'Inconsistent pacing'],
        rightTitle: 'Miraaj V1',
        rightPoints: ['10 seconds render', 'Zero API cost', 'Deterministic 1080x1920'],
        winner: 'right',
      },
    },
    {
      id: 'scene_004',
      type: 'cta',
      startFrame: 240,
      durationInFrames: 60,
      transitionIn: { type: 'slide', durationInFrames: 10, direction: 'up' },
      props: {
        headline: 'Automate Your Video Workflow',
        subtext: 'Built for developers and creators',
        buttonText: 'Get Started Now',
        arrowAnimation: true,
      },
    },
  ],
  audioTracks: [],
  overlays: [
    {
      id: 'overlay_captions',
      type: 'caption',
      startFrame: 0,
      durationInFrames: 300,
      props: {
        words: [
          { word: 'STOP', startFrame: 5, endFrame: 15, highlight: true },
          { word: 'EDITING', startFrame: 16, endFrame: 30, highlight: false },
          { word: 'MANUALLY', startFrame: 31, endFrame: 50, highlight: true },
          { word: 'PRODUCE', startFrame: 95, endFrame: 110, highlight: false },
          { word: '5X', startFrame: 111, endFrame: 130, highlight: true },
          { word: 'FASTER', startFrame: 131, endFrame: 160, highlight: true },
        ],
      },
    },
  ],
  metadata: {
    projectId: 'sample',
    generatedAt: new Date().toISOString(),
    aiProvider: 'mock_director',
  },
};
