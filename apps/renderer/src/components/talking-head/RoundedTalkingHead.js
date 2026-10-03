"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoundedTalkingHead = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const style_system_1 = require("@miraaj/style-system");
const RoundedTalkingHead = ({ props }) => {
    const { videoSrc, sourceStartFrame = 0, zoomLevel = 1.05, panX = 0, panY = 0, overlayText, } = props;
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    const style = style_system_1.modernCreatorV1;
    const enterSpring = (0, remotion_1.spring)({
        frame,
        fps,
        config: { damping: 15, stiffness: 120 },
    });
    const cardScale = (0, remotion_1.interpolate)(enterSpring, [0, 1], [0.94, 1.0]);
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            width: '100%',
            height: '100%',
            backgroundColor: '#07090E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
        }, children: [videoSrc && ((0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    inset: -50,
                    overflow: 'hidden',
                    filter: 'blur(40px) brightness(0.35)',
                    transform: 'scale(1.2)',
                }, children: (0, jsx_runtime_1.jsx)(remotion_1.OffthreadVideo, { src: videoSrc, startFrom: sourceStartFrame, style: { width: '100%', height: '100%', objectFit: 'cover' } }) })), (0, jsx_runtime_1.jsxs)("div", { style: {
                    width: '92%',
                    height: '84%',
                    borderRadius: 36,
                    border: '2px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(59, 130, 246, 0.15)',
                    overflow: 'hidden',
                    position: 'relative',
                    backgroundColor: '#000000',
                    transform: `scale(${cardScale})`,
                }, children: [videoSrc ? ((0, jsx_runtime_1.jsx)(remotion_1.OffthreadVideo, { src: videoSrc, startFrom: sourceStartFrame, style: {
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transform: `scale(${zoomLevel}) translate(${panX * 60}px, ${panY * 60}px)`,
                            transformOrigin: 'center 40%',
                        } })) : ((0, jsx_runtime_1.jsxs)("div", { style: {
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFFFFF',
                            fontFamily: style.typography.fontFamilyHeading,
                            background: 'linear-gradient(180deg, #13192B 0%, #0A0D15 100%)',
                        }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 56, marginBottom: 16 }, children: "\uD83C\uDFA5" }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 32, fontWeight: 900 }, children: "Rounded Creator Window" }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 20, color: style.colors.textSecondary, marginTop: 8 }, children: "Modern Frame \u2022 36px Curvature" })] })), overlayText && ((0, jsx_runtime_1.jsx)("div", { style: {
                            position: 'absolute',
                            bottom: 32,
                            left: 32,
                            backgroundColor: 'rgba(0, 0, 0, 0.75)',
                            backdropFilter: 'blur(16px)',
                            padding: '12px 24px',
                            borderRadius: 16,
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            color: '#FFFFFF',
                            fontFamily: style.typography.fontFamilyHeading,
                            fontSize: 22,
                            fontWeight: 700,
                        }, children: overlayText }))] })] }));
};
exports.RoundedTalkingHead = RoundedTalkingHead;
