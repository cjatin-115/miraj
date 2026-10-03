"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditorialText = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const style_system_1 = require("@miraaj/style-system");
const EditorialText = ({ props }) => {
    const { eyebrow, title, paragraph, citation, bulletPoints = [], } = props;
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    const style = style_system_1.modernCreatorV1;
    const cardSpring = (0, remotion_1.spring)({
        frame,
        fps,
        config: { damping: 14, stiffness: 120 },
    });
    const cardY = (0, remotion_1.interpolate)(cardSpring, [0, 1], [40, 0]);
    const cardOpacity = (0, remotion_1.interpolate)(cardSpring, [0, 1], [0, 1]);
    return ((0, jsx_runtime_1.jsx)("div", { style: {
            width: '100%',
            height: '100%',
            backgroundColor: '#07090E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: style.safeAreas.left,
            position: 'relative',
            overflow: 'hidden',
        }, children: (0, jsx_runtime_1.jsxs)("div", { style: {
                width: '100%',
                maxWidth: 960,
                padding: 48,
                borderRadius: 32,
                backgroundColor: '#111625',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7)',
                transform: `translateY(${cardY}px)`,
                opacity: cardOpacity,
                position: 'relative',
            }, children: [eyebrow && ((0, jsx_runtime_1.jsx)("div", { style: {
                        display: 'inline-block',
                        padding: '6px 18px',
                        borderRadius: 20,
                        backgroundColor: 'rgba(255, 230, 0, 0.15)',
                        border: '1px solid rgba(255, 230, 0, 0.3)',
                        color: '#FFE600',
                        fontFamily: style.typography.fontFamilyHeading,
                        fontSize: 18,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        marginBottom: 20,
                    }, children: eyebrow })), (0, jsx_runtime_1.jsx)("h2", { style: {
                        fontFamily: style.typography.fontFamilyHeading,
                        fontSize: 48,
                        fontWeight: 900,
                        color: '#FFFFFF',
                        lineHeight: 1.2,
                        margin: 0,
                        marginBottom: 20,
                        letterSpacing: '-0.02em',
                    }, children: title }), paragraph && ((0, jsx_runtime_1.jsx)("p", { style: {
                        fontFamily: style.typography.fontFamilyBody,
                        fontSize: 26,
                        color: style.colors.textSecondary,
                        lineHeight: 1.5,
                        margin: 0,
                        marginBottom: bulletPoints.length > 0 ? 24 : 0,
                    }, children: paragraph })), bulletPoints.length > 0 && ((0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', flexDirection: 'column', gap: 14 }, children: bulletPoints.map((pt, idx) => ((0, jsx_runtime_1.jsxs)("div", { style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 16,
                            fontFamily: style.typography.fontFamilyBody,
                            fontSize: 24,
                            fontWeight: 600,
                            color: '#F8FAFC',
                        }, children: [(0, jsx_runtime_1.jsx)("span", { style: {
                                    width: 28,
                                    height: 28,
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                    border: '1.5px solid #10B981',
                                    color: '#10B981',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 16,
                                    fontWeight: 900,
                                    flexShrink: 0,
                                }, children: "\u2713" }), (0, jsx_runtime_1.jsx)("span", { children: pt })] }, idx))) })), citation && ((0, jsx_runtime_1.jsxs)("div", { style: {
                        marginTop: 28,
                        fontSize: 18,
                        color: style.colors.textMuted,
                        fontFamily: style.typography.fontFamilyMono,
                    }, children: ["\u2014 ", citation] }))] }) }));
};
exports.EditorialText = EditorialText;
