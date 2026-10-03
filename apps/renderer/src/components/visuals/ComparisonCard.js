"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComparisonCard = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const style_system_1 = require("@miraaj/style-system");
const ComparisonCard = ({ props }) => {
    const { leftTitle = 'Old Way', leftPoints = [], rightTitle = 'New Way', rightPoints = [], winner = 'right', } = props;
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    const style = style_system_1.modernCreatorV1;
    const leftSpring = (0, remotion_1.spring)({
        frame,
        fps,
        config: { damping: 14, stiffness: 120 },
    });
    const rightSpring = (0, remotion_1.spring)({
        frame: Math.max(0, frame - 5),
        fps,
        config: { damping: 13, stiffness: 130 },
    });
    const leftX = (0, remotion_1.interpolate)(leftSpring, [0, 1], [-40, 0]);
    const rightX = (0, remotion_1.interpolate)(rightSpring, [0, 1], [40, 0]);
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
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
        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    fontFamily: style.typography.fontFamilyHeading,
                    fontSize: 52,
                    fontWeight: 900,
                    color: '#FFFFFF',
                    textTransform: 'uppercase',
                    letterSpacing: '-0.02em',
                    marginBottom: 36,
                    textAlign: 'center',
                }, children: "Side-by-Side Comparison" }), (0, jsx_runtime_1.jsxs)("div", { style: {
                    width: '100%',
                    maxWidth: 980,
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 24,
                }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                            padding: 36,
                            borderRadius: 28,
                            backgroundColor: '#111625',
                            border: '2px solid rgba(239, 68, 68, 0.25)',
                            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
                            transform: `translateX(${leftX}px)`,
                            opacity: (0, remotion_1.interpolate)(leftSpring, [0, 1], [0, 1]),
                            display: 'flex',
                            flexDirection: 'column',
                        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                    padding: '6px 16px',
                                    borderRadius: 16,
                                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    color: '#EF4444',
                                    fontFamily: style.typography.fontFamilyHeading,
                                    fontSize: 16,
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    alignSelf: 'flex-start',
                                    marginBottom: 16,
                                }, children: "Traditional" }), (0, jsx_runtime_1.jsx)("div", { style: {
                                    fontFamily: style.typography.fontFamilyHeading,
                                    fontSize: 32,
                                    fontWeight: 800,
                                    color: '#E2E8F0',
                                    marginBottom: 24,
                                }, children: leftTitle }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', flexDirection: 'column', gap: 16 }, children: leftPoints.map((pt, idx) => ((0, jsx_runtime_1.jsxs)("div", { style: {
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 12,
                                        fontFamily: style.typography.fontFamilyBody,
                                        fontSize: 22,
                                        color: '#94A3B8',
                                        lineHeight: 1.3,
                                    }, children: [(0, jsx_runtime_1.jsx)("span", { style: { color: '#EF4444', fontWeight: 900 }, children: "\u2715" }), (0, jsx_runtime_1.jsx)("span", { children: pt })] }, idx))) })] }), (0, jsx_runtime_1.jsxs)("div", { style: {
                            padding: 36,
                            borderRadius: 28,
                            backgroundColor: '#111827',
                            border: '2px solid #FFE600',
                            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 40px rgba(255, 230, 0, 0.25)',
                            transform: `translateX(${rightX}px)`,
                            opacity: (0, remotion_1.interpolate)(rightSpring, [0, 1], [0, 1]),
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                        }, children: [winner === 'right' && ((0, jsx_runtime_1.jsx)("div", { style: {
                                    position: 'absolute',
                                    top: -16,
                                    right: 24,
                                    padding: '6px 18px',
                                    borderRadius: 20,
                                    backgroundColor: '#FFE600',
                                    color: '#07090E',
                                    fontFamily: style.typography.fontFamilyHeading,
                                    fontSize: 15,
                                    fontWeight: 900,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                    boxShadow: '0 4px 14px rgba(255, 230, 0, 0.4)',
                                }, children: "\u2605 Recommended" })), (0, jsx_runtime_1.jsx)("div", { style: {
                                    padding: '6px 16px',
                                    borderRadius: 16,
                                    backgroundColor: 'rgba(255, 230, 0, 0.15)',
                                    border: '1px solid rgba(255, 230, 0, 0.4)',
                                    color: '#FFE600',
                                    fontFamily: style.typography.fontFamilyHeading,
                                    fontSize: 16,
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    alignSelf: 'flex-start',
                                    marginBottom: 16,
                                }, children: "Miraaj Workflow" }), (0, jsx_runtime_1.jsx)("div", { style: {
                                    fontFamily: style.typography.fontFamilyHeading,
                                    fontSize: 32,
                                    fontWeight: 900,
                                    color: '#FFFFFF',
                                    marginBottom: 24,
                                }, children: rightTitle }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', flexDirection: 'column', gap: 16 }, children: rightPoints.map((pt, idx) => ((0, jsx_runtime_1.jsxs)("div", { style: {
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 12,
                                        fontFamily: style.typography.fontFamilyBody,
                                        fontSize: 22,
                                        color: '#FFFFFF',
                                        fontWeight: 600,
                                        lineHeight: 1.3,
                                    }, children: [(0, jsx_runtime_1.jsx)("span", { style: { color: '#10B981', fontWeight: 900 }, children: "\u2713" }), (0, jsx_runtime_1.jsx)("span", { children: pt })] }, idx))) })] })] })] }));
};
exports.ComparisonCard = ComparisonCard;
