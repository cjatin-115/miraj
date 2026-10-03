import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { KeywordTextProps } from '@miraaj/timeline';
import { modernCreatorV1 } from '@miraaj/style-system';

interface Props {
  props: KeywordTextProps;
}

export const KeywordCaption: React.FC<Props> = ({ props }) => {
  const {
    keywords = [],
    layout = 'stacked',
    animation = 'pop',
  } = props;

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const style = modernCreatorV1;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#07090E',
        display: 'flex',
        flexDirection: layout === 'stacked' ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        padding: style.safeAreas.left,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow radial */}
      <div
        style={{
          position: 'absolute',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 230, 0, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {keywords.map((kw, idx) => {
        // Stagger entrance of each keyword by 4 frames
        const delay = idx * 5;
        const localFrame = Math.max(0, frame - delay);

        const popSpring = spring({
          frame: localFrame,
          fps,
          config: { damping: 11, stiffness: 160 },
        });

        const scale = interpolate(popSpring, [0, 1], [0.6, kw.scale || 1.0]);
        const opacity = interpolate(popSpring, [0, 1], [0, 1]);
        const color = kw.color || (kw.highlight ? '#FFE600' : '#FFFFFF');

        return (
          <div
            key={idx}
            style={{
              transform: `scale(${scale})`,
              opacity,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px 36px',
              borderRadius: 24,
              backgroundColor: kw.highlight ? 'rgba(255, 230, 0, 0.12)' : 'rgba(255, 255, 255, 0.05)',
              border: kw.highlight ? '3px solid #FFE600' : '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: kw.highlight ? '0 0 35px rgba(255, 230, 0, 0.3)' : 'none',
            }}
          >
            <span
              style={{
                fontFamily: style.typography.fontFamilyHeading,
                fontSize: 68,
                fontWeight: 900,
                color,
                textTransform: 'uppercase',
                letterSpacing: '-0.02em',
                textShadow: '0 4px 20px rgba(0,0,0,0.8)',
              }}
            >
              {kw.text}
            </span>
          </div>
        );
      })}
    </div>
  );
};
