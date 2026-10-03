import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { FullscreenTextProps } from '@miraaj/timeline';
import { modernCreatorV1 } from '@miraaj/style-system';

interface Props {
  props: FullscreenTextProps;
}

export const BigStatement: React.FC<Props> = ({ props }) => {
  const {
    headline,
    subheadline,
    accentWord,
    accentColor = '#FFE600',
    theme = 'dark',
  } = props;

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const style = modernCreatorV1;

  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 13, stiffness: 120 },
  });

  const subtitleSpring = spring({
    frame: Math.max(0, frame - 6),
    fps,
    config: { damping: 14, stiffness: 110 },
  });

  const titleY = interpolate(titleSpring, [0, 1], [40, 0]);
  const titleOpacity = interpolate(titleSpring, [0, 1], [0, 1]);
  const subY = interpolate(subtitleSpring, [0, 1], [30, 0]);
  const subOpacity = interpolate(subtitleSpring, [0, 1], [0, 1]);

  // Highlight accent word if present
  const renderHeadline = () => {
    if (!accentWord) return headline;
    const parts = headline.split(new RegExp(`(${accentWord})`, 'gi'));
    return parts.map((part, i) => {
      if (part.toLowerCase() === accentWord.toLowerCase()) {
        return (
          <span
            key={i}
            style={{
              color: accentColor,
              textShadow: `0 0 40px ${accentColor}66`,
              display: 'inline-block',
            }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

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
          width: 800,
          height: 800,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accentColor}18 0%, transparent 65%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Main Headline */}
      <div
        style={{
          fontFamily: style.typography.fontFamilyHeading,
          fontSize: 76,
          fontWeight: 900,
          color: '#FFFFFF',
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          textTransform: 'uppercase',
          maxWidth: 960,
          transform: `translateY(${titleY}px)`,
          opacity: titleOpacity,
          zIndex: 10,
        }}
      >
        {renderHeadline()}
      </div>

      {/* Subheadline / Supporting context */}
      {subheadline && (
        <div
          style={{
            fontFamily: style.typography.fontFamilyBody,
            fontSize: 32,
            fontWeight: 500,
            color: style.colors.textSecondary,
            lineHeight: 1.4,
            maxWidth: 820,
            marginTop: 32,
            transform: `translateY(${subY}px)`,
            opacity: subOpacity,
            zIndex: 10,
          }}
        >
          {subheadline}
        </div>
      )}
    </div>
  );
};
