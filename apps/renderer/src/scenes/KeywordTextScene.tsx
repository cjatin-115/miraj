import React from 'react';
import { KeywordTextProps } from '@miraaj/timeline';
import { modernCreatorV1 } from '@miraaj/style-system';

interface Props {
  props: KeywordTextProps;
  frame: number;
}

export const KeywordTextScene: React.FC<Props> = ({ props, frame }) => {
  const { keywords = [], layout = 'stacked' } = props;
  const style = modernCreatorV1;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: style.colors.background,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: style.spacing.screenPadding,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background ambient glow */}
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          backgroundColor: style.colors.accentPrimary,
          filter: 'blur(160px)',
          opacity: 0.15,
        }}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: layout === 'stacked' ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          zIndex: 10,
        }}
      >
        {keywords.map((kw, i) => {
          const isHighlight = kw.highlight ?? false;
          const color = kw.color || (isHighlight ? style.keywordEmphasis.highlightColors[i % style.keywordEmphasis.highlightColors.length] : style.colors.textPrimary);
          const popProgress = Math.min(1, Math.max(0, (frame - i * 4) / 8));
          const scale = (kw.scale || 1.0) * (0.8 + 0.2 * popProgress);

          return (
            <div
              key={i}
              style={{
                fontFamily: style.typography.fontFamilyHeading,
                fontSize: style.typography.fontSizes.h1,
                fontWeight: style.typography.fontWeights.black,
                letterSpacing: style.typography.letterSpacings.tight,
                color: isHighlight ? color : style.colors.textPrimary,
                transform: `scale(${scale})`,
                opacity: popProgress,
                textTransform: 'uppercase',
                textShadow: isHighlight
                  ? `0 0 40px ${color}88, 0 4px 20px rgba(0,0,0,0.9)`
                  : '0 4px 20px rgba(0,0,0,0.8)',
                padding: isHighlight ? '8px 24px' : '0px',
                borderRadius: 16,
                backgroundColor: isHighlight ? 'rgba(0, 0, 0, 0.4)' : 'transparent',
                border: isHighlight ? `2px solid ${color}44` : 'none',
              }}
            >
              {kw.text}
            </div>
          );
        })}
      </div>
    </div>
  );
};
