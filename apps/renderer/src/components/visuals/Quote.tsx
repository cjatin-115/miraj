import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { QuoteSceneProps } from '@miraaj/timeline';
import { modernCreatorV1 } from '@miraaj/style-system';

interface Props {
  props: QuoteSceneProps;
}

export const Quote: React.FC<Props> = ({ props }) => {
  const {
    quote,
    author = 'Industry Leader',
    authorTitle = 'Creator & Engineer',
    avatarUrl,
  } = props;

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const style = modernCreatorV1;

  const enterSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const cardScale = interpolate(enterSpring, [0, 1], [0.92, 1.0]);

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
      <div
        style={{
          width: '100%',
          maxWidth: 960,
          padding: '64px 48px',
          borderRadius: 36,
          backgroundColor: '#111625',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(139, 92, 246, 0.15)',
          transform: `scale(${cardScale})`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Large quotation mark */}
        <div
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 120,
            lineHeight: 0.6,
            color: '#FFE600',
            marginBottom: 28,
            userSelect: 'none',
          }}
        >
          “
        </div>

        {/* Quote Body */}
        <div
          style={{
            fontFamily: style.typography.fontFamilyHeading,
            fontSize: 42,
            fontWeight: 800,
            color: '#FFFFFF',
            lineHeight: 1.35,
            letterSpacing: '-0.02em',
            marginBottom: 36,
          }}
        >
          {quote}
        </div>

        {/* Author Details */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={author}
              style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #FFE600' }}
            />
          ) : (
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 230, 0, 0.15)',
                border: '2px solid #FFE600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
              }}
            >
              💬
            </div>
          )}

          <div style={{ textAlign: 'left' }}>
            <div
              style={{
                fontFamily: style.typography.fontFamilyHeading,
                fontSize: 26,
                fontWeight: 800,
                color: '#FFE600',
              }}
            >
              {author}
            </div>
            {authorTitle && (
              <div
                style={{
                  fontFamily: style.typography.fontFamilyBody,
                  fontSize: 18,
                  color: style.colors.textSecondary,
                }}
              >
                {authorTitle}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
