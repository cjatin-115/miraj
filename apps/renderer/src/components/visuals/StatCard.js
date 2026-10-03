"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatCard = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const style_system_1 = require("@miraaj/style-system");
const StatCard = ({ props }) => {
    const { statNumber, statLabel, comparisonText, trend = 'up', } = props;
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    const style = style_system_1.modernCreatorV1;
    const numSpring = (0, remotion_1.spring)({
        frame,
        fps,
        config: { damping: 12, stiffness: 130 },
    });
    const numScale = (0, remotion_1.interpolate)(numSpring, [0, 1], [0.6, 1.0]);
    const numOpacity = (0, remotion_1.interpolate)(numSpring, [0, 1], [0, 1]);
    const labelSpring = (0, remotion_1.spring)({
        frame: Math.max(0, frame - 5),
        fps,
        config: { damping: 14, stiffness: 120 },
    });
    const labelY = (0, remotion_1.interpolate)(labelSpring, [0, 1], [30, 0]);
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            width: '100%',
            height: '100%',
            backgroundColor: '#07090E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 54,
            position: 'relative',
            overflow: 'hidden',
        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    width: 700,
                    height: 700,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
                    pointerEvents: 'none',
                } }), (0, jsx_runtime_1.jsxs)("div", { style: {
                    width: '100%',
                    maxWidth: 920,
                    padding: '64px 48px',
                    borderRadius: 36,
                    backgroundColor: '#111625',
                    border: '2px solid rgba(16, 185, 129, 0.3)',
                    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 50px rgba(16, 185, 129, 0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    position: 'relative',
                }, children: [trend && ((0, jsx_runtime_1.jsx)("div", { style: {
                            padding: '6px 20px',
                            borderRadius: 20,
                            backgroundColor: trend === 'up' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            border: `1px solid ${trend === 'up' ? '#10B981' : '#EF4444'}`,
                            color: trend === 'up' ? '#10B981' : '#EF4444',
                            fontFamily: style.typography.fontFamilyHeading,
                            fontSize: 18,
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            marginBottom: 24,
                        }, children: trend === 'up' ? '▲ High Growth' : '▼ Reduction' })), (0, jsx_runtime_1.jsx)("div", { style: {
                            fontFamily: style.typography.fontFamilyHeading,
                            fontSize: 120,
                            fontWeight: 900,
                            color: '#10B981',
                            lineHeight: 1,
                            letterSpacing: '-0.04em',
                            textShadow: '0 0 50px rgba(16, 185, 129, 0.5)',
                            transform: `scale(${numScale})`,
                            opacity: numOpacity,
                            marginBottom: 20,
                        }, children: statNumber }), (0, jsx_runtime_1.jsx)("div", { style: {
                            fontFamily: style.typography.fontFamilyBody,
                            fontSize: 34,
                            fontWeight: 700,
                            color: '#FFFFFF',
                            lineHeight: 1.35,
                            maxWidth: 720,
                            transform: `translateY(${labelY}px)`,
                        }, children: statLabel }), comparisonText && ((0, jsx_runtime_1.jsx)("div", { style: {
                            fontFamily: style.typography.fontFamilyBody,
                            fontSize: 22,
                            color: style.colors.textSecondary,
                            marginTop: 20,
                        }, children: comparisonText }))] })] }));
};
exports.StatCard = StatCard;
