import React from 'react';
import { TalkingHeadProps } from '@miraaj/timeline';
import { modernCreatorV1 } from '@miraaj/style-system';

interface Props {
  props: TalkingHeadProps;
  frame: number;
}

export const TalkingHeadScene: React.FC<Props> = ({ props, frame }) => {
  const {
    videoSrc,
    zoomLevel = 1.0,
    panX = 0,
    panY = 0,
    overlayText,
    roundedCorners = true,
    backgroundTreatment = 'blur',
  } = props;

  const style = modernCreatorV1;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: style.colors.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Blurred background layer */}
      {backgroundTreatment === 'blur' && videoSrc && (
        <div
          style={{
            position: 'absolute',
            inset: -40,
            backgroundImage: `url(${videoSrc})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: `blur(${style.framing.backgroundBlurSigma}px) brightness(0.4)`,
            transform: 'scale(1.2)',
          }}
        />
      )}

      {/* Main anchor video frame */}
      <div
        style={{
          width: roundedCorners ? '92%' : '100%',
          height: roundedCorners ? '84%' : '100%',
          borderRadius: roundedCorners ? style.framing.cornerRadius : 0,
          border: roundedCorners ? `${style.framing.borderWidth}px solid ${style.framing.borderColor}` : 'none',
          boxShadow: roundedCorners ? style.framing.shadow : 'none',
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: '#000000',
        }}
      >
        {videoSrc ? (
          <video
            src={videoSrc}
            autoPlay
            loop
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `scale(${zoomLevel}) translate(${panX * 100}px, ${panY * 100}px)`,
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
              color: style.colors.textSecondary,
              fontFamily: style.typography.fontFamilyBody,
              background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
            }}
          >
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎥</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#FFFFFF' }}>Talking-Head Anchor</div>
            <div style={{ fontSize: 20 }}>Zoom: {zoomLevel}x | 9:16 Reframed</div>
          </div>
        )}

        {/* Lower Overlay Badge */}
        {overlayText && (
          <div
            style={{
              position: 'absolute',
              bottom: 32,
              left: 32,
              right: 32,
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(12px)',
              padding: '16px 24px',
              borderRadius: 16,
              border: `1px solid ${style.colors.borderSubtle}`,
              color: style.colors.textPrimary,
              fontFamily: style.typography.fontFamilyHeading,
              fontSize: 28,
              fontWeight: 700,
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            }}
          >
            {overlayText}
          </div>
        )}
      </div>
    </div>
  );
};
