import { create } from "zustand";
import type { MascotAnim, MascotEmotions, MascotEvent } from "./types";
import {
  clampToHabitat,
  randomWanderTarget,
  type NavTarget,
} from "./navigation";
import {
  canInterrupt,
  preferredAmbient,
  shouldWake,
  type AnimRequest,
} from "./anim-machine";

type MascotState = {
  enabled: boolean;
  anim: MascotAnim;
  busyUntil: number;
  emotions: MascotEmotions;
  lastInteractionAt: number;
  position: NavTarget;
  target: NavTarget | null;
  setEnabled: (v: boolean) => void;
  setAnim: (a: MascotAnim) => void;
  requestAnim: (req: AnimRequest) => boolean;
  setPosition: (p: NavTarget) => void;
  setTarget: (t: NavTarget | null) => void;
  bumpEmotion: (key: keyof MascotEmotions, delta: number) => void;
  decayEmotions: (dtSec: number) => void;
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
  requestAnim: (req) => {
    const { anim, busyUntil } = get();
    if (Date.now() < busyUntil && !req.force) return false;
    if (!canInterrupt(anim, req.anim, req.force)) return false;
    set({
      anim: req.anim,
      busyUntil: req.holdMs ? Date.now() + req.holdMs : get().busyUntil,
    });
    if (req.holdMs) {
      const token = req.anim;
      window.setTimeout(() => {
        if (get().anim === token) {
          const ambient = preferredAmbient(get().emotions, !!get().target);
          set({ anim: ambient });
        }
      }, req.holdMs);
    }
    return true;
  },
  setPosition: (p) => set({ position: p }),
  setTarget: (t) => set({ target: t }),
  bumpEmotion: (key, delta) =>
    set((s) => ({
      emotions: {
        ...s.emotions,
        [key]: clamp(s.emotions[key] + delta),
      },
    })),
  decayEmotions: (dtSec) => {
    set((s) => {
      const e = { ...s.emotions };
      // Slow drift toward baseline
      e.attention = clamp(e.attention - 0.01 * dtSec);
      e.boredom = clamp(e.boredom + 0.008 * dtSec);
      e.sleepiness = clamp(e.sleepiness + 0.006 * dtSec);
      e.energy = clamp(e.energy - 0.004 * dtSec);
      e.happiness = clamp(e.happiness - 0.003 * dtSec);
      return { emotions: e };
    });
  },
  requestWander: () => {
    const { busyUntil, anim, requestAnim } = get();
    if (Date.now() < busyUntil) return;
    if (anim === "happy" || anim === "wave" || anim === "surprised") return;
    if (anim === "sleep") return;
    const t = randomWanderTarget();
    set({ target: t });
    requestAnim({ anim: "walk" });
  },
  dispatch: (e) => {
    const { bumpEmotion, requestAnim, emotions } = get();

    switch (e.type) {
      case "tick": {
        // Ambient transition when not busy
        const { busyUntil, target, anim } = get();
        if (Date.now() < busyUntil) break;
        if (anim === "happy" || anim === "wave" || anim === "surprised") break;
        if (anim === "sleep") {
          if (shouldWake(emotions, false)) {
            requestAnim({ anim: "idle" });
          }
          break;
        }
        const want = preferredAmbient(get().emotions, !!target);
        if (want !== anim && want !== "walk") {
          requestAnim({ anim: want });
        }
        break;
      }
      case "click":
      case "pet":
        set({ lastInteractionAt: Date.now() });
        bumpEmotion("happiness", 0.12);
        bumpEmotion("attention", 0.2);
        bumpEmotion("boredom", -0.15);
        bumpEmotion("sleepiness", -0.2);
        bumpEmotion("energy", 0.08);
        set({ target: null });
        if (get().anim === "sleep") {
          requestAnim({ anim: "surprised", holdMs: 600, force: true });
          window.setTimeout(() => {
            requestAnim({ anim: "happy", holdMs: 1100, force: true });
          }, 500);
        } else {
          requestAnim({ anim: "happy", holdMs: 1200, force: true });
        }
        break;
      case "seal":
      case "complete":
        set({ lastInteractionAt: Date.now() });
        bumpEmotion("happiness", 0.22);
        bumpEmotion("energy", 0.12);
        bumpEmotion("sleepiness", -0.15);
        set({ target: null });
        requestAnim({ anim: "happy", holdMs: 1000, force: true });
        window.setTimeout(() => {
          requestAnim({ anim: "wave", holdMs: 900, force: true });
        }, 950);
        break;
      case "go-to": {
        if (get().anim === "sleep") {
          requestAnim({ anim: "surprised", holdMs: 500, force: true });
        }
        const t = clampToHabitat(e.x, e.z);
        set({ target: t });
        requestAnim({ anim: "walk", force: true });
        break;
      }
      case "idle-long":
        bumpEmotion("sleepiness", 0.1);
        bumpEmotion("boredom", 0.08);
        bumpEmotion("energy", -0.05);
        if (get().emotions.sleepiness > 0.7) {
          set({ target: null });
          requestAnim({ anim: "sleep" });
        } else if (get().emotions.boredom > 0.55) {
          requestAnim({ anim: "think", holdMs: 4000 });
        }
        break;
      case "route":
        set({ lastInteractionAt: Date.now() });
        bumpEmotion("curiosity", 0.08);
        bumpEmotion("attention", 0.1);
        bumpEmotion("sleepiness", -0.05);
        if (get().anim === "sleep") {
          requestAnim({ anim: "wave", holdMs: 800, force: true });
        } else if (Date.now() > get().busyUntil) {
          set({ target: clampToHabitat(0, 0.15) });
          requestAnim({ anim: "walk" });
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
