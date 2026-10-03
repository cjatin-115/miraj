import React from 'react';
import { OffthreadVideo } from 'remotion';
import { BrollSceneProps } from '@miraaj/timeline';
import { modernCreatorV1 } from '@miraaj/style-system';

interface Props {
  props: BrollSceneProps;
}

export const VideoScene: React.FC<Props> = ({ props }) => {
  const {
    mediaSrc,
    sourceStartFrame = 0,
    overlayCaption,
  } = props;

  const style = modernCreatorV1;

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
      {mediaSrc ? (
        <OffthreadVideo
          src={mediaSrc}
          startFrom={sourceStartFrame}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0B0E17',
            color: '#FFFFFF',
            fontFamily: style.typography.fontFamilyHeading,
            fontSize: 32,
            fontWeight: 800,
          }}
        >
          🎬 B-Roll Video Stream
        </div>
      )}

      {/* Overlay caption */}
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
