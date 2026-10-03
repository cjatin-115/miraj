"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Screenshot = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const style_system_1 = require("@miraaj/style-system");
const Screenshot = ({ props }) => {
    const { imageUrl, caption = 'Application Interface', tag = 'Software UI', } = props;
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    const style = style_system_1.modernCreatorV1;
    const enterSpring = (0, remotion_1.spring)({
        frame,
        fps,
        config: { damping: 14, stiffness: 120 },
    });
    const cardScale = (0, remotion_1.interpolate)(enterSpring, [0, 1], [0.9, 1.0]);
    return ((0, jsx_runtime_1.jsx)("div", { style: {
            width: '100%',
            height: '100%',
            backgroundColor: '#07090E',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 48,
            position: 'relative',
            overflow: 'hidden',
        }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                width: '100%',
                maxWidth: 960,
                borderRadius: 32,
                backgroundColor: '#111625',
                border: '2px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8), 0 0 50px rgba(59, 130, 246, 0.2)',
                overflow: 'hidden',
                transform: `scale(${cardScale})`,
            }, children: imageUrl ? ((0, jsx_runtime_1.jsx)("img", { src: imageUrl, alt: caption, style: { width: '100%', height: 'auto', display: 'block', maxHeight: 800, objectFit: 'cover' } })) : ((0, jsx_runtime_1.jsxs)("div", { style: {
                    height: 600,
                    backgroundColor: '#0B0E17',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 40,
                }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 64, marginBottom: 16 }, children: "\uD83D\uDCF1" }), (0, jsx_runtime_1.jsx)("div", { style: {
                            fontFamily: style.typography.fontFamilyHeading,
                            fontSize: 36,
                            fontWeight: 900,
                            color: '#FFFFFF',
                        }, children: caption }), (0, jsx_runtime_1.jsx)("div", { style: {
                            fontFamily: style.typography.fontFamilyMono,
                            fontSize: 20,
                            color: '#3B82F6',
                            marginTop: 10,
                        }, children: tag })] })) }) }));
};
exports.Screenshot = Screenshot;
