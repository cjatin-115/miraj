import React from 'react';
import { OffthreadVideo, useCurrentFrame, interpolate } from 'remotion';
import { TalkingHeadProps } from '@miraaj/timeline';
import { modernCreatorV1 } from '@miraaj/style-system';

interface Props {
  props: TalkingHeadProps;
}

export const FullscreenTalkingHead: React.FC<Props> = ({ props }) => {
  const {
    videoSrc,
    sourceStartFrame = 0,
    panX = 0,
    panY = 0,
  } = props || {};

  const frame = useCurrentFrame();
  const style = modernCreatorV1;

  // Subtle natural camera breathing (micro-motion) to keep frame dynamic
  const microScale = interpolate(
    Math.sin(frame / 45),
    [-1, 1],
    [1.0, 1.015]
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
            transform: `scale(${microScale}) translate(${panX * 100}px, ${panY * 100}px)`,
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
            background: 'linear-gradient(180deg, #111625 0%, #07090E 100%)',
            color: '#FFFFFF',
            fontFamily: style.typography.fontFamilyHeading,
          }}
        >
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 230, 0, 0.1)',
              border: '2px solid rgba(255, 230, 0, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 64,
              marginBottom: 24,
              boxShadow: '0 0 30px rgba(255, 230, 0, 0.2)',
            }}
          >
            👤
          </div>
          <div style={{ fontSize: 36, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Talking-Head Anchor
          </div>
          <div style={{ fontSize: 22, color: style.colors.textSecondary, marginTop: 8 }}>
            9:16 Fullscreen Stream
          </div>
        </div>
      )}
    </div>
  );
};
