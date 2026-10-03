import React from 'react';
import { CodeSceneProps } from '@miraaj/timeline';
import { modernCreatorV1 } from '@miraaj/style-system';

interface Props {
  props: CodeSceneProps;
  frame: number;
}

export const CodeScene: React.FC<Props> = ({ props }) => {
  const { code, language, filename = 'main.py', highlightLines = [] } = props;
  const style = modernCreatorV1;
  const lines = code.split('\n');

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: style.colors.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `0 ${style.spacing.screenPadding}px`,
      }}
    >
      <div
        style={{
          width: '100%',
          backgroundColor: '#0F172A',
          borderRadius: 24,
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)',
          overflow: 'hidden',
        }}
      >
        {/* Terminal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            backgroundColor: '#1E293B',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#EF4444' }} />
            <span style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#F59E0B' }} />
            <span style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#10B981' }} />
          </div>
          <div
            style={{
              fontFamily: style.typography.fontFamilyMono,
              fontSize: 18,
              color: style.colors.textSecondary,
            }}
          >
            {filename}
          </div>
          <div
            style={{
              fontSize: 14,
              color: style.colors.accentPrimary,
              fontFamily: style.typography.fontFamilyMono,
              textTransform: 'uppercase',
            }}
          >
            {language}
          </div>
        </div>

        {/* Code Content */}
        <pre
          style={{
            margin: 0,
            padding: '24px',
            fontFamily: style.typography.fontFamilyMono,
            fontSize: 22,
            lineHeight: 1.6,
            color: '#E2E8F0',
            overflowX: 'auto',
          }}
        >
          {lines.map((line, idx) => {
            const lineNum = idx + 1;
            const isHighlighted = highlightLines.includes(lineNum);
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: isHighlighted ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                  padding: '2px 8px',
                  borderRadius: 4,
                  display: 'flex',
                }}
              >
                <span style={{ width: 36, color: '#64748B', userSelect: 'none' }}>{lineNum}</span>
                <span>{line}</span>
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
};
