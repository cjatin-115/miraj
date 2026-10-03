import React from 'react';
import { OffthreadVideo, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { TalkingHeadProps } from '@miraaj/timeline';
import { modernCreatorV1 } from '@miraaj/style-system';

interface Props {
  props: TalkingHeadProps;
}

export const SplitTalkingHead: React.FC<Props> = ({ props }) => {
  const {
    videoSrc,
    sourceStartFrame = 0,
    zoomLevel = 1.15,
    overlayText,
    splitLayout = 'top-bottom',
  } = props;

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const style = modernCreatorV1;

  const splitSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const dividerPos = interpolate(splitSpring, [0, 1], [0, 50]);

  const isTopBottom = splitLayout === 'top-bottom';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#07090E',
        display: 'flex',
        flexDirection: isTopBottom ? 'column' : 'row',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top / Left Half: Talking-Head Video */}
      <div
        style={{
          width: isTopBottom ? '100%' : `${dividerPos}%`,
          height: isTopBottom ? `${dividerPos}%` : '100%',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: isTopBottom ? '3px solid #FFE600' : 'none',
          borderRight: !isTopBottom ? '3px solid #FFE600' : 'none',
          backgroundColor: '#000000',
        }}
      >
        {videoSrc ? (
          <OffthreadVideo
            src={videoSrc}
            startFrom={sourceStartFrame}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center 35%',
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#111625',
              color: '#FFFFFF',
              fontFamily: style.typography.fontFamilyHeading,
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            Speaker Video
          </div>
        )}
      </div>

      {/* Bottom / Right Half: Supporting Data / Visual Panel */}
      <div
        style={{
          flex: 1,
          backgroundColor: '#0D111D',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 48,
          position: 'relative',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 800,
            padding: 36,
            borderRadius: 24,
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              padding: '8px 20px',
              borderRadius: 30,
              backgroundColor: 'rgba(255, 230, 0, 0.15)',
              border: '1px solid rgba(255, 230, 0, 0.3)',
              color: '#FFE600',
              fontFamily: style.typography.fontFamilyHeading,
              fontSize: 18,
              fontWeight: 800,
              textTransform: 'uppercase',
              marginBottom: 20,
            }}
          >
            Context Card
          </div>
          <div
            style={{
              fontSize: 34,
              fontWeight: 800,
              color: '#FFFFFF',
              fontFamily: style.typography.fontFamilyHeading,
              lineHeight: 1.3,
            }}
          >
            {overlayText || 'Real-time Demonstration'}
          </div>
        </div>
      </div>
    </div>
  );
};
