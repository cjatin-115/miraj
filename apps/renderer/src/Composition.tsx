import React from 'react';
import { Sequence, Audio } from 'remotion';
import { Timeline, TimelineScene } from '@miraaj/timeline';

// Talking Head Components
import { FullscreenTalkingHead } from './components/talking-head/FullscreenTalkingHead.js';
import { PunchInTalkingHead } from './components/talking-head/PunchInTalkingHead.js';
import { RoundedTalkingHead } from './components/talking-head/RoundedTalkingHead.js';
import { OverlayTalkingHead } from './components/talking-head/OverlayTalkingHead.js';
import { SplitTalkingHead } from './components/talking-head/SplitTalkingHead.js';

// Text Components
import { WordCaption } from './components/text/WordCaption.js';
import { KeywordCaption } from './components/text/KeywordCaption.js';
import { BigStatement } from './components/text/BigStatement.js';
import { EditorialText } from './components/text/EditorialText.js';
import { CTA } from './components/text/CTA.js';

// Visual Components
import { StatCard } from './components/visuals/StatCard.js';
import { ComparisonCard } from './components/visuals/ComparisonCard.js';
import { CodeBlock } from './components/visuals/CodeBlock.js';
import { BrowserWindow } from './components/visuals/BrowserWindow.js';
import { Screenshot } from './components/visuals/Screenshot.js';
import { ProductCard } from './components/visuals/ProductCard.js';
import { Graph } from './components/visuals/Graph.js';
import { Diagram } from './components/visuals/Diagram.js';
import { ImageScene } from './components/visuals/ImageScene.js';
import { VideoScene } from './components/visuals/VideoScene.js';
import { Quote } from './components/visuals/Quote.js';

// Transitions & Overlays
import { TransitionManager } from './components/transitions/TransitionManager.js';
import { CaptionsTrack } from './components/overlays/CaptionsTrack.js';
import { ProgressBar } from './components/overlays/ProgressBar.js';

export interface MiraajCompositionProps {
  timeline: Timeline;
}

export const MiraajComposition: React.FC<MiraajCompositionProps> = ({ timeline }) => {
  const {
    width = 1080,
    height = 1920,
    scenes = [],
    audioTracks = [],
    overlays = [],
  } = timeline;

  const renderSceneComponent = (scene: TimelineScene) => {
    const sceneProps = {
      ...(scene as any),
      ...((scene.props as any) || {}),
    };

    switch (scene.type) {
      case 'talking_head':
        return <FullscreenTalkingHead props={sceneProps as any} />;
      case 'talking_head_zoom':
        return <PunchInTalkingHead props={sceneProps as any} />;
      case 'talking_head_overlay':
        return <OverlayTalkingHead props={sceneProps as any} />;
      case 'talking_head_split':
        return <SplitTalkingHead props={sceneProps as any} />;

      // Visuals
      case 'statistics':
        return <StatCard props={sceneProps as any} />;
      case 'comparison':
        return <ComparisonCard props={sceneProps as any} />;
      case 'code':
        return <CodeBlock props={sceneProps as any} />;
      case 'browser':
        return <BrowserWindow props={sceneProps as any} />;
      case 'screenshot':
        return <Screenshot props={sceneProps as any} />;
      case 'product_card':
        return <ProductCard props={sceneProps as any} />;
      case 'graph':
        return <Graph props={sceneProps as any} />;
      case 'diagram':
        return <Diagram props={sceneProps as any} />;
      case 'image_broll':
        return <ImageScene props={sceneProps as any} />;
      case 'video_broll':
        return <VideoScene props={sceneProps as any} />;
      case 'quote':
        return <Quote props={sceneProps as any} />;
      case 'cta':
        return <CTA props={sceneProps as any} />;

      // Text / Editorial
      case 'fullscreen_text':
        return <BigStatement props={sceneProps as any} />;
      case 'keyword_text':
        return <KeywordCaption props={sceneProps as any} />;
      case 'editorial_text':
        return <EditorialText props={sceneProps as any} />;
      case 'caption':
        return <WordCaption props={sceneProps as any} />;

      default:
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#07090E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontSize: 32,
              fontFamily: 'sans-serif',
            }}
          >
            Scene: {scene.type}
          </div>
        );
    }
  };

  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        backgroundColor: '#000000',
        overflow: 'hidden',
      }}
    >
      {/* 1. Contiguous Scene Track Sequences */}
      {scenes.map((scene, idx) => (
        <Sequence
          key={scene.id || `scene-${idx}`}
          from={scene.startFrame}
          durationInFrames={scene.durationInFrames}
        >
          <TransitionManager
            transition={scene.transitionIn}
            durationInFrames={scene.durationInFrames}
          >
            {renderSceneComponent(scene)}
          </TransitionManager>
        </Sequence>
      ))}

      {/* 2. Audio Tracks */}
      {audioTracks.map((track, idx) => {
        if (!track.src) return null;
        return (
          <Sequence
            key={track.id || `audio-${idx}`}
            from={track.startFrame}
            durationInFrames={track.durationInFrames}
          >
            <Audio src={track.src} volume={track.volume ?? 1.0} />
          </Sequence>
        );
      })}

      {/* 3. Global Captions Overlay Track */}
      {overlays.length > 0 && <CaptionsTrack overlays={overlays} />}

      {/* 4. Top Playback Progress Bar */}
      <ProgressBar />
    </div>
  );
};
