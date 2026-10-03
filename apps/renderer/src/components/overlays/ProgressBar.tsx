import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

interface Props {
  color?: string;
  height?: number;
}

export const ProgressBar: React.FC<Props> = ({
  color = '#FFE600',
  height = 8,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress = durationInFrames > 0 ? (frame / durationInFrames) * 100 : 0;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: `${progress}%`,
        height,
        backgroundColor: color,
        zIndex: 100,
        boxShadow: `0 0 16px ${color}`,
        transition: 'width 0.04s linear',
        pointerEvents: 'none',
      }}
    />
  );
};
