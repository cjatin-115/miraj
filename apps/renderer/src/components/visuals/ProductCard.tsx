import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { ProductCardSceneProps } from '@miraaj/timeline';
import { modernCreatorV1 } from '@miraaj/style-system';

interface Props {
  props: ProductCardSceneProps;
}

export const ProductCard: React.FC<Props> = ({ props }) => {
  const {
    productName = 'Miraaj Studio Pro',
    badge = 'V1 Release',
    rating = 5,
    keyFeatures = ['Local AI Pipeline', 'Deterministic Remotion Rendering', 'Zero API Key Required'],
    price = 'Free & Open',
  } = props;

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const style = modernCreatorV1;

  const cardSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const cardY = interpolate(cardSpring, [0, 1], [40, 0]);

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
          maxWidth: 920,
          padding: 48,
          borderRadius: 32,
          backgroundColor: '#111625',
          border: '2px solid rgba(255, 230, 0, 0.3)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 50px rgba(255, 230, 0, 0.15)',
          transform: `translateY(${cardY}px)`,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <span
            style={{
              padding: '6px 16px',
              borderRadius: 20,
              backgroundColor: 'rgba(255, 230, 0, 0.15)',
              border: '1px solid rgba(255, 230, 0, 0.4)',
              color: '#FFE600',
              fontFamily: style.typography.fontFamilyHeading,
              fontSize: 16,
              fontWeight: 800,
              textTransform: 'uppercase',
            }}
          >
            {badge}
          </span>
          <span style={{ fontSize: 24, color: '#FFE600' }}>
            {'★'.repeat(rating)}
          </span>
        </div>

        <div
          style={{
            fontFamily: style.typography.fontFamilyHeading,
            fontSize: 48,
            fontWeight: 900,
            color: '#FFFFFF',
            marginBottom: 12,
          }}
        >
          {productName}
        </div>

        <div
          style={{
            fontFamily: style.typography.fontFamilyHeading,
            fontSize: 32,
            fontWeight: 800,
            color: '#10B981',
            marginBottom: 28,
          }}
        >
          {price}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {keyFeatures.map((feat, idx) => (
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
              <span style={{ color: '#10B981', fontWeight: 900 }}>✓</span>
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
