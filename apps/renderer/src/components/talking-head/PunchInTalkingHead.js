"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PunchInTalkingHead = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const style_system_1 = require("@miraaj/style-system");
const PunchInTalkingHead = ({ props }) => {
    const { videoSrc, sourceStartFrame = 0, zoomLevel = 1.22, panX = 0, panY = 0, } = props;
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    const style = style_system_1.modernCreatorV1;
    // Punch-in entrance with snappy creator spring
    const punchSpring = (0, remotion_1.spring)({
        frame,
        fps,
        config: {
            damping: 14,
            stiffness: 140,
            mass: 0.8,
        },
    });
    const effectiveScale = (0, remotion_1.interpolate)(punchSpring, [0, 1], [1.0, zoomLevel]);
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            width: '100%',
            height: '100%',
            backgroundColor: '#000000',
            position: 'relative',
            overflow: 'hidden',
        }, children: [videoSrc ? ((0, jsx_runtime_1.jsx)(remotion_1.OffthreadVideo, { src: videoSrc, startFrom: sourceStartFrame, style: {
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: `scale(${effectiveScale}) translate(${panX * 80}px, ${panY * 80}px)`,
                    transformOrigin: 'center 38%',
                } })) : ((0, jsx_runtime_1.jsxs)("div", { style: {
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(180deg, #1A1F35 0%, #0B0E17 100%)',
                    color: '#FFFFFF',
                    fontFamily: style.typography.fontFamilyHeading,
                    transform: `scale(${effectiveScale})`,
                }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                            width: 140,
                            height: 140,
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255, 230, 0, 0.15)',
                            border: '3px solid #FFE600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 64,
                            marginBottom: 24,
                            boxShadow: '0 0 40px rgba(255, 230, 0, 0.35)',
                        }, children: "\uD83D\uDD0D" }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 36, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }, children: "Punch-In Reframing" }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: 22, color: '#FFE600', marginTop: 8, fontWeight: 700 }, children: ["Zoom: ", zoomLevel, "x \u2022 Face Centered"] })] })), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    inset: 0,
                    boxShadow: 'inset 0 0 100px rgba(0, 0, 0, 0.6)',
                    pointerEvents: 'none',
                } })] }));
};
exports.PunchInTalkingHead = PunchInTalkingHead;
