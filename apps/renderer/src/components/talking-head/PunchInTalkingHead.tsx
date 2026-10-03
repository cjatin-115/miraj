import React from 'react';
import { OffthreadVideo, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { TalkingHeadProps } from '@miraaj/timeline';
import { modernCreatorV1 } from '@miraaj/style-system';

interface Props {
  props: TalkingHeadProps;
}

export const PunchInTalkingHead: React.FC<Props> = ({ props }) => {
  const {
    videoSrc,
    sourceStartFrame = 0,
    zoomLevel = 1.22,
    panX = 0,
    panY = 0,
  } = props || {};

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const style = modernCreatorV1;

  // Punch-in entrance with snappy creator spring
  const punchSpring = spring({
    frame,
    fps,
    config: {
      damping: 14,
      stiffness: 140,
      mass: 0.8,
    },
  });

  const effectiveScale = interpolate(
    punchSpring,
    [0, 1],
    [1.0, zoomLevel]
  );

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#000000',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {videoSrc ? (
        <OffthreadVideo
          src={videoSrc}
          startFrom={sourceStartFrame}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${effectiveScale}) translate(${panX * 80}px, ${panY * 80}px)`,
            transformOrigin: 'center 38%',
          }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(180deg, #1A1F35 0%, #0B0E17 100%)',
            color: '#FFFFFF',
            fontFamily: style.typography.fontFamilyHeading,
            transform: `scale(${effectiveScale})`,
          }}
        >
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 230, 0, 0.15)',
              border: '3px solid #FFE600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 64,
              marginBottom: 24,
              boxShadow: '0 0 40px rgba(255, 230, 0, 0.35)',
            }}
          >
            🔍
          </div>
          <div style={{ fontSize: 36, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Punch-In Reframing
          </div>
          <div style={{ fontSize: 22, color: '#FFE600', marginTop: 8, fontWeight: 700 }}>
            Zoom: {zoomLevel}x • Face Centered
          </div>
        </div>
      )}

      {/* Subtle vignette border to focus eyes */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          boxShadow: 'inset 0 0 100px rgba(0, 0, 0, 0.6)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};
