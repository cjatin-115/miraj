"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditorialTextScene = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const style_system_1 = require("@miraaj/style-system");
const EditorialTextScene = ({ props }) => {
    const { eyebrow, title, paragraph, citation, bulletPoints } = props;
    const style = style_system_1.modernCreatorV1;
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            width: '100%',
            height: '100%',
            backgroundColor: style.colors.background,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: `0 ${style.spacing.screenPadding}px`,
        }, children: [eyebrow && ((0, jsx_runtime_1.jsx)("div", { style: {
                    fontFamily: style.typography.fontFamilyMono,
                    fontSize: style.typography.fontSizes.badge,
                    fontWeight: 700,
                    color: style.colors.accentHighlight,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    marginBottom: 16,
                }, children: eyebrow })), (0, jsx_runtime_1.jsx)("h2", { style: {
                    fontFamily: style.typography.fontFamilyHeading,
                    fontSize: style.typography.fontSizes.h2,
                    fontWeight: style.typography.fontWeights.bold,
                    color: style.colors.textPrimary,
                    margin: '0 0 24px 0',
                    lineHeight: style.typography.lineHeights.snug,
                }, children: title }), (0, jsx_runtime_1.jsx)("p", { style: {
                    fontFamily: style.typography.fontFamilyBody,
                    fontSize: style.typography.fontSizes.bodyLarge,
                    color: style.colors.textSecondary,
                    lineHeight: style.typography.lineHeights.relaxed,
                    margin: 0,
                }, children: paragraph }), bulletPoints && bulletPoints.length > 0 && ((0, jsx_runtime_1.jsx)("ul", { style: { marginTop: 32, paddingLeft: 24 }, children: bulletPoints.map((bp, i) => ((0, jsx_runtime_1.jsx)("li", { style: {
                        fontFamily: style.typography.fontFamilyBody,
                        fontSize: style.typography.fontSizes.body,
                        color: style.colors.textPrimary,
                        marginBottom: 12,
                    }, children: bp }, i))) })), citation && ((0, jsx_runtime_1.jsxs)("div", { style: {
                    marginTop: 40,
                    fontSize: style.typography.fontSizes.body,
                    color: style.colors.textMuted,
                    fontStyle: 'italic',
                }, children: ["\u2014 ", citation] }))] }));
};
exports.EditorialTextScene = EditorialTextScene;
