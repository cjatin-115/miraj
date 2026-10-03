import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

export type MotionType =
  | 'none'
  | 'zoom'
  | 'slide'
  | 'blur'
  | 'scale'
  | 'mask_reveal'
  | 'camera_move';

interface Props {
  motion?: MotionType;
  durationInFrames: number;
  children: React.ReactNode;
}

export const MotionWrapper: React.FC<Props> = ({
  motion = 'none',
  durationInFrames,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (motion === 'none') {
    return <div style={{ width: '100%', height: '100%' }}>{children}</div>;
  }

  const progress = Math.min(1, Math.max(0, frame / Math.max(1, durationInFrames)));

  let style: React.CSSProperties = {
    width: '100%',
    height: '100%',
    position: 'relative',
  };

  switch (motion) {
    case 'zoom': {
      const scale = interpolate(progress, [0, 1], [1.0, 1.08]);
      style.transform = `scale(${scale})`;
      style.transformOrigin = 'center center';
      break;
    }
    case 'slide': {
      const enterSpring = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });
      const x = interpolate(enterSpring, [0, 1], [60, 0]);
      style.transform = `translateX(${x}px)`;
      break;
    }
    case 'blur': {
      const enterSpring = spring({ frame, fps, config: { damping: 12, stiffness: 100 } });
      const blurPx = interpolate(enterSpring, [0, 1], [12, 0]);
      style.filter = `blur(${blurPx}px)`;
      break;
    }
    case 'scale': {
      const enterSpring = spring({ frame, fps, config: { damping: 12, stiffness: 140 } });
      const s = interpolate(enterSpring, [0, 1], [0.92, 1.0]);
      style.transform = `scale(${s})`;
      break;
    }
    case 'mask_reveal': {
      const enterSpring = spring({ frame, fps, config: { damping: 15, stiffness: 100 } });
      const clipPct = interpolate(enterSpring, [0, 1], [100, 0]);
      style.clipPath = `inset(0 0 ${clipPct}% 0)`;
      break;
    }
    case 'camera_move': {
      const panX = interpolate(Math.sin(frame / 30), [-1, 1], [-8, 8]);
      const panY = interpolate(Math.cos(frame / 40), [-1, 1], [-6, 6]);
      style.transform = `translate(${panX}px, ${panY}px)`;
      break;
    }
    default:
      break;
  }

  return <div style={style}>{children}</div>;
};
