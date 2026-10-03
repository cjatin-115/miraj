import { Timeline, TimelineScene } from './types.js';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export function validateTimeline(timeline: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (!timeline || typeof timeline !== 'object') {
    return { valid: false, errors: [{ field: 'root', message: 'Timeline must be an object' }] };
  }

  const t = timeline as Partial<Timeline>;

  if (t.version !== 1) {
    errors.push({ field: 'version', message: 'Timeline version must be 1' });
  }

  if (typeof t.width !== 'number' || t.width <= 0) {
    errors.push({ field: 'width', message: 'Width must be a positive number' });
  }

  if (typeof t.height !== 'number' || t.height <= 0) {
    errors.push({ field: 'height', message: 'Height must be a positive number' });
  }

  if (typeof t.fps !== 'number' || ![24, 25, 30, 60].includes(t.fps)) {
    errors.push({ field: 'fps', message: 'FPS must be one of: 24, 25, 30, 60' });
  }

  if (typeof t.durationInFrames !== 'number' || t.durationInFrames <= 0) {
    errors.push({ field: 'durationInFrames', message: 'durationInFrames must be greater than 0' });
  }

  if (!t.styleId || typeof t.styleId !== 'string') {
    errors.push({ field: 'styleId', message: 'styleId is required' });
  }

  if (!Array.isArray(t.scenes)) {
    errors.push({ field: 'scenes', message: 'scenes must be an array' });
  } else {
    // Validate scenes continuity
    let previousEndFrame = 0;
    t.scenes.forEach((scene: TimelineScene, index: number) => {
      if (!scene.id) {
        errors.push({ field: `scenes[${index}].id`, message: 'Scene ID is required' });
      }
      if (typeof scene.startFrame !== 'number' || scene.startFrame < 0) {
        errors.push({ field: `scenes[${index}].startFrame`, message: 'startFrame must be non-negative' });
      }
      if (typeof scene.durationInFrames !== 'number' || scene.durationInFrames <= 0) {
        errors.push({ field: `scenes[${index}].durationInFrames`, message: 'durationInFrames must be positive' });
      }

      // Check transition boundaries
      if (scene.transitionIn && scene.transitionIn.durationInFrames > scene.durationInFrames) {
        errors.push({
          field: `scenes[${index}].transitionIn`,
          message: 'transitionIn duration cannot exceed scene duration',
        });
      }

      previousEndFrame = Math.max(previousEndFrame, (scene.startFrame || 0) + (scene.durationInFrames || 0));
    });

    if (t.durationInFrames && previousEndFrame > t.durationInFrames) {
      errors.push({
        field: 'durationInFrames',
        message: `Total scenes duration (${previousEndFrame} frames) exceeds timeline duration (${t.durationInFrames} frames)`,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
