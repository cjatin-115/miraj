import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { ComparisonSceneProps } from '@miraaj/timeline';
import { modernCreatorV1 } from '@miraaj/style-system';

interface Props {
  props: ComparisonSceneProps;
}

export const ComparisonCard: React.FC<Props> = ({ props }) => {
  const {
    leftTitle = 'Old Way',
    leftPoints = [],
    rightTitle = 'New Way',
    rightPoints = [],
    winner = 'right',
  } = props;

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const style = modernCreatorV1;

  const leftSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const rightSpring = spring({
    frame: Math.max(0, frame - 5),
    fps,
    config: { damping: 13, stiffness: 130 },
  });

  const leftX = interpolate(leftSpring, [0, 1], [-40, 0]);
  const rightX = interpolate(rightSpring, [0, 1], [40, 0]);

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
      {/* Title Header */}
      <div
        style={{
          fontFamily: style.typography.fontFamilyHeading,
          fontSize: 52,
          fontWeight: 900,
          color: '#FFFFFF',
          textTransform: 'uppercase',
          letterSpacing: '-0.02em',
          marginBottom: 36,
          textAlign: 'center',
        }}
      >
        Side-by-Side Comparison
      </div>

      {/* Comparison Grid (2 cards) */}
      <div
        style={{
          width: '100%',
          maxWidth: 980,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24,
        }}
      >
        {/* Left Column (Traditional / Old) */}
        <div
          style={{
            padding: 36,
            borderRadius: 28,
            backgroundColor: '#111625',
            border: '2px solid rgba(239, 68, 68, 0.25)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
            transform: `translateX(${leftX}px)`,
            opacity: interpolate(leftSpring, [0, 1], [0, 1]),
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              padding: '6px 16px',
              borderRadius: 16,
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#EF4444',
              fontFamily: style.typography.fontFamilyHeading,
              fontSize: 16,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              alignSelf: 'flex-start',
              marginBottom: 16,
            }}
          >
            Traditional
          </div>

          <div
            style={{
              fontFamily: style.typography.fontFamilyHeading,
              fontSize: 32,
              fontWeight: 800,
              color: '#E2E8F0',
              marginBottom: 24,
            }}
          >
            {leftTitle}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {leftPoints.map((pt, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  fontFamily: style.typography.fontFamilyBody,
                  fontSize: 22,
                  color: '#94A3B8',
                  lineHeight: 1.3,
                }}
              >
                <span style={{ color: '#EF4444', fontWeight: 900 }}>✕</span>
                <span>{pt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (Miraaj / Winner) */}
        <div
          style={{
            padding: 36,
            borderRadius: 28,
            backgroundColor: '#111827',
            border: '2px solid #FFE600',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 40px rgba(255, 230, 0, 0.25)',
            transform: `translateX(${rightX}px)`,
            opacity: interpolate(rightSpring, [0, 1], [0, 1]),
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          {winner === 'right' && (
            <div
              style={{
                position: 'absolute',
                top: -16,
                right: 24,
                padding: '6px 18px',
                borderRadius: 20,
                backgroundColor: '#FFE600',
                color: '#07090E',
                fontFamily: style.typography.fontFamilyHeading,
                fontSize: 15,
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                boxShadow: '0 4px 14px rgba(255, 230, 0, 0.4)',
              }}
            >
              ★ Recommended
            </div>
          )}

          <div
            style={{
              padding: '6px 16px',
              borderRadius: 16,
              backgroundColor: 'rgba(255, 230, 0, 0.15)',
              border: '1px solid rgba(255, 230, 0, 0.4)',
              color: '#FFE600',
              fontFamily: style.typography.fontFamilyHeading,
              fontSize: 16,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              alignSelf: 'flex-start',
              marginBottom: 16,
            }}
          >
            Miraaj Workflow
          </div>

          <div
            style={{
              fontFamily: style.typography.fontFamilyHeading,
              fontSize: 32,
              fontWeight: 900,
              color: '#FFFFFF',
              marginBottom: 24,
            }}
          >
            {rightTitle}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {rightPoints.map((pt, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  fontFamily: style.typography.fontFamilyBody,
                  fontSize: 22,
                  color: '#FFFFFF',
                  fontWeight: 600,
                  lineHeight: 1.3,
                }}
              >
                <span style={{ color: '#10B981', fontWeight: 900 }}>✓</span>
                <span>{pt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
