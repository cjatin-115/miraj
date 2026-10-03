import React from 'react';
import { FullscreenTextProps } from '@miraaj/timeline';
import { modernCreatorV1 } from '@miraaj/style-system';

interface Props {
  props: FullscreenTextProps;
  frame: number;
}

export const FullscreenTextScene: React.FC<Props> = ({ props, frame }) => {
  const { headline, subheadline, accentWord, accentColor = '#FFE600' } = props;
  const style = modernCreatorV1;

  // Split headline to highlight accentWord
  const parts = accentWord ? headline.split(new RegExp(`(${accentWord})`, 'gi')) : [headline];

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
        textAlign: 'center',
      }}
    >
      <h1
        style={{
          fontFamily: style.typography.fontFamilyHeading,
          fontSize: style.typography.fontSizes.h1,
          fontWeight: style.typography.fontWeights.black,
          lineHeight: style.typography.lineHeights.tight,
          color: style.colors.textPrimary,
          margin: 0,
        }}
      >
        {parts.map((p, idx) => {
          const isAccent = accentWord && p.toLowerCase() === accentWord.toLowerCase();
          return (
            <span
              key={idx}
              style={{
                color: isAccent ? accentColor : style.colors.textPrimary,
                textShadow: isAccent ? `0 0 30px ${accentColor}aa` : undefined,
              }}
            >
              {p}
            </span>
          );
        })}
      </h1>

      {subheadline && (
        <p
          style={{
            fontFamily: style.typography.fontFamilyBody,
            fontSize: style.typography.fontSizes.bodyLarge,
            color: style.colors.textSecondary,
            marginTop: 32,
            maxWidth: '85%',
          }}
        >
          {subheadline}
        </p>
      )}
    </div>
  );
};
