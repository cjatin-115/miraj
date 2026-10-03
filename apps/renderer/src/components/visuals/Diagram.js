"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Diagram = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const style_system_1 = require("@miraaj/style-system");
const Diagram = ({ props }) => {
    const { steps = [
        { title: 'Ingest Video', description: 'Face & audio extraction', icon: '📹' },
        { title: 'AI Director', description: 'Formulates EditPlan', icon: '🎬' },
        { title: 'Remotion', description: 'Deterministic rendering', icon: '⚡' },
    ], currentStepIndex = 1, } = props;
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    const style = style_system_1.modernCreatorV1;
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
                padding: 48,
                borderRadius: 32,
                backgroundColor: '#111625',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
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
                        marginBottom: 44,
                    }, children: "Pipeline Architecture" }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }, children: steps.map((st, idx) => {
                        const isCurrent = idx === currentStepIndex;
                        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: 24,
                                padding: '24px 28px',
                                borderRadius: 20,
                                backgroundColor: isCurrent ? 'rgba(255, 230, 0, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                                border: isCurrent ? '2px solid #FFE600' : '1px solid rgba(255, 255, 255, 0.08)',
                                boxShadow: isCurrent ? '0 0 30px rgba(255, 230, 0, 0.25)' : 'none',
                            }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 44 }, children: st.icon || '📌' }), (0, jsx_runtime_1.jsxs)("div", { style: { flex: 1 }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                                                fontFamily: style.typography.fontFamilyHeading,
                                                fontSize: 30,
                                                fontWeight: 800,
                                                color: isCurrent ? '#FFE600' : '#FFFFFF',
                                            }, children: [idx + 1, ". ", st.title] }), st.description && ((0, jsx_runtime_1.jsx)("div", { style: {
                                                fontFamily: style.typography.fontFamilyBody,
                                                fontSize: 20,
                                                color: style.colors.textSecondary,
                                                marginTop: 4,
                                            }, children: st.description }))] }), isCurrent && ((0, jsx_runtime_1.jsx)("span", { style: {
                                        padding: '4px 12px',
                                        borderRadius: 12,
                                        backgroundColor: '#FFE600',
                                        color: '#07090E',
                                        fontFamily: style.typography.fontFamilyHeading,
                                        fontSize: 14,
                                        fontWeight: 900,
                                        textTransform: 'uppercase',
                                    }, children: "Active Step" }))] }, idx));
                    }) })] }) }));
};
exports.Diagram = Diagram;
