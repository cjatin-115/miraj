"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductCard = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const style_system_1 = require("@miraaj/style-system");
const ProductCard = ({ props }) => {
    const { productName = 'Miraaj Studio Pro', badge = 'V1 Release', rating = 5, keyFeatures = ['Local AI Pipeline', 'Deterministic Remotion Rendering', 'Zero API Key Required'], price = 'Free & Open', } = props;
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    const style = style_system_1.modernCreatorV1;
    const cardSpring = (0, remotion_1.spring)({
        frame,
        fps,
        config: { damping: 14, stiffness: 120 },
    });
    const cardY = (0, remotion_1.interpolate)(cardSpring, [0, 1], [40, 0]);
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
                maxWidth: 920,
                padding: 48,
                borderRadius: 32,
                backgroundColor: '#111625',
                border: '2px solid rgba(255, 230, 0, 0.3)',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 50px rgba(255, 230, 0, 0.15)',
                transform: `translateY(${cardY}px)`,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
            }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }, children: [(0, jsx_runtime_1.jsx)("span", { style: {
                                padding: '6px 16px',
                                borderRadius: 20,
                                backgroundColor: 'rgba(255, 230, 0, 0.15)',
                                border: '1px solid rgba(255, 230, 0, 0.4)',
                                color: '#FFE600',
                                fontFamily: style.typography.fontFamilyHeading,
                                fontSize: 16,
                                fontWeight: 800,
                                textTransform: 'uppercase',
                            }, children: badge }), (0, jsx_runtime_1.jsx)("span", { style: { fontSize: 24, color: '#FFE600' }, children: '★'.repeat(rating) })] }), (0, jsx_runtime_1.jsx)("div", { style: {
                        fontFamily: style.typography.fontFamilyHeading,
                        fontSize: 48,
                        fontWeight: 900,
                        color: '#FFFFFF',
                        marginBottom: 12,
                    }, children: productName }), (0, jsx_runtime_1.jsx)("div", { style: {
                        fontFamily: style.typography.fontFamilyHeading,
                        fontSize: 32,
                        fontWeight: 800,
                        color: '#10B981',
                        marginBottom: 28,
                    }, children: price }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', flexDirection: 'column', gap: 14 }, children: keyFeatures.map((feat, idx) => ((0, jsx_runtime_1.jsxs)("div", { style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 14,
                            fontFamily: style.typography.fontFamilyBody,
                            fontSize: 22,
                            color: '#CBD5E1',
                        }, children: [(0, jsx_runtime_1.jsx)("span", { style: { color: '#10B981', fontWeight: 900 }, children: "\u2713" }), (0, jsx_runtime_1.jsx)("span", { children: feat })] }, idx))) })] }) }));
};
exports.ProductCard = ProductCard;
