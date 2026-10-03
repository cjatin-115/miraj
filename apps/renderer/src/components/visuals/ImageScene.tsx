import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { BrollSceneProps } from '@miraaj/timeline';
import { modernCreatorV1 } from '@miraaj/style-system';

interface Props {
  props: BrollSceneProps;
}

export const ImageScene: React.FC<Props> = ({ props }) => {
  const {
    mediaSrc,
    kenBurns = 'zoom-in',
    overlayCaption,
  } = props;

  const frame = useCurrentFrame();
  const style = modernCreatorV1;

  // Ken burns zoom-in / zoom-out interpolation
  const scale = kenBurns === 'zoom-in'
    ? interpolate(frame, [0, 150], [1.0, 1.15], { extrapolateRight: 'clamp' })
    : kenBurns === 'zoom-out'
    ? interpolate(frame, [0, 150], [1.15, 1.0], { extrapolateRight: 'clamp' })
    : 1.0;

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
      {mediaSrc ? (
        <img
          src={mediaSrc}
          alt={overlayCaption || 'Visual'}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
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
            background: 'linear-gradient(180deg, #1A1F35 0%, #07090E 100%)',
            color: '#FFFFFF',
          }}
        >
          <div style={{ fontSize: 64, marginBottom: 16 }}>🖼️</div>
          <div style={{ fontFamily: style.typography.fontFamilyHeading, fontSize: 36, fontWeight: 900 }}>
            {overlayCaption || 'Visual Asset'}
          </div>
        </div>
      )}

      {/* Subtle vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          boxShadow: 'inset 0 0 120px rgba(0, 0, 0, 0.7)',
          pointerEvents: 'none',
        }}
      />

      {/* Caption if provided */}
      {overlayCaption && (
        <div
          style={{
            position: 'absolute',
            bottom: style.safeAreas.bottom + 20,
            left: style.safeAreas.left,
            right: style.safeAreas.right,
            textAlign: 'center',
          }}
        >
          <span
            style={{
              padding: '12px 28px',
              borderRadius: 20,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              fontFamily: style.typography.fontFamilyHeading,
              fontSize: 26,
              fontWeight: 800,
            }}
          >
            {overlayCaption}
          </span>
        </div>
      )}
    </div>
  );
};
