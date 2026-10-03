"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MotionWrapper = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const MotionWrapper = ({ motion = 'none', durationInFrames, children, }) => {
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    if (motion === 'none') {
        return (0, jsx_runtime_1.jsx)("div", { style: { width: '100%', height: '100%' }, children: children });
    }
    const progress = Math.min(1, Math.max(0, frame / Math.max(1, durationInFrames)));
    let style = {
        width: '100%',
        height: '100%',
        position: 'relative',
    };
    switch (motion) {
        case 'zoom': {
            const scale = (0, remotion_1.interpolate)(progress, [0, 1], [1.0, 1.08]);
            style.transform = `scale(${scale})`;
            style.transformOrigin = 'center center';
            break;
        }
        case 'slide': {
            const enterSpring = (0, remotion_1.spring)({ frame, fps, config: { damping: 14, stiffness: 120 } });
            const x = (0, remotion_1.interpolate)(enterSpring, [0, 1], [60, 0]);
            style.transform = `translateX(${x}px)`;
            break;
        }
        case 'blur': {
            const enterSpring = (0, remotion_1.spring)({ frame, fps, config: { damping: 12, stiffness: 100 } });
            const blurPx = (0, remotion_1.interpolate)(enterSpring, [0, 1], [12, 0]);
            style.filter = `blur(${blurPx}px)`;
            break;
        }
        case 'scale': {
            const enterSpring = (0, remotion_1.spring)({ frame, fps, config: { damping: 12, stiffness: 140 } });
            const s = (0, remotion_1.interpolate)(enterSpring, [0, 1], [0.92, 1.0]);
            style.transform = `scale(${s})`;
            break;
        }
        case 'mask_reveal': {
            const enterSpring = (0, remotion_1.spring)({ frame, fps, config: { damping: 15, stiffness: 100 } });
            const clipPct = (0, remotion_1.interpolate)(enterSpring, [0, 1], [100, 0]);
            style.clipPath = `inset(0 0 ${clipPct}% 0)`;
            break;
        }
        case 'camera_move': {
            const panX = (0, remotion_1.interpolate)(Math.sin(frame / 30), [-1, 1], [-8, 8]);
            const panY = (0, remotion_1.interpolate)(Math.cos(frame / 40), [-1, 1], [-6, 6]);
            style.transform = `translate(${panX}px, ${panY}px)`;
            break;
        }
        default:
            break;
    }
    return (0, jsx_runtime_1.jsx)("div", { style: style, children: children });
};
exports.MotionWrapper = MotionWrapper;
