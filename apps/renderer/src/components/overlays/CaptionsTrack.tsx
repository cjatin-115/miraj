import React from 'react';
import { useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { TimelineOverlay } from '@miraaj/timeline';
import { modernCreatorV1 } from '@miraaj/style-system';

interface Props {
  overlays?: TimelineOverlay[];
}

export const CaptionsTrack: React.FC<Props> = ({ overlays = [] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const style = modernCreatorV1;

  // Find active caption overlay at current frame
  const captionOverlays = overlays.filter((o) => o.type === 'caption');
  const activeOverlay = captionOverlays.find(
    (o) => frame >= o.startFrame && frame < o.startFrame + o.durationInFrames
  );

  if (!activeOverlay) return null;

  const words: Array<{ word: string; startFrame: number; endFrame: number; highlight?: boolean }> =
    (activeOverlay.props as any)?.words || [];

  if (words.length === 0) return null;

  const activeWordIndex = words.findIndex(
    (w) => frame >= w.startFrame && frame <= w.endFrame
  );

  const windowSize = 4;
  const pivot = activeWordIndex >= 0 ? activeWordIndex : 0;
  const chunkStart = Math.floor(pivot / windowSize) * windowSize;
  const currentChunk = words.slice(chunkStart, chunkStart + windowSize);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: style.safeAreas.bottom + 24,
        left: style.safeAreas.left,
        right: style.safeAreas.right,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 90,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: '12px 28px',
          borderRadius: 24,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.75)',
        }}
      >
        {currentChunk.map((item, idx) => {
          const globalIdx = chunkStart + idx;
          const isActive = globalIdx === activeWordIndex;

          const popSpring = isActive
            ? spring({
                frame: frame - item.startFrame,
                fps,
                config: { damping: 12, stiffness: 180 },
              })
            : 1.0;

          return (
            <span
              key={`${item.word}-${globalIdx}`}
              style={{
                fontFamily: style.typography.fontFamilyCaption,
                fontSize: 44,
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
                color: isActive
                  ? '#FFE600'
                  : item.highlight
                  ? '#FFFFFF'
                  : 'rgba(255, 255, 255, 0.7)',
                transform: isActive ? `scale(${1 + 0.12 * popSpring})` : 'scale(1)',
                display: 'inline-block',
                textShadow: isActive
                  ? '0 0 20px rgba(255, 230, 0, 0.5), 0 4px 12px rgba(0,0,0,0.9)'
                  : '0 2px 8px rgba(0, 0, 0, 0.9)',
              }}
            >
              {item.word}
            </span>
          );
        })}
      </div>
    </div>
  );
};
