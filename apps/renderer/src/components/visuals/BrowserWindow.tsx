import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { modernCreatorV1 } from '@miraaj/style-system';

interface Props {
  props: {
    url?: string;
    title?: string;
    headline?: string;
    badge?: string;
    points?: string[];
  };
}

export const BrowserWindow: React.FC<Props> = ({ props }) => {
  const {
    url = 'https://miraaj.video',
    title = 'Miraaj Video Engine',
    headline = 'Deterministic AI Video Production',
    badge = 'Platform Live',
    points = ['No Arbitrary AI Video Hallucinations', 'Word-for-Word Transcription Alignment', 'Instant 1080x1920 MP4 Export'],
  } = props;

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const style = modernCreatorV1;

  const enterSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const cardY = interpolate(enterSpring, [0, 1], [40, 0]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#07090E',
        display: 'flex',
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
          borderRadius: 28,
          backgroundColor: '#111625',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(59, 130, 246, 0.15)',
          overflow: 'hidden',
          transform: `translateY(${cardY}px)`,
        }}
      >
        {/* Browser Top Navigation Bar */}
        <div
          style={{
            height: 64,
            backgroundColor: '#0D111D',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            gap: 20,
          }}
        >
          {/* Traffic lights */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#FF5F56' }} />
            <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
            <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#27C93F' }} />
          </div>

          {/* Address Bar */}
          <div
            style={{
              flex: 1,
              height: 38,
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              borderRadius: 12,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              gap: 10,
              fontFamily: style.typography.fontFamilyMono,
              fontSize: 16,
              color: '#94A3B8',
            }}
          >
            <span style={{ color: '#10B981' }}>🔒</span>
            <span style={{ color: '#F8FAFC' }}>{url}</span>
          </div>
        </div>

        {/* Browser Webpage Content */}
        <div
          style={{
            padding: 48,
            backgroundColor: '#111625',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          <div
            style={{
              display: 'inline-block',
              padding: '6px 16px',
              borderRadius: 20,
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#3B82F6',
              fontFamily: style.typography.fontFamilyHeading,
              fontSize: 16,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              alignSelf: 'flex-start',
            }}
          >
            {badge}
          </div>

          <div
            style={{
              fontFamily: style.typography.fontFamilyHeading,
              fontSize: 44,
              fontWeight: 900,
              color: '#FFFFFF',
              lineHeight: 1.2,
            }}
          >
            {headline}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {points.map((pt, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  fontFamily: style.typography.fontFamilyBody,
                  fontSize: 22,
                  color: '#CBD5E1',
                }}
              >
                <span style={{ color: '#FFE600', fontWeight: 900 }}>⚡</span>
                <span>{pt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
