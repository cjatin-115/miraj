import React from 'react';
import { CTASceneProps } from '@miraaj/timeline';
import { modernCreatorV1 } from '@miraaj/style-system';

interface Props {
  props: CTASceneProps;
  frame: number;
}

export const CTAScene: React.FC<Props> = ({ props, frame }) => {
  const { headline, subtext, buttonText, arrowAnimation = true } = props;
  const style = modernCreatorV1;

  const pulse = Math.sin(frame / 6) * 0.05 + 1.0;

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
        padding: `0 ${style.spacing.screenPadding}px`,
        textAlign: 'center',
        position: 'relative',
      }}
    >
      <h2
        style={{
          fontFamily: style.typography.fontFamilyHeading,
          fontSize: style.typography.fontSizes.h1,
          fontWeight: style.typography.fontWeights.black,
          color: style.colors.textPrimary,
          margin: 0,
        }}
      >
        {headline}
      </h2>

      {subtext && (
        <p
          style={{
            fontFamily: style.typography.fontFamilyBody,
            fontSize: style.typography.fontSizes.bodyLarge,
            color: style.colors.textSecondary,
            margin: '24px 0 48px 0',
            maxWidth: '85%',
          }}
        >
          {subtext}
        </p>
      )}

      {/* Button */}
      <div
        style={{
          transform: `scale(${pulse})`,
          backgroundColor: style.colors.accentHighlight,
          color: '#000000',
          fontFamily: style.typography.fontFamilyHeading,
          fontSize: 32,
          fontWeight: 900,
          padding: '20px 48px',
          borderRadius: 9999,
          boxShadow: `0 0 40px ${style.colors.accentHighlight}88`,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          cursor: 'pointer',
        }}
      >
        <span>{buttonText}</span>
        {arrowAnimation && <span>➔</span>}
      </div>
    </div>
  );
};
