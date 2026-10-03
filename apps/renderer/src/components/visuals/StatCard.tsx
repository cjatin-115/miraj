import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { StatisticsSceneProps } from '@miraaj/timeline';
import { modernCreatorV1 } from '@miraaj/style-system';

interface Props {
  props: StatisticsSceneProps;
}

export const StatCard: React.FC<Props> = ({ props }) => {
  const {
    statNumber = '73%',
    statLabel = 'Key Metric',
    comparisonText,
    trend = 'up',
  } = props || {};

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const style = modernCreatorV1;

  const numSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 130 },
  });

  const numScale = interpolate(numSpring, [0, 1], [0.6, 1.0]);
  const numOpacity = interpolate(numSpring, [0, 1], [0, 1]);

  const labelSpring = spring({
    frame: Math.max(0, frame - 5),
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const labelY = interpolate(labelSpring, [0, 1], [30, 0]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#07090E',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 54,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow radial */}
      <div
        style={{
          position: 'absolute',
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: 920,
          padding: '64px 48px',
          borderRadius: 36,
          backgroundColor: '#111625',
          border: '2px solid rgba(16, 185, 129, 0.3)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 50px rgba(16, 185, 129, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Trend Pill */}
        {trend && (
          <div
            style={{
              padding: '6px 20px',
              borderRadius: 20,
              backgroundColor: trend === 'up' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${trend === 'up' ? '#10B981' : '#EF4444'}`,
              color: trend === 'up' ? '#10B981' : '#EF4444',
              fontFamily: style.typography.fontFamilyHeading,
              fontSize: 18,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 24,
            }}
          >
            {trend === 'up' ? '▲ High Growth' : '▼ Reduction'}
          </div>
        )}

        {/* Massive Stat Value */}
        <div
          style={{
            fontFamily: style.typography.fontFamilyHeading,
            fontSize: 120,
            fontWeight: 900,
            color: '#10B981',
            lineHeight: 1,
            letterSpacing: '-0.04em',
            textShadow: '0 0 50px rgba(16, 185, 129, 0.5)',
            transform: `scale(${numScale})`,
            opacity: numOpacity,
            marginBottom: 20,
          }}
        >
          {statNumber}
        </div>

        {/* Stat Descriptive Label */}
        <div
          style={{
            fontFamily: style.typography.fontFamilyBody,
            fontSize: 34,
            fontWeight: 700,
            color: '#FFFFFF',
            lineHeight: 1.35,
            maxWidth: 720,
            transform: `translateY(${labelY}px)`,
          }}
        >
          {statLabel}
        </div>

        {/* Secondary Comparison Text */}
        {comparisonText && (
          <div
            style={{
              fontFamily: style.typography.fontFamilyBody,
              fontSize: 22,
              color: style.colors.textSecondary,
              marginTop: 20,
            }}
          >
            {comparisonText}
          </div>
        )}
      </div>
    </div>
  );
};
