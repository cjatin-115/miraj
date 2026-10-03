import { Timeline } from './types.js';

/**
 * Creates a deterministic reference 9:16 sample timeline for testing and previewing
 */
export function createSampleTimeline(videoSrc = '/storage/sample-webcam.mp4'): Timeline {
  return {
    version: 1,
    width: 1080,
    height: 1920,
    fps: 30,
    durationInFrames: 360, // 12 seconds
    styleId: 'modern_creator_v1',
    scenes: [
      {
        id: 'scene-1',
        type: 'talking_head',
        startFrame: 0,
        durationInFrames: 60,
        transitionIn: { type: 'fade', durationInFrames: 6 },
        transitionOut: { type: 'cut', durationInFrames: 0 },
        props: {
          videoSrc,
          sourceStartFrame: 0,
          zoomLevel: 1.0,
          overlayText: 'Introducing Miraaj V1',
          roundedCorners: true,
          backgroundTreatment: 'dark',
        },
      },
      {
        id: 'scene-2',
        type: 'keyword_text',
        startFrame: 60,
        durationInFrames: 60,
        transitionIn: { type: 'zoom', durationInFrames: 8 },
        transitionOut: { type: 'cut', durationInFrames: 0 },
        props: {
          keywords: [
            { text: 'DETERMINISTIC', highlight: true, color: '#FFE600', scale: 1.2 },
            { text: 'RENDERING', highlight: false, color: '#FFFFFF' },
            { text: 'PIPELINE', highlight: true, color: '#00F0FF' },
          ],
          layout: 'stacked',
          animation: 'pop',
        },
      },
      {
        id: 'scene-3',
        type: 'talking_head_zoom',
        startFrame: 120,
        durationInFrames: 60,
        transitionIn: { type: 'cut', durationInFrames: 0 },
        transitionOut: { type: 'slide', durationInFrames: 8, direction: 'left' },
        props: {
          videoSrc,
          sourceStartFrame: 60,
          zoomLevel: 1.28, // punch-in reframing
          panY: -0.05,
          roundedCorners: true,
          backgroundTreatment: 'blur',
        },
      },
      {
        id: 'scene-4',
        type: 'code',
        startFrame: 180,
        durationInFrames: 90,
        transitionIn: { type: 'slide', durationInFrames: 8, direction: 'right' },
        transitionOut: { type: 'fade', durationInFrames: 8 },
        props: {
          filename: 'director.py',
          language: 'python',
          code: 'def execute_pipeline(script, video):\n    analysis = analyze_video(video)\n    plan = ai_director.generate_plan(analysis)\n    timeline = build_timeline(plan)\n    return remotion.render(timeline)',
          highlightLines: [4, 5],
          theme: 'vivid-dark',
        },
      },
      {
        id: 'scene-5',
        type: 'cta',
        startFrame: 270,
        durationInFrames: 90,
        transitionIn: { type: 'fade', durationInFrames: 8 },
        transitionOut: { type: 'fade', durationInFrames: 10 },
        props: {
          headline: 'MIRAAJ V1',
          subtext: 'AI Determines WHAT. Code Renders HOW.',
          buttonText: 'Try The Pipeline',
          arrowAnimation: true,
        },
      },
    ],
    audioTracks: [
      {
        id: 'voice-track',
        src: videoSrc,
        type: 'voiceover',
        startFrame: 0,
        durationInFrames: 360,
        volume: 1.0,
      },
    ],
    overlays: [
      {
        id: 'progress-bar',
        type: 'progress_bar',
        startFrame: 0,
        durationInFrames: 360,
        props: {
          height: 6,
          color: '#FFE600',
          position: 'top',
        },
      },
    ],
    metadata: {
      generatedAt: new Date().toISOString(),
      generatorVersion: 'miraaj-v1',
    },
  };
}
