import React from 'react';
import { OffthreadVideo, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { TalkingHeadProps } from '@miraaj/timeline';
import { modernCreatorV1 } from '@miraaj/style-system';

interface Props {
  props: TalkingHeadProps;
}

export const OverlayTalkingHead: React.FC<Props> = ({ props }) => {
  const {
    videoSrc,
    sourceStartFrame = 0,
    zoomLevel = 1.1,
    secondarySrc,
    overlayText,
  } = props;

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const style = modernCreatorV1;

  const pipSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 130 },
  });

  const pipScale = interpolate(pipSpring, [0, 1], [0.8, 1.0]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#07090E',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background visual asset/stream */}
      {secondarySrc ? (
        <div style={{ width: '100%', height: '100%' }}>
          <img
            src={secondarySrc}
            alt="Background"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle at 50% 30%, #17213C 0%, #07090E 80%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 60,
          }}
        >
          <div
            style={{
              padding: '24px 48px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 24,
              textAlign: 'center',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div style={{ fontSize: 44, fontWeight: 900, color: '#FFFFFF', fontFamily: style.typography.fontFamilyHeading }}>
              {overlayText || 'Visual Focus Moment'}
            </div>
            <div style={{ fontSize: 24, color: style.colors.textSecondary, marginTop: 12 }}>
              Speaker Commentary Overlay
            </div>
          </div>
        </div>
      )}

      {/* Floating PIP Talking-Head Bubble in Bottom-Right Corner */}
      <div
        style={{
          position: 'absolute',
          bottom: 260, // Above bottom safe area (240px)
          right: 48,  // Inside right safe area (48px)
          width: 320,
          height: 320,
          borderRadius: '50%',
          overflow: 'hidden',
          border: '4px solid #FFE600',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 230, 0, 0.3)',
          backgroundColor: '#000000',
          transform: `scale(${pipScale})`,
          zIndex: 50,
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
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center 35%',
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 54,
              background: '#1A1F35',
            }}
          >
            👤
          </div>
        )}
      </div>
    </div>
  );
};
