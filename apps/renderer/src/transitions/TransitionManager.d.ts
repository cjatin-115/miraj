import React from 'react';
import { TimelineTransition } from '@miraaj/timeline';
interface TransitionWrapperProps {
    transition?: TimelineTransition;
    frameInScene: number;
    durationInFrames: number;
    children: React.ReactNode;
}
export declare const TransitionWrapper: React.FC<TransitionWrapperProps>;
export {};
