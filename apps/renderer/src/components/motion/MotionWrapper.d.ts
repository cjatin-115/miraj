import React from 'react';
export type MotionType = 'none' | 'zoom' | 'slide' | 'blur' | 'scale' | 'mask_reveal' | 'camera_move';
interface Props {
    motion?: MotionType;
    durationInFrames: number;
    children: React.ReactNode;
}
export declare const MotionWrapper: React.FC<Props>;
export {};
