import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { modernCreatorV1 } from '@miraaj/style-system';

interface Props {
  props: {
    imageUrl?: string;
    caption?: string;
    tag?: string;
  };
}

export const Screenshot: React.FC<Props> = ({ props }) => {
  const {
    imageUrl,
    caption = 'Application Interface',
    tag = 'Software UI',
  } = props;

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const style = modernCreatorV1;

  const enterSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const cardScale = interpolate(enterSpring, [0, 1], [0.9, 1.0]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#07090E',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 960,
          borderRadius: 32,
          backgroundColor: '#111625',
          border: '2px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8), 0 0 50px rgba(59, 130, 246, 0.2)',
          overflow: 'hidden',
          transform: `scale(${cardScale})`,
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={caption}
            style={{ width: '100%', height: 'auto', display: 'block', maxHeight: 800, objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              height: 600,
              backgroundColor: '#0B0E17',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 40,
            }}
          >
            <div style={{ fontSize: 64, marginBottom: 16 }}>📱</div>
            <div
              style={{
                fontFamily: style.typography.fontFamilyHeading,
                fontSize: 36,
                fontWeight: 900,
                color: '#FFFFFF',
              }}
            >
              {caption}
            </div>
            <div
              style={{
                fontFamily: style.typography.fontFamilyMono,
                fontSize: 20,
                color: '#3B82F6',
                marginTop: 10,
              }}
            >
              {tag}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
