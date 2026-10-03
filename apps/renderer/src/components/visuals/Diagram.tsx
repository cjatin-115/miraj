import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { DiagramSceneProps } from '@miraaj/timeline';
import { modernCreatorV1 } from '@miraaj/style-system';

interface Props {
  props: DiagramSceneProps;
}

export const Diagram: React.FC<Props> = ({ props }) => {
  const {
    steps = [
      { title: 'Ingest Video', description: 'Face & audio extraction', icon: '📹' },
      { title: 'AI Director', description: 'Formulates EditPlan', icon: '🎬' },
      { title: 'Remotion', description: 'Deterministic rendering', icon: '⚡' },
    ],
    currentStepIndex = 1,
  } = props;

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const style = modernCreatorV1;

  const cardSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#07090E',
        display: 'flex',
        flexDirection: 'column',
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
          padding: 48,
          borderRadius: 32,
          backgroundColor: '#111625',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
          transform: `scale(${interpolate(cardSpring, [0, 1], [0.92, 1.0])})`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            fontFamily: style.typography.fontFamilyHeading,
            fontSize: 48,
            fontWeight: 900,
            color: '#FFFFFF',
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
            marginBottom: 44,
          }}
        >
          Pipeline Architecture
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
          {steps.map((st, idx) => {
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 24,
                  padding: '24px 28px',
                  borderRadius: 20,
                  backgroundColor: isCurrent ? 'rgba(255, 230, 0, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                  border: isCurrent ? '2px solid #FFE600' : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: isCurrent ? '0 0 30px rgba(255, 230, 0, 0.25)' : 'none',
                }}
              >
                <div style={{ fontSize: 44 }}>{st.icon || '📌'}</div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: style.typography.fontFamilyHeading,
                      fontSize: 30,
                      fontWeight: 800,
                      color: isCurrent ? '#FFE600' : '#FFFFFF',
                    }}
                  >
                    {idx + 1}. {st.title}
                  </div>
                  {st.description && (
                    <div
                      style={{
                        fontFamily: style.typography.fontFamilyBody,
                        fontSize: 20,
                        color: style.colors.textSecondary,
                        marginTop: 4,
                      }}
                    >
                      {st.description}
                    </div>
                  )}
                </div>
                {isCurrent && (
                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: 12,
                      backgroundColor: '#FFE600',
                      color: '#07090E',
                      fontFamily: style.typography.fontFamilyHeading,
                      fontSize: 14,
                      fontWeight: 900,
                      textTransform: 'uppercase',
                    }}
                  >
                    Active Step
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
