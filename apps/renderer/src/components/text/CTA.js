"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CTA = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const style_system_1 = require("@miraaj/style-system");
const CTA = ({ props }) => {
    const { headline, subtext, buttonText, arrowAnimation = true, } = props;
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    const style = style_system_1.modernCreatorV1;
    const btnSpring = (0, remotion_1.spring)({
        frame,
        fps,
        config: { damping: 11, stiffness: 140 },
    });
    const btnScale = (0, remotion_1.interpolate)(btnSpring, [0, 1], [0.75, 1.0]);
    // Subtle button pulse after entry
    const pulse = Math.sin(frame / 8) * 0.03;
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            width: '100%',
            height: '100%',
            backgroundColor: '#07090E',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 54,
            position: 'relative',
            overflow: 'hidden',
            textAlign: 'center',
        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    width: 700,
                    height: 700,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255, 230, 0, 0.18) 0%, transparent 65%)',
                    pointerEvents: 'none',
                } }), (0, jsx_runtime_1.jsx)("div", { style: {
                    fontFamily: style.typography.fontFamilyHeading,
                    fontSize: 64,
                    fontWeight: 900,
                    color: '#FFFFFF',
                    textTransform: 'uppercase',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.15,
                    maxWidth: 900,
                    marginBottom: 20,
                }, children: headline }), subtext && ((0, jsx_runtime_1.jsx)("div", { style: {
                    fontFamily: style.typography.fontFamilyBody,
                    fontSize: 28,
                    color: style.colors.textSecondary,
                    maxWidth: 720,
                    marginBottom: 44,
                    lineHeight: 1.4,
                }, children: subtext })), (0, jsx_runtime_1.jsxs)("div", { style: {
                    transform: `scale(${btnScale + pulse})`,
                    padding: '24px 56px',
                    borderRadius: 40,
                    backgroundColor: '#FFE600',
                    boxShadow: '0 16px 40px rgba(255, 230, 0, 0.4), 0 0 50px rgba(255, 230, 0, 0.2)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 16,
                    cursor: 'pointer',
                }, children: [(0, jsx_runtime_1.jsx)("span", { style: {
                            fontFamily: style.typography.fontFamilyHeading,
                            fontSize: 32,
                            fontWeight: 900,
                            color: '#07090E',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                        }, children: buttonText || 'Follow for More' }), arrowAnimation && ((0, jsx_runtime_1.jsx)("span", { style: {
                            fontSize: 36,
                            color: '#07090E',
                            transform: `translateX(${Math.sin(frame / 6) * 6}px)`,
                            display: 'inline-block',
                        }, children: "\u2192" }))] })] }));
};
exports.CTA = CTA;
