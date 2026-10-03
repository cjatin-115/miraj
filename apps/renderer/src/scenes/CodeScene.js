"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeScene = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const style_system_1 = require("@miraaj/style-system");
const CodeScene = ({ props }) => {
    const { code, language, filename = 'main.py', highlightLines = [] } = props;
    const style = style_system_1.modernCreatorV1;
    const lines = code.split('\n');
    return ((0, jsx_runtime_1.jsx)("div", { style: {
            width: '100%',
            height: '100%',
            backgroundColor: style.colors.background,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: `0 ${style.spacing.screenPadding}px`,
        }, children: (0, jsx_runtime_1.jsxs)("div", { style: {
                width: '100%',
                backgroundColor: '#0F172A',
                borderRadius: 24,
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)',
                overflow: 'hidden',
            }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 24px',
                        backgroundColor: '#1E293B',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 8 }, children: [(0, jsx_runtime_1.jsx)("span", { style: { width: 14, height: 14, borderRadius: '50%', backgroundColor: '#EF4444' } }), (0, jsx_runtime_1.jsx)("span", { style: { width: 14, height: 14, borderRadius: '50%', backgroundColor: '#F59E0B' } }), (0, jsx_runtime_1.jsx)("span", { style: { width: 14, height: 14, borderRadius: '50%', backgroundColor: '#10B981' } })] }), (0, jsx_runtime_1.jsx)("div", { style: {
                                fontFamily: style.typography.fontFamilyMono,
                                fontSize: 18,
                                color: style.colors.textSecondary,
                            }, children: filename }), (0, jsx_runtime_1.jsx)("div", { style: {
                                fontSize: 14,
                                color: style.colors.accentPrimary,
                                fontFamily: style.typography.fontFamilyMono,
                                textTransform: 'uppercase',
                            }, children: language })] }), (0, jsx_runtime_1.jsx)("pre", { style: {
                        margin: 0,
                        padding: '24px',
                        fontFamily: style.typography.fontFamilyMono,
                        fontSize: 22,
                        lineHeight: 1.6,
                        color: '#E2E8F0',
                        overflowX: 'auto',
                    }, children: lines.map((line, idx) => {
                        const lineNum = idx + 1;
                        const isHighlighted = highlightLines.includes(lineNum);
                        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                backgroundColor: isHighlighted ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                                padding: '2px 8px',
                                borderRadius: 4,
                                display: 'flex',
                            }, children: [(0, jsx_runtime_1.jsx)("span", { style: { width: 36, color: '#64748B', userSelect: 'none' }, children: lineNum }), (0, jsx_runtime_1.jsx)("span", { children: line })] }, idx));
                    }) })] }) }));
};
exports.CodeScene = CodeScene;
