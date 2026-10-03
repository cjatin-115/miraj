"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
const remotion_1 = require("remotion");
const Root_js_1 = require("./Root.js");
__exportStar(require("./Composition.js"), exports);
__exportStar(require("./Root.js"), exports);
__exportStar(require("./sampleTimeline.js"), exports);
// Talking Head Components
__exportStar(require("./components/talking-head/FullscreenTalkingHead.js"), exports);
__exportStar(require("./components/talking-head/PunchInTalkingHead.js"), exports);
__exportStar(require("./components/talking-head/RoundedTalkingHead.js"), exports);
__exportStar(require("./components/talking-head/OverlayTalkingHead.js"), exports);
__exportStar(require("./components/talking-head/SplitTalkingHead.js"), exports);
// Text Components
__exportStar(require("./components/text/WordCaption.js"), exports);
__exportStar(require("./components/text/KeywordCaption.js"), exports);
__exportStar(require("./components/text/BigStatement.js"), exports);
__exportStar(require("./components/text/EditorialText.js"), exports);
__exportStar(require("./components/text/CTA.js"), exports);
// Visual Components
__exportStar(require("./components/visuals/StatCard.js"), exports);
__exportStar(require("./components/visuals/ComparisonCard.js"), exports);
__exportStar(require("./components/visuals/CodeBlock.js"), exports);
__exportStar(require("./components/visuals/BrowserWindow.js"), exports);
__exportStar(require("./components/visuals/Screenshot.js"), exports);
__exportStar(require("./components/visuals/ProductCard.js"), exports);
__exportStar(require("./components/visuals/Graph.js"), exports);
__exportStar(require("./components/visuals/Diagram.js"), exports);
__exportStar(require("./components/visuals/ImageScene.js"), exports);
__exportStar(require("./components/visuals/VideoScene.js"), exports);
__exportStar(require("./components/visuals/Quote.js"), exports);
// Motion, Transitions, Overlays
__exportStar(require("./components/motion/MotionWrapper.js"), exports);
__exportStar(require("./components/transitions/TransitionManager.js"), exports);
__exportStar(require("./components/overlays/ProgressBar.js"), exports);
__exportStar(require("./components/overlays/CaptionsTrack.js"), exports);
(0, remotion_1.registerRoot)(Root_js_1.Root);
