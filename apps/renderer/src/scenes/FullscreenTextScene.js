"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FullscreenTextScene = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const style_system_1 = require("@miraaj/style-system");
const FullscreenTextScene = ({ props, frame }) => {
    const { headline, subheadline, accentWord, accentColor = '#FFE600' } = props;
    const style = style_system_1.modernCreatorV1;
    // Split headline to highlight accentWord
    const parts = accentWord ? headline.split(new RegExp(`(${accentWord})`, 'gi')) : [headline];
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            width: '100%',
            height: '100%',
            backgroundColor: style.colors.background,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: style.spacing.screenPadding,
            textAlign: 'center',
        }, children: [(0, jsx_runtime_1.jsx)("h1", { style: {
                    fontFamily: style.typography.fontFamilyHeading,
                    fontSize: style.typography.fontSizes.h1,
                    fontWeight: style.typography.fontWeights.black,
                    lineHeight: style.typography.lineHeights.tight,
                    color: style.colors.textPrimary,
                    margin: 0,
                }, children: parts.map((p, idx) => {
                    const isAccent = accentWord && p.toLowerCase() === accentWord.toLowerCase();
                    return ((0, jsx_runtime_1.jsx)("span", { style: {
                            color: isAccent ? accentColor : style.colors.textPrimary,
                            textShadow: isAccent ? `0 0 30px ${accentColor}aa` : undefined,
                        }, children: p }, idx));
                }) }), subheadline && ((0, jsx_runtime_1.jsx)("p", { style: {
                    fontFamily: style.typography.fontFamilyBody,
                    fontSize: style.typography.fontSizes.bodyLarge,
                    color: style.colors.textSecondary,
                    marginTop: 32,
                    maxWidth: '85%',
                }, children: subheadline }))] }));
};
exports.FullscreenTextScene = FullscreenTextScene;
