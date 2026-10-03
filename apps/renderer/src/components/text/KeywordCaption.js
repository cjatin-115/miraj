"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeywordCaption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const style_system_1 = require("@miraaj/style-system");
const KeywordCaption = ({ props }) => {
    const { keywords = [], layout = 'stacked', animation = 'pop', } = props;
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    const style = style_system_1.modernCreatorV1;
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            width: '100%',
            height: '100%',
            backgroundColor: '#07090E',
            display: 'flex',
            flexDirection: layout === 'stacked' ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
            padding: style.safeAreas.left,
            position: 'relative',
            overflow: 'hidden',
        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    width: 600,
                    height: 600,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255, 230, 0, 0.15) 0%, transparent 70%)',
                    pointerEvents: 'none',
                } }), keywords.map((kw, idx) => {
                // Stagger entrance of each keyword by 4 frames
                const delay = idx * 5;
                const localFrame = Math.max(0, frame - delay);
                const popSpring = (0, remotion_1.spring)({
                    frame: localFrame,
                    fps,
                    config: { damping: 11, stiffness: 160 },
                });
                const scale = (0, remotion_1.interpolate)(popSpring, [0, 1], [0.6, kw.scale || 1.0]);
                const opacity = (0, remotion_1.interpolate)(popSpring, [0, 1], [0, 1]);
                const color = kw.color || (kw.highlight ? '#FFE600' : '#FFFFFF');
                return ((0, jsx_runtime_1.jsx)("div", { style: {
                        transform: `scale(${scale})`,
                        opacity,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px 36px',
                        borderRadius: 24,
                        backgroundColor: kw.highlight ? 'rgba(255, 230, 0, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                        border: kw.highlight ? '3px solid #FFE600' : '1px solid rgba(255, 255, 255, 0.15)',
                        boxShadow: kw.highlight ? '0 0 35px rgba(255, 230, 0, 0.3)' : 'none',
                    }, children: (0, jsx_runtime_1.jsx)("span", { style: {
                            fontFamily: style.typography.fontFamilyHeading,
                            fontSize: 68,
                            fontWeight: 900,
                            color,
                            textTransform: 'uppercase',
                            letterSpacing: '-0.02em',
                            textShadow: '0 4px 20px rgba(0,0,0,0.8)',
                        }, children: kw.text }) }, idx));
            })] }));
};
exports.KeywordCaption = KeywordCaption;
