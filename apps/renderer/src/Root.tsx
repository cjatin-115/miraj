import React from 'react';
import { Composition } from 'remotion';
import { MiraajComposition, MiraajCompositionProps } from './Composition.js';
import { sampleTimeline } from './sampleTimeline.js';

export const Root: React.FC = () => {
  return (
    <Composition
      id="MiraajVideo"
      component={MiraajComposition as any}
      durationInFrames={sampleTimeline.durationInFrames}
      fps={sampleTimeline.fps}
      width={sampleTimeline.width}
      height={sampleTimeline.height}
      defaultProps={{
        timeline: sampleTimeline,
      }}
      calculateMetadata={({ props }) => {
        const t = (props as MiraajCompositionProps)?.timeline || sampleTimeline;
        return {
          durationInFrames: t.durationInFrames || 300,
          fps: t.fps || 30,
          width: t.width || 1080,
          height: t.height || 1920,
        };
      }}
    />
  );
};
