"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransitionManager = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const TransitionManager = ({ transition, durationInFrames, children, }) => {
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    if (!transition || transition.type === 'cut' || transition.durationInFrames <= 0) {
        return (0, jsx_runtime_1.jsx)("div", { style: { width: '100%', height: '100%', position: 'relative' }, children: children });
    }
    const { type, durationInFrames: transDur, direction = 'left' } = transition;
    let style = {
        width: '100%',
        height: '100%',
        position: 'relative',
    };
    // Entrance transition
    if (frame < transDur) {
        const progress = Math.min(1, Math.max(0, frame / transDur));
        const spr = (0, remotion_1.spring)({
            frame,
            fps,
            config: { damping: 14, stiffness: 120 },
        });
        switch (type) {
            case 'fade':
                style.opacity = progress;
                break;
            case 'zoom':
                style.transform = `scale(${(0, remotion_1.interpolate)(spr, [0, 1], [0.85, 1.0])})`;
                style.opacity = progress;
                break;
            case 'slide': {
                const offset = (0, remotion_1.interpolate)(spr, [0, 1], [100, 0]);
                if (direction === 'left')
                    style.transform = `translateX(${offset}%)`;
                else if (direction === 'right')
                    style.transform = `translateX(-${offset}%)`;
                else if (direction === 'up')
                    style.transform = `translateY(${offset}%)`;
                else
                    style.transform = `translateY(-${offset}%)`;
                break;
            }
            case 'blur': {
                const blurAmount = (0, remotion_1.interpolate)(spr, [0, 1], [24, 0]);
                style.filter = `blur(${blurAmount}px)`;
                style.opacity = progress;
                break;
            }
            case 'scale': {
                const s = (0, remotion_1.interpolate)(spr, [0, 1], [1.2, 1.0]);
                style.transform = `scale(${s})`;
                style.opacity = progress;
                break;
            }
            case 'whip': {
                const xOffset = (0, remotion_1.interpolate)(spr, [0, 1], [120, 0]);
                const skew = (0, remotion_1.interpolate)(spr, [0, 1], [-15, 0]);
                const blurWhip = (0, remotion_1.interpolate)(spr, [0, 1], [20, 0]);
                style.transform = `translateX(${xOffset}%) skewX(${skew}deg)`;
                style.filter = `blur(${blurWhip}px)`;
                break;
            }
            default:
                break;
        }
    }
    return (0, jsx_runtime_1.jsx)("div", { style: style, children: children });
};
exports.TransitionManager = TransitionManager;
