import React from 'react';
import { TimelineTransition } from '@miraaj/timeline';

interface TransitionWrapperProps {
  transition?: TimelineTransition;
  frameInScene: number;
  durationInFrames: number;
  children: React.ReactNode;
}

export const TransitionWrapper: React.FC<TransitionWrapperProps> = ({
  transition,
  frameInScene,
  durationInFrames,
  children,
}) => {
  if (!transition || transition.type === 'cut' || transition.durationInFrames <= 0) {
    return <div style={{ width: '100%', height: '100%', position: 'relative' }}>{children}</div>;
  }

  const { type, durationInFrames: transDur, direction = 'left' } = transition;
  const progress = Math.min(1, Math.max(0, frameInScene / transDur));

  let style: React.CSSProperties = {
    width: '100%',
    height: '100%',
    position: 'relative',
    transition: 'all 0.1s ease-out',
  };

  if (frameInScene < transDur) {
    switch (type) {
      case 'fade':
        style.opacity = progress;
        break;
      case 'zoom':
        style.transform = `scale(${0.85 + 0.15 * progress})`;
        style.opacity = progress;
        break;
      case 'slide':
        const offset = (1 - progress) * 100;
        if (direction === 'left') style.transform = `translateX(${offset}%)`;
        else if (direction === 'right') style.transform = `translateX(-${offset}%)`;
        else if (direction === 'up') style.transform = `translateY(${offset}%)`;
        else style.transform = `translateY(-${offset}%)`;
        break;
      case 'blur':
        style.filter = `blur(${(1 - progress) * 20}px)`;
        style.opacity = progress;
        break;
      case 'scale':
        style.transform = `scale(${1.2 - 0.2 * progress})`;
        style.opacity = progress;
        break;
      case 'whip':
        style.transform = `translateX(${(1 - progress) * 120}%) skewX(${(1 - progress) * -15}deg)`;
        style.filter = `blur(${(1 - progress) * 15}px)`;
        break;
      default:
        break;
    }
  }

  return <div style={style}>{children}</div>;
};
