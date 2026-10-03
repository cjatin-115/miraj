"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoScene = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const style_system_1 = require("@miraaj/style-system");
const VideoScene = ({ props }) => {
    const { mediaSrc, sourceStartFrame = 0, overlayCaption, } = props;
    const style = style_system_1.modernCreatorV1;
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            width: '100%',
            height: '100%',
            backgroundColor: '#000000',
            position: 'relative',
            overflow: 'hidden',
        }, children: [mediaSrc ? ((0, jsx_runtime_1.jsx)(remotion_1.OffthreadVideo, { src: mediaSrc, startFrom: sourceStartFrame, style: { width: '100%', height: '100%', objectFit: 'cover' } })) : ((0, jsx_runtime_1.jsx)("div", { style: {
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#0B0E17',
                    color: '#FFFFFF',
                    fontFamily: style.typography.fontFamilyHeading,
                    fontSize: 32,
                    fontWeight: 800,
                }, children: "\uD83C\uDFAC B-Roll Video Stream" })), overlayCaption && ((0, jsx_runtime_1.jsx)("div", { style: {
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
exports.VideoScene = VideoScene;
