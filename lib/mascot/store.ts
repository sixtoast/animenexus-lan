import { create } from "zustand";
import type { MascotAnim, MascotEmotions, MascotEvent } from "./types";

type MascotState = {
  enabled: boolean;
  anim: MascotAnim;
  emotions: MascotEmotions;
  lastInteractionAt: number;
  setEnabled: (v: boolean) => void;
  setAnim: (a: MascotAnim) => void;
  bumpEmotion: (key: keyof MascotEmotions, delta: number) => void;
  dispatch: (e: MascotEvent) => void;
};

const clamp = (n: number) => Math.max(0, Math.min(1, n));

const defaultEmotions = (): MascotEmotions => ({
  curiosity: 0.55,
  energy: 0.6,
  happiness: 0.55,
  boredom: 0.2,
  sleepiness: 0.15,
  attention: 0.5,
});

/**
 * Mascot Engine store — UI and rec engines stay separate.
 * Milestone 1: anim + light emotion bumps only.
 */
export const useMascotStore = create<MascotState>((set, get) => ({
  enabled: true,
  anim: "idle",
  emotions: defaultEmotions(),
  lastInteractionAt: Date.now(),
  setEnabled: (v) => set({ enabled: v }),
  setAnim: (a) => set({ anim: a }),
  bumpEmotion: (key, delta) =>
    set((s) => ({
      emotions: {
        ...s.emotions,
        [key]: clamp(s.emotions[key] + delta),
      },
    })),
  dispatch: (e) => {
    const { bumpEmotion, setAnim } = get();
    set({ lastInteractionAt: Date.now() });
    switch (e.type) {
      case "click":
      case "pet":
        bumpEmotion("happiness", 0.12);
        bumpEmotion("attention", 0.15);
        bumpEmotion("boredom", -0.1);
        setAnim("happy");
        window.setTimeout(() => {
          if (get().anim === "happy") setAnim("idle");
        }, 1200);
        break;
      case "seal":
      case "complete":
        bumpEmotion("happiness", 0.2);
        bumpEmotion("energy", 0.1);
        setAnim("happy");
        window.setTimeout(() => {
          if (get().anim === "happy") setAnim("wave");
          window.setTimeout(() => {
            if (get().anim === "wave") setAnim("idle");
          }, 900);
        }, 1000);
        break;
      case "idle-long":
        bumpEmotion("sleepiness", 0.08);
        bumpEmotion("boredom", 0.06);
        break;
      case "route":
        bumpEmotion("curiosity", 0.05);
        break;
      default:
        break;
    }
  },
}));

/** Fire from outside React (seal/complete hooks) */
export function mascotNotify(e: MascotEvent) {
  if (typeof window === "undefined") return;
  useMascotStore.getState().dispatch(e);
}
