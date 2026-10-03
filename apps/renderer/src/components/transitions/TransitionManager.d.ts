import React from 'react';
import { TimelineTransition } from '@miraaj/timeline';
interface Props {
    transition?: TimelineTransition;
    durationInFrames: number;
    children: React.ReactNode;
}
export declare const TransitionManager: React.FC<Props>;
export {};
