"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeBlock = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const style_system_1 = require("@miraaj/style-system");
const CodeBlock = ({ props }) => {
    const { code = '', language = 'python', filename = 'pipeline.py', highlightLines = [2, 3], } = props;
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    const style = style_system_1.modernCreatorV1;
    const enterSpring = (0, remotion_1.spring)({
        frame,
        fps,
        config: { damping: 14, stiffness: 120 },
    });
    const cardY = (0, remotion_1.interpolate)(enterSpring, [0, 1], [40, 0]);
    const lines = code.trim().split('\n');
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            width: '100%',
            height: '100%',
            backgroundColor: '#07090E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 48,
            position: 'relative',
            overflow: 'hidden',
        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    width: 700,
                    height: 700,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, transparent 65%)',
                    pointerEvents: 'none',
                } }), (0, jsx_runtime_1.jsxs)("div", { style: {
                    width: '100%',
                    maxWidth: 960,
                    borderRadius: 28,
                    backgroundColor: '#0D1117',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(6, 182, 212, 0.15)',
                    overflow: 'hidden',
                    transform: `translateY(${cardY}px)`,
                }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                            height: 56,
                            backgroundColor: '#161B22',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0 24px',
                        }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'center', gap: 10 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { width: 14, height: 14, borderRadius: '50%', backgroundColor: '#FF5F56' } }), (0, jsx_runtime_1.jsx)("div", { style: { width: 14, height: 14, borderRadius: '50%', backgroundColor: '#FFBD2E' } }), (0, jsx_runtime_1.jsx)("div", { style: { width: 14, height: 14, borderRadius: '50%', backgroundColor: '#27C93F' } })] }), (0, jsx_runtime_1.jsx)("div", { style: {
                                    fontFamily: style.typography.fontFamilyMono,
                                    fontSize: 18,
                                    color: '#8B949E',
                                    fontWeight: 600,
                                }, children: filename }), (0, jsx_runtime_1.jsx)("div", { style: {
                                    padding: '4px 12px',
                                    borderRadius: 8,
                                    backgroundColor: 'rgba(6, 182, 212, 0.15)',
                                    border: '1px solid rgba(6, 182, 212, 0.3)',
                                    color: '#06B6D4',
                                    fontFamily: style.typography.fontFamilyMono,
                                    fontSize: 14,
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                }, children: language })] }), (0, jsx_runtime_1.jsx)("div", { style: {
                            padding: '32px 28px',
                            fontFamily: style.typography.fontFamilyMono,
                            fontSize: 24,
                            lineHeight: 1.6,
                        }, children: lines.map((line, idx) => {
                            const lineNum = idx + 1;
                            const isHighlighted = highlightLines.includes(lineNum);
                            return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '4px 12px',
                                    borderRadius: 8,
                                    backgroundColor: isHighlighted ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                                    borderLeft: isHighlighted ? '3px solid #06B6D4' : '3px solid transparent',
                                }, children: [(0, jsx_runtime_1.jsx)("span", { style: {
                                            width: 44,
                                            color: isHighlighted ? '#06B6D4' : '#484F58',
                                            userSelect: 'none',
                                            fontSize: 20,
                                            fontWeight: 600,
                                        }, children: lineNum }), (0, jsx_runtime_1.jsx)("span", { style: {
                                            color: isHighlighted ? '#FFFFFF' : '#C9D1D9',
                                            fontWeight: isHighlighted ? 600 : 400,
                                        }, children: line })] }, idx));
                        }) })] })] }));
};
exports.CodeBlock = CodeBlock;
