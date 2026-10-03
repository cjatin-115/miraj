"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiraajComposition = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
// Talking Head Components
const FullscreenTalkingHead_js_1 = require("./components/talking-head/FullscreenTalkingHead.js");
const PunchInTalkingHead_js_1 = require("./components/talking-head/PunchInTalkingHead.js");
const OverlayTalkingHead_js_1 = require("./components/talking-head/OverlayTalkingHead.js");
const SplitTalkingHead_js_1 = require("./components/talking-head/SplitTalkingHead.js");
// Text Components
const WordCaption_js_1 = require("./components/text/WordCaption.js");
const KeywordCaption_js_1 = require("./components/text/KeywordCaption.js");
const BigStatement_js_1 = require("./components/text/BigStatement.js");
const EditorialText_js_1 = require("./components/text/EditorialText.js");
const CTA_js_1 = require("./components/text/CTA.js");
// Visual Components
const StatCard_js_1 = require("./components/visuals/StatCard.js");
const ComparisonCard_js_1 = require("./components/visuals/ComparisonCard.js");
const CodeBlock_js_1 = require("./components/visuals/CodeBlock.js");
const BrowserWindow_js_1 = require("./components/visuals/BrowserWindow.js");
const Screenshot_js_1 = require("./components/visuals/Screenshot.js");
const ProductCard_js_1 = require("./components/visuals/ProductCard.js");
const Graph_js_1 = require("./components/visuals/Graph.js");
const Diagram_js_1 = require("./components/visuals/Diagram.js");
const ImageScene_js_1 = require("./components/visuals/ImageScene.js");
const VideoScene_js_1 = require("./components/visuals/VideoScene.js");
const Quote_js_1 = require("./components/visuals/Quote.js");
// Transitions & Overlays
const TransitionManager_js_1 = require("./components/transitions/TransitionManager.js");
const CaptionsTrack_js_1 = require("./components/overlays/CaptionsTrack.js");
const ProgressBar_js_1 = require("./components/overlays/ProgressBar.js");
const MiraajComposition = ({ timeline }) => {
    const { width = 1080, height = 1920, scenes = [], audioTracks = [], overlays = [], } = timeline;
    const renderSceneComponent = (scene) => {
        switch (scene.type) {
            case 'talking_head':
                return (0, jsx_runtime_1.jsx)(FullscreenTalkingHead_js_1.FullscreenTalkingHead, { props: scene.props });
            case 'talking_head_zoom':
                return (0, jsx_runtime_1.jsx)(PunchInTalkingHead_js_1.PunchInTalkingHead, { props: scene.props });
            case 'talking_head_overlay':
                return (0, jsx_runtime_1.jsx)(OverlayTalkingHead_js_1.OverlayTalkingHead, { props: scene.props });
            case 'talking_head_split':
                return (0, jsx_runtime_1.jsx)(SplitTalkingHead_js_1.SplitTalkingHead, { props: scene.props });
            // Visuals
            case 'statistics':
                return (0, jsx_runtime_1.jsx)(StatCard_js_1.StatCard, { props: scene.props });
            case 'comparison':
                return (0, jsx_runtime_1.jsx)(ComparisonCard_js_1.ComparisonCard, { props: scene.props });
            case 'code':
                return (0, jsx_runtime_1.jsx)(CodeBlock_js_1.CodeBlock, { props: scene.props });
            case 'browser':
                return (0, jsx_runtime_1.jsx)(BrowserWindow_js_1.BrowserWindow, { props: scene.props });
            case 'screenshot':
                return (0, jsx_runtime_1.jsx)(Screenshot_js_1.Screenshot, { props: scene.props });
            case 'product_card':
                return (0, jsx_runtime_1.jsx)(ProductCard_js_1.ProductCard, { props: scene.props });
            case 'graph':
                return (0, jsx_runtime_1.jsx)(Graph_js_1.Graph, { props: scene.props });
            case 'diagram':
                return (0, jsx_runtime_1.jsx)(Diagram_js_1.Diagram, { props: scene.props });
            case 'image_broll':
                return (0, jsx_runtime_1.jsx)(ImageScene_js_1.ImageScene, { props: scene.props });
            case 'video_broll':
                return (0, jsx_runtime_1.jsx)(VideoScene_js_1.VideoScene, { props: scene.props });
            case 'quote':
                return (0, jsx_runtime_1.jsx)(Quote_js_1.Quote, { props: scene.props });
            case 'cta':
                return (0, jsx_runtime_1.jsx)(CTA_js_1.CTA, { props: scene.props });
            // Text / Editorial
            case 'fullscreen_text':
                return (0, jsx_runtime_1.jsx)(BigStatement_js_1.BigStatement, { props: scene.props });
            case 'keyword_text':
                return (0, jsx_runtime_1.jsx)(KeywordCaption_js_1.KeywordCaption, { props: scene.props });
            case 'editorial_text':
                return (0, jsx_runtime_1.jsx)(EditorialText_js_1.EditorialText, { props: scene.props });
            case 'caption':
                return (0, jsx_runtime_1.jsx)(WordCaption_js_1.WordCaption, { props: scene.props });
            default:
                return ((0, jsx_runtime_1.jsxs)("div", { style: {
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#07090E',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        fontSize: 32,
                        fontFamily: 'sans-serif',
                    }, children: ["Scene: ", scene.type] }));
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            width,
            height,
            position: 'relative',
            backgroundColor: '#000000',
            overflow: 'hidden',
        }, children: [scenes.map((scene, idx) => ((0, jsx_runtime_1.jsx)(remotion_1.Sequence, { from: scene.startFrame, durationInFrames: scene.durationInFrames, children: (0, jsx_runtime_1.jsx)(TransitionManager_js_1.TransitionManager, { transition: scene.transitionIn, durationInFrames: scene.durationInFrames, children: renderSceneComponent(scene) }) }, scene.id || `scene-${idx}`))), audioTracks.map((track, idx) => {
                if (!track.src)
                    return null;
                return ((0, jsx_runtime_1.jsx)(remotion_1.Sequence, { from: track.startFrame, durationInFrames: track.durationInFrames, children: (0, jsx_runtime_1.jsx)(remotion_1.Audio, { src: track.src, volume: track.volume ?? 1.0 }) }, track.id || `audio-${idx}`));
            }), overlays.length > 0 && (0, jsx_runtime_1.jsx)(CaptionsTrack_js_1.CaptionsTrack, { overlays: overlays }), (0, jsx_runtime_1.jsx)(ProgressBar_js_1.ProgressBar, {})] }));
};
exports.MiraajComposition = MiraajComposition;
