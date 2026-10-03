"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OverlayTalkingHead = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const style_system_1 = require("@miraaj/style-system");
const OverlayTalkingHead = ({ props }) => {
    const { videoSrc, sourceStartFrame = 0, zoomLevel = 1.1, secondarySrc, overlayText, } = props;
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    const style = style_system_1.modernCreatorV1;
    const pipSpring = (0, remotion_1.spring)({
        frame,
        fps,
        config: { damping: 14, stiffness: 130 },
    });
    const pipScale = (0, remotion_1.interpolate)(pipSpring, [0, 1], [0.8, 1.0]);
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            width: '100%',
            height: '100%',
            backgroundColor: '#07090E',
            position: 'relative',
            overflow: 'hidden',
        }, children: [secondarySrc ? ((0, jsx_runtime_1.jsx)("div", { style: { width: '100%', height: '100%' }, children: (0, jsx_runtime_1.jsx)("img", { src: secondarySrc, alt: "Background", style: { width: '100%', height: '100%', objectFit: 'cover' } }) })) : ((0, jsx_runtime_1.jsx)("div", { style: {
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(circle at 50% 30%, #17213C 0%, #07090E 80%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 60,
                }, children: (0, jsx_runtime_1.jsxs)("div", { style: {
                        padding: '24px 48px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 24,
                        textAlign: 'center',
                        backdropFilter: 'blur(20px)',
                    }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 44, fontWeight: 900, color: '#FFFFFF', fontFamily: style.typography.fontFamilyHeading }, children: overlayText || 'Visual Focus Moment' }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 24, color: style.colors.textSecondary, marginTop: 12 }, children: "Speaker Commentary Overlay" })] }) })), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    bottom: 260, // Above bottom safe area (240px)
                    right: 48, // Inside right safe area (48px)
                    width: 320,
                    height: 320,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '4px solid #FFE600',
                    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 230, 0, 0.3)',
                    backgroundColor: '#000000',
                    transform: `scale(${pipScale})`,
                    zIndex: 50,
                }, children: videoSrc ? ((0, jsx_runtime_1.jsx)(remotion_1.OffthreadVideo, { src: videoSrc, startFrom: sourceStartFrame, style: {
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: 'center 35%',
                    } })) : ((0, jsx_runtime_1.jsx)("div", { style: {
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 54,
                        background: '#1A1F35',
                    }, children: "\uD83D\uDC64" })) })] }));
};
exports.OverlayTalkingHead = OverlayTalkingHead;
