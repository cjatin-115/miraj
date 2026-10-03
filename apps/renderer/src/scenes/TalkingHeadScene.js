"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TalkingHeadScene = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const style_system_1 = require("@miraaj/style-system");
const TalkingHeadScene = ({ props, frame }) => {
    const { videoSrc, zoomLevel = 1.0, panX = 0, panY = 0, overlayText, roundedCorners = true, backgroundTreatment = 'blur', } = props;
    const style = style_system_1.modernCreatorV1;
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            width: '100%',
            height: '100%',
            backgroundColor: style.colors.background,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
        }, children: [backgroundTreatment === 'blur' && videoSrc && ((0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    inset: -40,
                    backgroundImage: `url(${videoSrc})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: `blur(${style.framing.backgroundBlurSigma}px) brightness(0.4)`,
                    transform: 'scale(1.2)',
                } })), (0, jsx_runtime_1.jsxs)("div", { style: {
                    width: roundedCorners ? '92%' : '100%',
                    height: roundedCorners ? '84%' : '100%',
                    borderRadius: roundedCorners ? style.framing.cornerRadius : 0,
                    border: roundedCorners ? `${style.framing.borderWidth}px solid ${style.framing.borderColor}` : 'none',
                    boxShadow: roundedCorners ? style.framing.shadow : 'none',
                    overflow: 'hidden',
                    position: 'relative',
                    backgroundColor: '#000000',
                }, children: [videoSrc ? ((0, jsx_runtime_1.jsx)("video", { src: videoSrc, autoPlay: true, loop: true, muted: true, style: {
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transform: `scale(${zoomLevel}) translate(${panX * 100}px, ${panY * 100}px)`,
                            transformOrigin: 'center center',
                        } })) : ((0, jsx_runtime_1.jsxs)("div", { style: {
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: style.colors.textSecondary,
                            fontFamily: style.typography.fontFamilyBody,
                            background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
                        }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 64, marginBottom: 16 }, children: "\uD83C\uDFA5" }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 28, fontWeight: 700, color: '#FFFFFF' }, children: "Talking-Head Anchor" }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: 20 }, children: ["Zoom: ", zoomLevel, "x | 9:16 Reframed"] })] })), overlayText && ((0, jsx_runtime_1.jsx)("div", { style: {
                            position: 'absolute',
                            bottom: 32,
                            left: 32,
                            right: 32,
                            backgroundColor: 'rgba(15, 23, 42, 0.85)',
                            backdropFilter: 'blur(12px)',
                            padding: '16px 24px',
                            borderRadius: 16,
                            border: `1px solid ${style.colors.borderSubtle}`,
                            color: style.colors.textPrimary,
                            fontFamily: style.typography.fontFamilyHeading,
                            fontSize: 28,
                            fontWeight: 700,
                            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                        }, children: overlayText }))] })] }));
};
exports.TalkingHeadScene = TalkingHeadScene;
