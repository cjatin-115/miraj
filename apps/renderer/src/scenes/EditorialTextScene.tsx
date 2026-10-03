import React from 'react';
import { EditorialTextProps } from '@miraaj/timeline';
import { modernCreatorV1 } from '@miraaj/style-system';

interface Props {
  props: EditorialTextProps;
  frame: number;
}

export const EditorialTextScene: React.FC<Props> = ({ props }) => {
  const { eyebrow, title, paragraph, citation, bulletPoints } = props;
  const style = modernCreatorV1;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: style.colors.background,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: `0 ${style.spacing.screenPadding}px`,
      }}
    >
      {eyebrow && (
        <div
          style={{
            fontFamily: style.typography.fontFamilyMono,
            fontSize: style.typography.fontSizes.badge,
            fontWeight: 700,
            color: style.colors.accentHighlight,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}
        >
          {eyebrow}
        </div>
      )}

      <h2
        style={{
          fontFamily: style.typography.fontFamilyHeading,
          fontSize: style.typography.fontSizes.h2,
          fontWeight: style.typography.fontWeights.bold,
          color: style.colors.textPrimary,
          margin: '0 0 24px 0',
          lineHeight: style.typography.lineHeights.snug,
        }}
      >
        {title}
      </h2>

      <p
        style={{
          fontFamily: style.typography.fontFamilyBody,
          fontSize: style.typography.fontSizes.bodyLarge,
          color: style.colors.textSecondary,
          lineHeight: style.typography.lineHeights.relaxed,
          margin: 0,
        }}
      >
        {paragraph}
      </p>

      {bulletPoints && bulletPoints.length > 0 && (
        <ul style={{ marginTop: 32, paddingLeft: 24 }}>
          {bulletPoints.map((bp, i) => (
            <li
              key={i}
              style={{
                fontFamily: style.typography.fontFamilyBody,
                fontSize: style.typography.fontSizes.body,
                color: style.colors.textPrimary,
                marginBottom: 12,
              }}
            >
              {bp}
            </li>
          ))}
        </ul>
      )}

      {citation && (
        <div
          style={{
            marginTop: 40,
            fontSize: style.typography.fontSizes.body,
            color: style.colors.textMuted,
            fontStyle: 'italic',
          }}
        >
          — {citation}
        </div>
      )}
    </div>
  );
};
