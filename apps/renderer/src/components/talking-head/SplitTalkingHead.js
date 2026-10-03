"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SplitTalkingHead = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const style_system_1 = require("@miraaj/style-system");
const SplitTalkingHead = ({ props }) => {
    const { videoSrc, sourceStartFrame = 0, zoomLevel = 1.15, overlayText, splitLayout = 'top-bottom', } = props;
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    const style = style_system_1.modernCreatorV1;
    const splitSpring = (0, remotion_1.spring)({
        frame,
        fps,
        config: { damping: 14, stiffness: 120 },
    });
    const dividerPos = (0, remotion_1.interpolate)(splitSpring, [0, 1], [0, 50]);
    const isTopBottom = splitLayout === 'top-bottom';
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            width: '100%',
            height: '100%',
            backgroundColor: '#07090E',
            display: 'flex',
            flexDirection: isTopBottom ? 'column' : 'row',
            position: 'relative',
            overflow: 'hidden',
        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    width: isTopBottom ? '100%' : `${dividerPos}%`,
                    height: isTopBottom ? `${dividerPos}%` : '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    borderBottom: isTopBottom ? '3px solid #FFE600' : 'none',
                    borderRight: !isTopBottom ? '3px solid #FFE600' : 'none',
                    backgroundColor: '#000000',
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
                        background: '#111625',
                        color: '#FFFFFF',
                        fontFamily: style.typography.fontFamilyHeading,
                        fontSize: 28,
                        fontWeight: 800,
                    }, children: "Speaker Video" })) }), (0, jsx_runtime_1.jsx)("div", { style: {
                    flex: 1,
                    backgroundColor: '#0D111D',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 48,
                    position: 'relative',
                }, children: (0, jsx_runtime_1.jsxs)("div", { style: {
                        width: '100%',
                        maxWidth: 800,
                        padding: 36,
                        borderRadius: 24,
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        textAlign: 'center',
                        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
                    }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                display: 'inline-block',
                                padding: '8px 20px',
                                borderRadius: 30,
                                backgroundColor: 'rgba(255, 230, 0, 0.15)',
                                border: '1px solid rgba(255, 230, 0, 0.3)',
                                color: '#FFE600',
                                fontFamily: style.typography.fontFamilyHeading,
                                fontSize: 18,
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                marginBottom: 20,
                            }, children: "Context Card" }), (0, jsx_runtime_1.jsx)("div", { style: {
                                fontSize: 34,
                                fontWeight: 800,
                                color: '#FFFFFF',
                                fontFamily: style.typography.fontFamilyHeading,
                                lineHeight: 1.3,
                            }, children: overlayText || 'Real-time Demonstration' })] }) })] }));
};
exports.SplitTalkingHead = SplitTalkingHead;
