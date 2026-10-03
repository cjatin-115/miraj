import React from 'react';
import { OffthreadVideo, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { TalkingHeadProps } from '@miraaj/timeline';
import { modernCreatorV1 } from '@miraaj/style-system';

interface Props {
  props: TalkingHeadProps;
}

export const RoundedTalkingHead: React.FC<Props> = ({ props }) => {
  const {
    videoSrc,
    sourceStartFrame = 0,
    zoomLevel = 1.05,
    panX = 0,
    panY = 0,
    overlayText,
  } = props;

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const style = modernCreatorV1;

  const enterSpring = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  const cardScale = interpolate(enterSpring, [0, 1], [0.94, 1.0]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#07090E',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Blurred background layer */}
      {videoSrc && (
        <div
          style={{
            position: 'absolute',
            inset: -50,
            overflow: 'hidden',
            filter: 'blur(40px) brightness(0.35)',
            transform: 'scale(1.2)',
          }}
        >
          <OffthreadVideo
            src={videoSrc}
            startFrom={sourceStartFrame}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      {/* Main rounded video frame container */}
      <div
        style={{
          width: '92%',
          height: '84%',
          borderRadius: 36,
          border: '2px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(59, 130, 246, 0.15)',
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: '#000000',
          transform: `scale(${cardScale})`,
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
              transform: `scale(${zoomLevel}) translate(${panX * 60}px, ${panY * 60}px)`,
              transformOrigin: 'center 40%',
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
              color: '#FFFFFF',
              fontFamily: style.typography.fontFamilyHeading,
              background: 'linear-gradient(180deg, #13192B 0%, #0A0D15 100%)',
            }}
          >
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎥</div>
            <div style={{ fontSize: 32, fontWeight: 900 }}>Rounded Creator Window</div>
            <div style={{ fontSize: 20, color: style.colors.textSecondary, marginTop: 8 }}>
              Modern Frame • 36px Curvature
            </div>
          </div>
        )}

        {/* Optional Overlay Badge */}
        {overlayText && (
          <div
            style={{
              position: 'absolute',
              bottom: 32,
              left: 32,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(16px)',
              padding: '12px 24px',
              borderRadius: 16,
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              fontFamily: style.typography.fontFamilyHeading,
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            {overlayText}
          </div>
        )}
      </div>
    </div>
  );
};
