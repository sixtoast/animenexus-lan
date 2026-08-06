import type { MascotEmotions } from "./types";

/**
 * High-level goals the companion pursues.
 * Emotion → Behaviour (goal) → Animation (handled by store/machine).
 */
export type MascotGoal =
  | "idle"
  | "wander"
  | "nap"
  | "ponder"
  | "seek-attention"
  | "celebrate";

export type BehaviourDecision = {
  goal: MascotGoal;
  /** Why this was chosen (debug / future speech) */
  reason: string;
  /** Suggested cooldown before re-evaluate (ms) */
  cooldownMs: number;
};

/**
 * Pure decision function — easy to unit-test and extend.
 * Does not mutate state; callers apply the goal.
 */
export function chooseBehaviour(
  emotions: MascotEmotions,
  opts: {
    msSinceInteract: number;
    currentGoal: MascotGoal;
    busy: boolean;
  },
): BehaviourDecision | null {
  if (opts.busy) return null;

  const { curiosity, energy, happiness, boredom, sleepiness, attention } =
    emotions;

  // Hard drives first
  if (sleepiness > 0.75 && energy < 0.4) {
    return {
      goal: "nap",
      reason: "sleepiness high, energy low",
      cooldownMs: 12_000,
    };
  }

  if (opts.msSinceInteract > 50_000 && attention < 0.35) {
    return {
      goal: "seek-attention",
      reason: "user quiet, attention low",
      cooldownMs: 8_000,
    };
  }

  if (boredom > 0.55 && curiosity > 0.45) {
    return {
      goal: "wander",
      reason: "bored but curious",
      cooldownMs: 5_000,
    };
  }

  if (boredom > 0.5 && energy < 0.45) {
    return {
      goal: "ponder",
      reason: "bored and low energy",
      cooldownMs: 7_000,
    };
  }

  if (energy > 0.65 && curiosity > 0.55 && opts.currentGoal !== "wander") {
    return {
      goal: "wander",
      reason: "energetic and curious",
      cooldownMs: 4_500,
    };
  }

  if (happiness > 0.75 && opts.msSinceInteract < 8_000) {
    // residual glow — stay soft idle, don't spam
    return {
      goal: "idle",
      reason: "content after interaction",
      cooldownMs: 6_000,
    };
  }

  // Default soft idle / light wander mix
  if (opts.currentGoal === "idle" && Math.random() < 0.4) {
    return {
      goal: "wander",
      reason: "ambient roam",
      cooldownMs: 6_000,
    };
  }

  return {
    goal: "idle",
    reason: "baseline",
    cooldownMs: 5_000,
  };
}
