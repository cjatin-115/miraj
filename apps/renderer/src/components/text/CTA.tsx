import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { CTASceneProps } from '@miraaj/timeline';
import { modernCreatorV1 } from '@miraaj/style-system';

interface Props {
  props: CTASceneProps;
}

export const CTA: React.FC<Props> = ({ props }) => {
  const {
    headline,
    subtext,
    buttonText,
    arrowAnimation = true,
  } = props;

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const style = modernCreatorV1;

  const btnSpring = spring({
    frame,
    fps,
    config: { damping: 11, stiffness: 140 },
  });

  const btnScale = interpolate(btnSpring, [0, 1], [0.75, 1.0]);

  // Subtle button pulse after entry
  const pulse = Math.sin(frame / 8) * 0.03;

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
        padding: 54,
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
      }}
    >
      {/* Background glow radial */}
      <div
        style={{
          position: 'absolute',
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 230, 0, 0.18) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />

      {/* Main CTA headline */}
      <div
        style={{
          fontFamily: style.typography.fontFamilyHeading,
          fontSize: 64,
          fontWeight: 900,
          color: '#FFFFFF',
          textTransform: 'uppercase',
          letterSpacing: '-0.02em',
          lineHeight: 1.15,
          maxWidth: 900,
          marginBottom: 20,
        }}
      >
        {headline}
      </div>

      {/* Subtext */}
      {subtext && (
        <div
          style={{
            fontFamily: style.typography.fontFamilyBody,
            fontSize: 28,
            color: style.colors.textSecondary,
            maxWidth: 720,
            marginBottom: 44,
            lineHeight: 1.4,
          }}
        >
          {subtext}
        </div>
      )}

      {/* Interactive-looking Primary Button */}
      <div
        style={{
          transform: `scale(${btnScale + pulse})`,
          padding: '24px 56px',
          borderRadius: 40,
          backgroundColor: '#FFE600',
          boxShadow: '0 16px 40px rgba(255, 230, 0, 0.4), 0 0 50px rgba(255, 230, 0, 0.2)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 16,
          cursor: 'pointer',
        }}
      >
        <span
          style={{
            fontFamily: style.typography.fontFamilyHeading,
            fontSize: 32,
            fontWeight: 900,
            color: '#07090E',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {buttonText || 'Follow for More'}
        </span>
        {arrowAnimation && (
          <span
            style={{
              fontSize: 36,
              color: '#07090E',
              transform: `translateX(${Math.sin(frame / 6) * 6}px)`,
              display: 'inline-block',
            }}
          >
            →
          </span>
        )}
      </div>
    </div>
  );
};
