import type { MascotAnim, MascotEmotions } from "./types";

/** Higher = more urgent. Locomotion is soft; reactions win. */
export const ANIM_PRIORITY: Record<MascotAnim, number> = {
  sleep: 1,
  idle: 2,
  walk: 3,
  think: 4,
  wave: 6,
  happy: 7,
  surprised: 8,
};

export type AnimRequest = {
  anim: MascotAnim;
  /** ms to hold before auto-release (0 = until replaced) */
  holdMs?: number;
  force?: boolean;
};

export function canInterrupt(current: MascotAnim, next: MascotAnim, force?: boolean): boolean {
  if (force) return true;
  return ANIM_PRIORITY[next] >= ANIM_PRIORITY[current];
}

/**
 * Soft policy: what the body wants when nothing forced is playing.
 * Emotion → preferred base anim (before wander target sets walk).
 */
export function preferredAmbient(emotions: MascotEmotions, hasTarget: boolean): MascotAnim {
  if (emotions.sleepiness > 0.72 && emotions.energy < 0.35) return "sleep";
  if (hasTarget) return "walk";
  if (emotions.curiosity > 0.7 && emotions.boredom > 0.45) return "think";
  if (emotions.boredom > 0.65) return "think";
  return "idle";
}

export function shouldWake(emotions: MascotEmotions, interacted: boolean): boolean {
  if (interacted) return true;
  return emotions.sleepiness < 0.45 || emotions.attention > 0.6;
}
