"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaptionsTrack = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const style_system_1 = require("@miraaj/style-system");
const CaptionsTrack = ({ overlays = [] }) => {
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    const style = style_system_1.modernCreatorV1;
    // Find active caption overlay at current frame
    const captionOverlays = overlays.filter((o) => o.type === 'caption');
    const activeOverlay = captionOverlays.find((o) => frame >= o.startFrame && frame < o.startFrame + o.durationInFrames);
    if (!activeOverlay)
        return null;
    const words = activeOverlay.props?.words || [];
    if (words.length === 0)
        return null;
    const activeWordIndex = words.findIndex((w) => frame >= w.startFrame && frame <= w.endFrame);
    const windowSize = 4;
    const pivot = activeWordIndex >= 0 ? activeWordIndex : 0;
    const chunkStart = Math.floor(pivot / windowSize) * windowSize;
    const currentChunk = words.slice(chunkStart, chunkStart + windowSize);
    return ((0, jsx_runtime_1.jsx)("div", { style: {
            position: 'absolute',
            bottom: style.safeAreas.bottom + 24,
            left: style.safeAreas.left,
            right: style.safeAreas.right,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 90,
            pointerEvents: 'none',
        }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                display: 'inline-flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                padding: '12px 28px',
                borderRadius: 24,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.75)',
            }, children: currentChunk.map((item, idx) => {
                const globalIdx = chunkStart + idx;
                const isActive = globalIdx === activeWordIndex;
                const popSpring = isActive
                    ? (0, remotion_1.spring)({
                        frame: frame - item.startFrame,
                        fps,
                        config: { damping: 12, stiffness: 180 },
                    })
                    : 1.0;
                return ((0, jsx_runtime_1.jsx)("span", { style: {
                        fontFamily: style.typography.fontFamilyCaption,
                        fontSize: 44,
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        letterSpacing: '0.02em',
                        color: isActive
                            ? '#FFE600'
                            : item.highlight
                                ? '#FFFFFF'
                                : 'rgba(255, 255, 255, 0.7)',
                        transform: isActive ? `scale(${1 + 0.12 * popSpring})` : 'scale(1)',
                        display: 'inline-block',
                        textShadow: isActive
                            ? '0 0 20px rgba(255, 230, 0, 0.5), 0 4px 12px rgba(0,0,0,0.9)'
                            : '0 2px 8px rgba(0, 0, 0, 0.9)',
                    }, children: item.word }, `${item.word}-${globalIdx}`));
            }) }) }));
};
exports.CaptionsTrack = CaptionsTrack;
