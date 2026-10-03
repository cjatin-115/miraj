"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CTAScene = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const style_system_1 = require("@miraaj/style-system");
const CTAScene = ({ props, frame }) => {
    const { headline, subtext, buttonText, arrowAnimation = true } = props;
    const style = style_system_1.modernCreatorV1;
    const pulse = Math.sin(frame / 6) * 0.05 + 1.0;
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            width: '100%',
            height: '100%',
            backgroundColor: style.colors.background,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: `0 ${style.spacing.screenPadding}px`,
            textAlign: 'center',
            position: 'relative',
        }, children: [(0, jsx_runtime_1.jsx)("h2", { style: {
                    fontFamily: style.typography.fontFamilyHeading,
                    fontSize: style.typography.fontSizes.h1,
                    fontWeight: style.typography.fontWeights.black,
                    color: style.colors.textPrimary,
                    margin: 0,
                }, children: headline }), subtext && ((0, jsx_runtime_1.jsx)("p", { style: {
                    fontFamily: style.typography.fontFamilyBody,
                    fontSize: style.typography.fontSizes.bodyLarge,
                    color: style.colors.textSecondary,
                    margin: '24px 0 48px 0',
                    maxWidth: '85%',
                }, children: subtext })), (0, jsx_runtime_1.jsxs)("div", { style: {
                    transform: `scale(${pulse})`,
                    backgroundColor: style.colors.accentHighlight,
                    color: '#000000',
                    fontFamily: style.typography.fontFamilyHeading,
                    fontSize: 32,
                    fontWeight: 900,
                    padding: '20px 48px',
                    borderRadius: 9999,
                    boxShadow: `0 0 40px ${style.colors.accentHighlight}88`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    cursor: 'pointer',
                }, children: [(0, jsx_runtime_1.jsx)("span", { children: buttonText }), arrowAnimation && (0, jsx_runtime_1.jsx)("span", { children: "\u2794" })] })] }));
};
exports.CTAScene = CTAScene;
