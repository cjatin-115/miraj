"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FullscreenTalkingHead = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const style_system_1 = require("@miraaj/style-system");
const FullscreenTalkingHead = ({ props }) => {
    const { videoSrc, sourceStartFrame = 0, panX = 0, panY = 0, } = props;
    const frame = (0, remotion_1.useCurrentFrame)();
    const style = style_system_1.modernCreatorV1;
    // Subtle natural camera breathing (micro-motion) to keep frame dynamic
    const microScale = (0, remotion_1.interpolate)(Math.sin(frame / 45), [-1, 1], [1.0, 1.015]);
    return ((0, jsx_runtime_1.jsx)("div", { style: {
            width: '100%',
            height: '100%',
            backgroundColor: '#000000',
            position: 'relative',
            overflow: 'hidden',
        }, children: videoSrc ? ((0, jsx_runtime_1.jsx)(remotion_1.OffthreadVideo, { src: videoSrc, startFrom: sourceStartFrame, style: {
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: `scale(${microScale}) translate(${panX * 100}px, ${panY * 100}px)`,
                transformOrigin: 'center 40%',
            } })) : ((0, jsx_runtime_1.jsxs)("div", { style: {
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(180deg, #111625 0%, #07090E 100%)',
                color: '#FFFFFF',
                fontFamily: style.typography.fontFamilyHeading,
            }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                        width: 140,
                        height: 140,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 230, 0, 0.1)',
                        border: '2px solid rgba(255, 230, 0, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 64,
                        marginBottom: 24,
                        boxShadow: '0 0 30px rgba(255, 230, 0, 0.2)',
                    }, children: "\uD83D\uDC64" }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 36, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }, children: "Talking-Head Anchor" }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 22, color: style.colors.textSecondary, marginTop: 8 }, children: "9:16 Fullscreen Stream" })] })) }));
};
exports.FullscreenTalkingHead = FullscreenTalkingHead;
