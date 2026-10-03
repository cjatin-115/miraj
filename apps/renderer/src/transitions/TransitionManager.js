"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransitionWrapper = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const TransitionWrapper = ({ transition, frameInScene, durationInFrames, children, }) => {
    if (!transition || transition.type === 'cut' || transition.durationInFrames <= 0) {
        return (0, jsx_runtime_1.jsx)("div", { style: { width: '100%', height: '100%', position: 'relative' }, children: children });
    }
    const { type, durationInFrames: transDur, direction = 'left' } = transition;
    const progress = Math.min(1, Math.max(0, frameInScene / transDur));
    let style = {
        width: '100%',
        height: '100%',
        position: 'relative',
        transition: 'all 0.1s ease-out',
    };
    if (frameInScene < transDur) {
        switch (type) {
            case 'fade':
                style.opacity = progress;
                break;
            case 'zoom':
                style.transform = `scale(${0.85 + 0.15 * progress})`;
                style.opacity = progress;
                break;
            case 'slide':
                const offset = (1 - progress) * 100;
                if (direction === 'left')
                    style.transform = `translateX(${offset}%)`;
                else if (direction === 'right')
                    style.transform = `translateX(-${offset}%)`;
                else if (direction === 'up')
                    style.transform = `translateY(${offset}%)`;
                else
                    style.transform = `translateY(-${offset}%)`;
                break;
            case 'blur':
                style.filter = `blur(${(1 - progress) * 20}px)`;
                style.opacity = progress;
                break;
            case 'scale':
                style.transform = `scale(${1.2 - 0.2 * progress})`;
                style.opacity = progress;
                break;
            case 'whip':
                style.transform = `translateX(${(1 - progress) * 120}%) skewX(${(1 - progress) * -15}deg)`;
                style.filter = `blur(${(1 - progress) * 15}px)`;
                break;
            default:
                break;
        }
    }
    return (0, jsx_runtime_1.jsx)("div", { style: style, children: children });
};
exports.TransitionWrapper = TransitionWrapper;
