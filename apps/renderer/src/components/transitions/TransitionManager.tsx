import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { TimelineTransition } from '@miraaj/timeline';

interface Props {
  transition?: TimelineTransition;
  durationInFrames: number;
  children: React.ReactNode;
}

export const TransitionManager: React.FC<Props> = ({
  transition,
  durationInFrames,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!transition || transition.type === 'cut' || transition.durationInFrames <= 0) {
    return <div style={{ width: '100%', height: '100%', position: 'relative' }}>{children}</div>;
  }

  const { type, durationInFrames: transDur, direction = 'left' } = transition;

  let style: React.CSSProperties = {
    width: '100%',
    height: '100%',
    position: 'relative',
  };

  // Entrance transition
  if (frame < transDur) {
    const progress = Math.min(1, Math.max(0, frame / transDur));
    const spr = spring({
      frame,
      fps,
      config: { damping: 14, stiffness: 120 },
    });

    switch (type) {
      case 'fade':
        style.opacity = progress;
        break;
      case 'zoom':
        style.transform = `scale(${interpolate(spr, [0, 1], [0.85, 1.0])})`;
        style.opacity = progress;
        break;
      case 'slide': {
        const offset = interpolate(spr, [0, 1], [100, 0]);
        if (direction === 'left') style.transform = `translateX(${offset}%)`;
        else if (direction === 'right') style.transform = `translateX(-${offset}%)`;
        else if (direction === 'up') style.transform = `translateY(${offset}%)`;
        else style.transform = `translateY(-${offset}%)`;
        break;
      }
      case 'blur': {
        const blurAmount = interpolate(spr, [0, 1], [24, 0]);
        style.filter = `blur(${blurAmount}px)`;
        style.opacity = progress;
        break;
      }
      case 'scale': {
        const s = interpolate(spr, [0, 1], [1.2, 1.0]);
        style.transform = `scale(${s})`;
        style.opacity = progress;
        break;
      }
      case 'whip': {
        const xOffset = interpolate(spr, [0, 1], [120, 0]);
        const skew = interpolate(spr, [0, 1], [-15, 0]);
        const blurWhip = interpolate(spr, [0, 1], [20, 0]);
        style.transform = `translateX(${xOffset}%) skewX(${skew}deg)`;
        style.filter = `blur(${blurWhip}px)`;
        break;
      }
      default:
        break;
    }
  }

  return <div style={style}>{children}</div>;
};
