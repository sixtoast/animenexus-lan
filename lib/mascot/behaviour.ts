import type { MascotEmotions } from "./types";

export type MascotGoal =
  | "idle"
  | "wander"
  | "nap"
  | "ponder"
  | "seek-attention"
  | "celebrate";

export type BehaviourDecision = {
  goal: MascotGoal;
  reason: string;
  cooldownMs: number;
};

export function chooseBehaviour(
  emotions: MascotEmotions,
  opts: {
    msSinceInteract: number;
    currentGoal: MascotGoal;
    busy: boolean;
  },
): BehaviourDecision | null {
  if (opts.busy) return null;

  const {
    curiosity,
    energy,
    happiness,
    boredom,
    sleepiness,
    attention,
    confidence,
    stress,
  } = emotions;

  if (sleepiness > 0.75 && energy < 0.4) {
    return {
      goal: "nap",
      reason: "sleepiness high, energy low",
      cooldownMs: 12_000,
    };
  }

  if (stress > 0.7) {
    return {
      goal: "ponder",
      reason: "stressed — settle",
      cooldownMs: 8_000,
    };
  }

  if (opts.msSinceInteract > 50_000 && attention < 0.35) {
    return {
      goal: "seek-attention",
      reason: "user quiet, attention low",
      cooldownMs: 8_000,
    };
  }

  if (boredom > 0.55 && curiosity > 0.45 && confidence > 0.35) {
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
    return {
      goal: "idle",
      reason: "content after interaction",
      cooldownMs: 6_000,
    };
  }

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
