import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { EditorialTextProps } from '@miraaj/timeline';
import { modernCreatorV1 } from '@miraaj/style-system';

interface Props {
  props: EditorialTextProps;
}

export const EditorialText: React.FC<Props> = ({ props }) => {
  const {
    eyebrow,
    title,
    paragraph,
    citation,
    bulletPoints = [],
  } = props;

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const style = modernCreatorV1;

  const cardSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const cardY = interpolate(cardSpring, [0, 1], [40, 0]);
  const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#07090E',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: style.safeAreas.left,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 960,
          padding: 48,
          borderRadius: 32,
          backgroundColor: '#111625',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7)',
          transform: `translateY(${cardY}px)`,
          opacity: cardOpacity,
          position: 'relative',
        }}
      >
        {/* Eyebrow badge */}
        {eyebrow && (
          <div
            style={{
              display: 'inline-block',
              padding: '6px 18px',
              borderRadius: 20,
              backgroundColor: 'rgba(255, 230, 0, 0.15)',
              border: '1px solid rgba(255, 230, 0, 0.3)',
              color: '#FFE600',
              fontFamily: style.typography.fontFamilyHeading,
              fontSize: 18,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 20,
            }}
          >
            {eyebrow}
          </div>
        )}

        {/* Title */}
        <h2
          style={{
            fontFamily: style.typography.fontFamilyHeading,
            fontSize: 48,
            fontWeight: 900,
            color: '#FFFFFF',
            lineHeight: 1.2,
            margin: 0,
            marginBottom: 20,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </h2>

        {/* Paragraph */}
        {paragraph && (
          <p
            style={{
              fontFamily: style.typography.fontFamilyBody,
              fontSize: 26,
              color: style.colors.textSecondary,
              lineHeight: 1.5,
              margin: 0,
              marginBottom: bulletPoints.length > 0 ? 24 : 0,
            }}
          >
            {paragraph}
          </p>
        )}

        {/* Bullet points */}
        {bulletPoints.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {bulletPoints.map((pt, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  fontFamily: style.typography.fontFamilyBody,
                  fontSize: 24,
                  fontWeight: 600,
                  color: '#F8FAFC',
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    border: '1.5px solid #10B981',
                    color: '#10B981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    fontWeight: 900,
                    flexShrink: 0,
                  }}
                >
                  ✓
                </span>
                <span>{pt}</span>
              </div>
            ))}
          </div>
        )}

        {/* Optional citation */}
        {citation && (
          <div
            style={{
              marginTop: 28,
              fontSize: 18,
              color: style.colors.textMuted,
              fontFamily: style.typography.fontFamilyMono,
            }}
          >
            — {citation}
          </div>
        )}
      </div>
    </div>
  );
};
