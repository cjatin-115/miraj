"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserWindow = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const style_system_1 = require("@miraaj/style-system");
const BrowserWindow = ({ props }) => {
    const { url = 'https://miraaj.video', title = 'Miraaj Video Engine', headline = 'Deterministic AI Video Production', badge = 'Platform Live', points = ['No Arbitrary AI Video Hallucinations', 'Word-for-Word Transcription Alignment', 'Instant 1080x1920 MP4 Export'], } = props;
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    const style = style_system_1.modernCreatorV1;
    const enterSpring = (0, remotion_1.spring)({
        frame,
        fps,
        config: { damping: 14, stiffness: 120 },
    });
    const cardY = (0, remotion_1.interpolate)(enterSpring, [0, 1], [40, 0]);
    return ((0, jsx_runtime_1.jsx)("div", { style: {
            width: '100%',
            height: '100%',
            backgroundColor: '#07090E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 48,
            position: 'relative',
            overflow: 'hidden',
        }, children: (0, jsx_runtime_1.jsxs)("div", { style: {
                width: '100%',
                maxWidth: 960,
                borderRadius: 28,
                backgroundColor: '#111625',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(59, 130, 246, 0.15)',
                overflow: 'hidden',
                transform: `translateY(${cardY}px)`,
            }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                        height: 64,
                        backgroundColor: '#0D111D',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 24px',
                        gap: 20,
                    }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'center', gap: 10 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { width: 14, height: 14, borderRadius: '50%', backgroundColor: '#FF5F56' } }), (0, jsx_runtime_1.jsx)("div", { style: { width: 14, height: 14, borderRadius: '50%', backgroundColor: '#FFBD2E' } }), (0, jsx_runtime_1.jsx)("div", { style: { width: 14, height: 14, borderRadius: '50%', backgroundColor: '#27C93F' } })] }), (0, jsx_runtime_1.jsxs)("div", { style: {
                                flex: 1,
                                height: 38,
                                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                borderRadius: 12,
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0 16px',
                                gap: 10,
                                fontFamily: style.typography.fontFamilyMono,
                                fontSize: 16,
                                color: '#94A3B8',
                            }, children: [(0, jsx_runtime_1.jsx)("span", { style: { color: '#10B981' }, children: "\uD83D\uDD12" }), (0, jsx_runtime_1.jsx)("span", { style: { color: '#F8FAFC' }, children: url })] })] }), (0, jsx_runtime_1.jsxs)("div", { style: {
                        padding: 48,
                        backgroundColor: '#111625',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 24,
                    }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                display: 'inline-block',
                                padding: '6px 16px',
                                borderRadius: 20,
                                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                color: '#3B82F6',
                                fontFamily: style.typography.fontFamilyHeading,
                                fontSize: 16,
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                alignSelf: 'flex-start',
                            }, children: badge }), (0, jsx_runtime_1.jsx)("div", { style: {
                                fontFamily: style.typography.fontFamilyHeading,
                                fontSize: 44,
                                fontWeight: 900,
                                color: '#FFFFFF',
                                lineHeight: 1.2,
                            }, children: headline }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', flexDirection: 'column', gap: 14 }, children: points.map((pt, idx) => ((0, jsx_runtime_1.jsxs)("div", { style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 14,
                                    fontFamily: style.typography.fontFamilyBody,
                                    fontSize: 22,
                                    color: '#CBD5E1',
                                }, children: [(0, jsx_runtime_1.jsx)("span", { style: { color: '#FFE600', fontWeight: 900 }, children: "\u26A1" }), (0, jsx_runtime_1.jsx)("span", { children: pt })] }, idx))) })] })] }) }));
};
exports.BrowserWindow = BrowserWindow;
