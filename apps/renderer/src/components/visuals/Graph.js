"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Graph = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const style_system_1 = require("@miraaj/style-system");
const Graph = ({ props }) => {
    const { title = 'Performance Comparison', labels = ['Manual', 'Basic AI', 'Miraaj V1'], values = [20, 55, 95], colorScheme = ['#EF4444', '#3B82F6', '#FFE600'], } = props;
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    const style = style_system_1.modernCreatorV1;
    const maxVal = Math.max(...values, 100);
    const cardSpring = (0, remotion_1.spring)({
        frame,
        fps,
        config: { damping: 14, stiffness: 120 },
    });
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
        }, children: (0, jsx_runtime_1.jsxs)("div", { style: {
                width: '100%',
                maxWidth: 960,
                padding: '48px 44px',
                borderRadius: 32,
                backgroundColor: '#111625',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 50px rgba(255, 230, 0, 0.15)',
                transform: `scale(${(0, remotion_1.interpolate)(cardSpring, [0, 1], [0.92, 1.0])})`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                        fontFamily: style.typography.fontFamilyHeading,
                        fontSize: 48,
                        fontWeight: 900,
                        color: '#FFFFFF',
                        textTransform: 'uppercase',
                        letterSpacing: '-0.02em',
                        marginBottom: 48,
                        textAlign: 'center',
                    }, children: title }), (0, jsx_runtime_1.jsxs)("div", { style: {
                        width: '100%',
                        height: 380,
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'space-around',
                        borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
                        paddingBottom: 0,
                        position: 'relative',
                    }, children: [(0, jsx_runtime_1.jsx)("div", { style: { position: 'absolute', top: 0, left: 0, right: 0, borderTop: '1px dashed rgba(255,255,255,0.1)' } }), (0, jsx_runtime_1.jsx)("div", { style: { position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1px dashed rgba(255,255,255,0.1)' } }), values.map((val, idx) => {
                            const barSpring = (0, remotion_1.spring)({
                                frame: Math.max(0, frame - 5 - idx * 4),
                                fps,
                                config: { damping: 12, stiffness: 100 },
                            });
                            const targetHeightPct = (val / maxVal) * 100;
                            const currentHeightPct = (0, remotion_1.interpolate)(barSpring, [0, 1], [0, targetHeightPct]);
                            const color = colorScheme[idx % colorScheme.length];
                            return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    width: 140,
                                    height: '100%',
                                    justifyContent: 'flex-end',
                                }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                                            fontFamily: style.typography.fontFamilyHeading,
                                            fontSize: 28,
                                            fontWeight: 900,
                                            color,
                                            marginBottom: 12,
                                            opacity: (0, remotion_1.interpolate)(barSpring, [0, 1], [0, 1]),
                                        }, children: [Math.round(val), "%"] }), (0, jsx_runtime_1.jsx)("div", { style: {
                                            width: '100%',
                                            height: `${currentHeightPct}%`,
                                            backgroundColor: color,
                                            borderRadius: '16px 16px 0 0',
                                            boxShadow: `0 0 25px ${color}66`,
                                            minHeight: 8,
                                        } })] }, idx));
                        })] }), (0, jsx_runtime_1.jsx)("div", { style: {
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-around',
                        marginTop: 20,
                    }, children: labels.map((lbl, idx) => ((0, jsx_runtime_1.jsx)("div", { style: {
                            width: 140,
                            textAlign: 'center',
                            fontFamily: style.typography.fontFamilyHeading,
                            fontSize: 22,
                            fontWeight: 700,
                            color: '#CBD5E1',
                        }, children: lbl }, idx))) })] }) }));
};
exports.Graph = Graph;
