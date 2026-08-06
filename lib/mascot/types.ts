/** Mascot Engine — shared types */

export type MascotAnim =
  | "idle"
  | "walk"
  | "happy"
  | "wave"
  | "think"
  | "sleep"
  | "surprised";

/** All internal drives (0–1). */
export type MascotEmotions = {
  curiosity: number;
  energy: number;
  happiness: number;
  boredom: number;
  sleepiness: number;
  attention: number;
  confidence: number;
  stress: number;
};

export type MascotEvent =
  | { type: "pet" }
  | { type: "click" }
  | { type: "seal" }
  | { type: "complete" }
  | { type: "route"; path: string }
  | { type: "idle-long" }
  | { type: "go-to"; x: number; z: number }
  | { type: "tick" };

export const HABITAT_BOUNDS = {
  minX: -0.55,
  maxX: 0.55,
  minZ: -0.25,
  maxZ: 0.25,
} as const;
