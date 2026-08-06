/** Mascot Engine — shared types (extensible for later milestones) */

export type MascotAnim =
  | "idle"
  | "happy"
  | "wave"
  | "think"
  | "sleep"
  | "surprised";

export type MascotEmotions = {
  curiosity: number;
  energy: number;
  happiness: number;
  boredom: number;
  sleepiness: number;
  attention: number;
};

export type MascotEvent =
  | { type: "pet" }
  | { type: "click" }
  | { type: "seal" }
  | { type: "complete" }
  | { type: "route"; path: string }
  | { type: "idle-long" };
