"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BigStatement = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const style_system_1 = require("@miraaj/style-system");
const BigStatement = ({ props }) => {
    const { headline, subheadline, accentWord, accentColor = '#FFE600', theme = 'dark', } = props;
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    const style = style_system_1.modernCreatorV1;
    const titleSpring = (0, remotion_1.spring)({
        frame,
        fps,
        config: { damping: 13, stiffness: 120 },
    });
    const subtitleSpring = (0, remotion_1.spring)({
        frame: Math.max(0, frame - 6),
        fps,
        config: { damping: 14, stiffness: 110 },
    });
    const titleY = (0, remotion_1.interpolate)(titleSpring, [0, 1], [40, 0]);
    const titleOpacity = (0, remotion_1.interpolate)(titleSpring, [0, 1], [0, 1]);
    const subY = (0, remotion_1.interpolate)(subtitleSpring, [0, 1], [30, 0]);
    const subOpacity = (0, remotion_1.interpolate)(subtitleSpring, [0, 1], [0, 1]);
    // Highlight accent word if present
    const renderHeadline = () => {
        if (!accentWord)
            return headline;
        const parts = headline.split(new RegExp(`(${accentWord})`, 'gi'));
        return parts.map((part, i) => {
            if (part.toLowerCase() === accentWord.toLowerCase()) {
                return ((0, jsx_runtime_1.jsx)("span", { style: {
                        color: accentColor,
                        textShadow: `0 0 40px ${accentColor}66`,
                        display: 'inline-block',
                    }, children: part }, i));
            }
            return part;
        });
    };
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
                    width: 800,
                    height: 800,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${accentColor}18 0%, transparent 65%)`,
                    pointerEvents: 'none',
                } }), (0, jsx_runtime_1.jsx)("div", { style: {
                    fontFamily: style.typography.fontFamilyHeading,
                    fontSize: 76,
                    fontWeight: 900,
                    color: '#FFFFFF',
                    lineHeight: 1.15,
                    letterSpacing: '-0.03em',
                    textTransform: 'uppercase',
                    maxWidth: 960,
                    transform: `translateY(${titleY}px)`,
                    opacity: titleOpacity,
                    zIndex: 10,
                }, children: renderHeadline() }), subheadline && ((0, jsx_runtime_1.jsx)("div", { style: {
                    fontFamily: style.typography.fontFamilyBody,
                    fontSize: 32,
                    fontWeight: 500,
                    color: style.colors.textSecondary,
                    lineHeight: 1.4,
                    maxWidth: 820,
                    marginTop: 32,
                    transform: `translateY(${subY}px)`,
                    opacity: subOpacity,
                    zIndex: 10,
                }, children: subheadline }))] }));
};
exports.BigStatement = BigStatement;
