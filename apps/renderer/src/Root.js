"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Root = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const Composition_js_1 = require("./Composition.js");
const sampleTimeline_js_1 = require("./sampleTimeline.js");
const Root = () => {
    return ((0, jsx_runtime_1.jsx)(remotion_1.Composition, { id: "MiraajVideo", component: Composition_js_1.MiraajComposition, durationInFrames: sampleTimeline_js_1.sampleTimeline.durationInFrames, fps: sampleTimeline_js_1.sampleTimeline.fps, width: sampleTimeline_js_1.sampleTimeline.width, height: sampleTimeline_js_1.sampleTimeline.height, defaultProps: {
            timeline: sampleTimeline_js_1.sampleTimeline,
        }, calculateMetadata: ({ props }) => {
            const t = props?.timeline || sampleTimeline_js_1.sampleTimeline;
            return {
                durationInFrames: t.durationInFrames || 300,
                fps: t.fps || 30,
                width: t.width || 1080,
                height: t.height || 1920,
            };
        } }));
};
exports.Root = Root;
