import { create } from "zustand";
import type { MascotAnim, MascotEmotions, MascotEvent } from "./types";
import { clampToHabitat, randomWanderTarget, type NavTarget } from "./navigation";

type MascotState = {
  enabled: boolean;
  anim: MascotAnim;
  /** Locomotion locked while celebrating */
  busyUntil: number;
  emotions: MascotEmotions;
  lastInteractionAt: number;
  position: NavTarget;
  target: NavTarget | null;
  setEnabled: (v: boolean) => void;
  setAnim: (a: MascotAnim) => void;
  setPosition: (p: NavTarget) => void;
  setTarget: (t: NavTarget | null) => void;
  bumpEmotion: (key: keyof MascotEmotions, delta: number) => void;
  dispatch: (e: MascotEvent) => void;
  requestWander: () => void;
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

export const useMascotStore = create<MascotState>((set, get) => ({
  enabled: true,
  anim: "idle",
  busyUntil: 0,
  emotions: defaultEmotions(),
  lastInteractionAt: Date.now(),
  position: { x: 0, z: 0 },
  target: null,
  setEnabled: (v) => set({ enabled: v }),
  setAnim: (a) => set({ anim: a }),
  setPosition: (p) => set({ position: p }),
  setTarget: (t) => set({ target: t }),
  bumpEmotion: (key, delta) =>
    set((s) => ({
      emotions: {
        ...s.emotions,
        [key]: clamp(s.emotions[key] + delta),
      },
    })),
  requestWander: () => {
    const { busyUntil, anim } = get();
    if (Date.now() < busyUntil) return;
    if (anim === "happy" || anim === "wave" || anim === "sleep") return;
    const t = randomWanderTarget();
    set({ target: t, anim: "walk" });
  },
  dispatch: (e) => {
    const { bumpEmotion, setAnim } = get();
    set({ lastInteractionAt: Date.now() });
    switch (e.type) {
      case "click":
      case "pet":
        bumpEmotion("happiness", 0.12);
        bumpEmotion("attention", 0.15);
        bumpEmotion("boredom", -0.1);
        set({
          anim: "happy",
          target: null,
          busyUntil: Date.now() + 1300,
        });
        window.setTimeout(() => {
          if (get().anim === "happy") setAnim("idle");
        }, 1200);
        break;
      case "seal":
      case "complete":
        bumpEmotion("happiness", 0.2);
        bumpEmotion("energy", 0.1);
        set({
          anim: "happy",
          target: null,
          busyUntil: Date.now() + 2200,
        });
        window.setTimeout(() => {
          if (get().anim === "happy") setAnim("wave");
          window.setTimeout(() => {
            if (get().anim === "wave") setAnim("idle");
          }, 900);
        }, 1000);
        break;
      case "go-to": {
        const t = clampToHabitat(e.x, e.z);
        set({ target: t, anim: "walk" });
        break;
      }
      case "idle-long":
        bumpEmotion("sleepiness", 0.08);
        bumpEmotion("boredom", 0.06);
        if (get().emotions.sleepiness > 0.7 && get().anim === "idle") {
          setAnim("sleep");
        }
        break;
      case "route":
        bumpEmotion("curiosity", 0.05);
        // Peek: short walk toward front of stage
        if (Date.now() > get().busyUntil) {
          set({
            target: clampToHabitat(0, 0.15),
            anim: "walk",
          });
        }
        break;
      default:
        break;
    }
  },
}));

export function mascotNotify(e: MascotEvent) {
  if (typeof window === "undefined") return;
  useMascotStore.getState().dispatch(e);
}
