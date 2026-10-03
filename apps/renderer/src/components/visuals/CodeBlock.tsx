import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { CodeSceneProps } from '@miraaj/timeline';
import { modernCreatorV1 } from '@miraaj/style-system';

interface Props {
  props: CodeSceneProps;
}

export const CodeBlock: React.FC<Props> = ({ props }) => {
  const {
    code = '',
    language = 'python',
    filename = 'pipeline.py',
    highlightLines = [2, 3],
  } = props || {};

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const style = modernCreatorV1;

  const enterSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const cardY = interpolate(enterSpring, [0, 1], [40, 0]);
  const lines = code.trim().split('\n');

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
      {/* Background cyan glow */}
      <div
        style={{
          position: 'absolute',
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: 960,
          borderRadius: 28,
          backgroundColor: '#0D1117',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(6, 182, 212, 0.15)',
          overflow: 'hidden',
          transform: `translateY(${cardY}px)`,
        }}
      >
        {/* macOS Window Titlebar */}
        <div
          style={{
            height: 56,
            backgroundColor: '#161B22',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
          }}
        >
          {/* Traffic lights */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#FF5F56' }} />
            <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
            <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#27C93F' }} />
          </div>

          {/* Filename */}
          <div
            style={{
              fontFamily: style.typography.fontFamilyMono,
              fontSize: 18,
              color: '#8B949E',
              fontWeight: 600,
            }}
          >
            {filename}
          </div>

          {/* Language Badge */}
          <div
            style={{
              padding: '4px 12px',
              borderRadius: 8,
              backgroundColor: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              color: '#06B6D4',
              fontFamily: style.typography.fontFamilyMono,
              fontSize: 14,
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            {language}
          </div>
        </div>

        {/* Code Content */}
        <div
          style={{
            padding: '32px 28px',
            fontFamily: style.typography.fontFamilyMono,
            fontSize: 24,
            lineHeight: 1.6,
          }}
        >
          {lines.map((line, idx) => {
            const lineNum = idx + 1;
            const isHighlighted = highlightLines.includes(lineNum);

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px 12px',
                  borderRadius: 8,
                  backgroundColor: isHighlighted ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                  borderLeft: isHighlighted ? '3px solid #06B6D4' : '3px solid transparent',
                }}
              >
                {/* Line number */}
                <span
                  style={{
                    width: 44,
                    color: isHighlighted ? '#06B6D4' : '#484F58',
                    userSelect: 'none',
                    fontSize: 20,
                    fontWeight: 600,
                  }}
                >
                  {lineNum}
                </span>

                {/* Line text */}
                <span
                  style={{
                    color: isHighlighted ? '#FFFFFF' : '#C9D1D9',
                    fontWeight: isHighlighted ? 600 : 400,
                  }}
                >
                  {line}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
