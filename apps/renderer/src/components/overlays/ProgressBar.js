"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressBar = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const ProgressBar = ({ color = '#FFE600', height = 8, }) => {
    const frame = (0, remotion_1.useCurrentFrame)();
    const { durationInFrames } = (0, remotion_1.useVideoConfig)();
    const progress = durationInFrames > 0 ? (frame / durationInFrames) * 100 : 0;
    return ((0, jsx_runtime_1.jsx)("div", { style: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${progress}%`,
            height,
            backgroundColor: color,
            zIndex: 100,
            boxShadow: `0 0 16px ${color}`,
            transition: 'width 0.04s linear',
            pointerEvents: 'none',
        } }));
};
exports.ProgressBar = ProgressBar;
