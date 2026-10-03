export * from './types.js';
export * from './themes/modern_creator_v1.js';

import { StyleConfig } from './types.js';
import { modernCreatorV1 } from './themes/modern_creator_v1.js';

export const STYLE_REGISTRY: Record<string, StyleConfig> = {
  modern_creator_v1: modernCreatorV1,
};

export function getStyleConfig(id: string): StyleConfig {
  const config = STYLE_REGISTRY[id];
  if (!config) {
    console.warn(`[style-system] Style '${id}' not found, falling back to 'modern_creator_v1'`);
    return modernCreatorV1;
  }
  return config;
}
