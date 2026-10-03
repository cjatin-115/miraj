"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Quote = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const style_system_1 = require("@miraaj/style-system");
const Quote = ({ props }) => {
    const { quote, author = 'Industry Leader', authorTitle = 'Creator & Engineer', avatarUrl, } = props;
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    const style = style_system_1.modernCreatorV1;
    const enterSpring = (0, remotion_1.spring)({
        frame,
        fps,
        config: { damping: 14, stiffness: 120 },
    });
    const cardScale = (0, remotion_1.interpolate)(enterSpring, [0, 1], [0.92, 1.0]);
    return ((0, jsx_runtime_1.jsx)("div", { style: {
            width: '100%',
            height: '100%',
            backgroundColor: '#07090E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 54,
            position: 'relative',
            overflow: 'hidden',
        }, children: (0, jsx_runtime_1.jsxs)("div", { style: {
                width: '100%',
                maxWidth: 960,
                padding: '64px 48px',
                borderRadius: 36,
                backgroundColor: '#111625',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(139, 92, 246, 0.15)',
                transform: `scale(${cardScale})`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative',
            }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                        fontFamily: 'Georgia, serif',
                        fontSize: 120,
                        lineHeight: 0.6,
                        color: '#FFE600',
                        marginBottom: 28,
                        userSelect: 'none',
                    }, children: "\u201C" }), (0, jsx_runtime_1.jsx)("div", { style: {
                        fontFamily: style.typography.fontFamilyHeading,
                        fontSize: 42,
                        fontWeight: 800,
                        color: '#FFFFFF',
                        lineHeight: 1.35,
                        letterSpacing: '-0.02em',
                        marginBottom: 36,
                    }, children: quote }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'center', gap: 16 }, children: [avatarUrl ? ((0, jsx_runtime_1.jsx)("img", { src: avatarUrl, alt: author, style: { width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #FFE600' } })) : ((0, jsx_runtime_1.jsx)("div", { style: {
                                width: 56,
                                height: 56,
                                borderRadius: '50%',
                                backgroundColor: 'rgba(255, 230, 0, 0.15)',
                                border: '2px solid #FFE600',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 26,
                            }, children: "\uD83D\uDCAC" })), (0, jsx_runtime_1.jsxs)("div", { style: { textAlign: 'left' }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                        fontFamily: style.typography.fontFamilyHeading,
                                        fontSize: 26,
                                        fontWeight: 800,
                                        color: '#FFE600',
                                    }, children: author }), authorTitle && ((0, jsx_runtime_1.jsx)("div", { style: {
                                        fontFamily: style.typography.fontFamilyBody,
                                        fontSize: 18,
                                        color: style.colors.textSecondary,
                                    }, children: authorTitle }))] })] })] }) }));
};
exports.Quote = Quote;
