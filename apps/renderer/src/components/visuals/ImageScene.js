"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageScene = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const style_system_1 = require("@miraaj/style-system");
const ImageScene = ({ props }) => {
    const { mediaSrc, kenBurns = 'zoom-in', overlayCaption, } = props;
    const frame = (0, remotion_1.useCurrentFrame)();
    const style = style_system_1.modernCreatorV1;
    // Ken burns zoom-in / zoom-out interpolation
    const scale = kenBurns === 'zoom-in'
        ? (0, remotion_1.interpolate)(frame, [0, 150], [1.0, 1.15], { extrapolateRight: 'clamp' })
        : kenBurns === 'zoom-out'
            ? (0, remotion_1.interpolate)(frame, [0, 150], [1.15, 1.0], { extrapolateRight: 'clamp' })
            : 1.0;
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            width: '100%',
            height: '100%',
            backgroundColor: '#07090E',
            position: 'relative',
            overflow: 'hidden',
        }, children: [mediaSrc ? ((0, jsx_runtime_1.jsx)("img", { src: mediaSrc, alt: overlayCaption || 'Visual', style: {
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: `scale(${scale})`,
                    transformOrigin: 'center center',
                } })) : ((0, jsx_runtime_1.jsxs)("div", { style: {
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(180deg, #1A1F35 0%, #07090E 100%)',
                    color: '#FFFFFF',
                }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 64, marginBottom: 16 }, children: "\uD83D\uDDBC\uFE0F" }), (0, jsx_runtime_1.jsx)("div", { style: { fontFamily: style.typography.fontFamilyHeading, fontSize: 36, fontWeight: 900 }, children: overlayCaption || 'Visual Asset' })] })), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    inset: 0,
                    boxShadow: 'inset 0 0 120px rgba(0, 0, 0, 0.7)',
                    pointerEvents: 'none',
                } }), overlayCaption && ((0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    bottom: style.safeAreas.bottom + 20,
                    left: style.safeAreas.left,
                    right: style.safeAreas.right,
                    textAlign: 'center',
                }, children: (0, jsx_runtime_1.jsx)("span", { style: {
                        padding: '12px 28px',
                        borderRadius: 20,
                        backgroundColor: 'rgba(0, 0, 0, 0.75)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#FFFFFF',
                        fontFamily: style.typography.fontFamilyHeading,
                        fontSize: 26,
                        fontWeight: 800,
                    }, children: overlayCaption }) }))] }));
};
exports.ImageScene = ImageScene;
