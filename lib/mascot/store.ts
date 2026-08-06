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
import { chooseBehaviour, type MascotGoal } from "./behaviour";
import {
  decayEmotions as decayFn,
  defaultEmotions,
  motionFromEmotions,
  type MotionProfile,
} from "./emotions";
import { screenToHabitatTarget } from "./ui-registry";

type MascotState = {
  enabled: boolean;
  anim: MascotAnim;
  goal: MascotGoal;
  busyUntil: number;
  nextThinkAt: number;
  emotions: MascotEmotions;
  lastInteractionAt: number;
  position: NavTarget;
  target: NavTarget | null;
  lookBias: { x: number; y: number };
  setEnabled: (v: boolean) => void;
  setAnim: (a: MascotAnim) => void;
  requestAnim: (req: AnimRequest) => boolean;
  setPosition: (p: NavTarget) => void;
  setTarget: (t: NavTarget | null) => void;
  bumpEmotion: (key: keyof MascotEmotions, delta: number) => void;
  decayEmotions: (dtSec: number) => void;
  motionProfile: () => MotionProfile;
  dispatch: (e: MascotEvent) => void;
  requestWander: () => void;
  applyGoal: (goal: MascotGoal) => void;
  runBehaviourTick: () => void;
};

const clamp = (n: number) => Math.max(0, Math.min(1, n));

export const useMascotStore = create<MascotState>((set, get) => ({
  enabled: true,
  anim: "idle",
  goal: "idle",
  busyUntil: 0,
  nextThinkAt: 0,
  emotions: defaultEmotions(),
  lastInteractionAt: Date.now(),
  position: { x: 0, z: 0 },
  target: null,
  lookBias: { x: 0, y: 0 },
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
    set((s) => ({ emotions: decayFn(s.emotions, dtSec) }));
  },
  motionProfile: () => motionFromEmotions(get().emotions),
  applyGoal: (goal) => {
    const { requestAnim, anim } = get();
    set({ goal });
    switch (goal) {
      case "wander": {
        const t = randomWanderTarget();
        set({ target: t });
        requestAnim({ anim: "walk" });
        break;
      }
      case "nap":
        set({ target: null });
        requestAnim({ anim: "sleep" });
        break;
      case "ponder":
        set({ target: null });
        requestAnim({ anim: "think", holdMs: 5000 });
        break;
      case "seek-attention":
        set({ target: clampToHabitat(0, 0.18) });
        requestAnim({ anim: "walk", force: true });
        window.setTimeout(() => {
          if (get().goal === "seek-attention") {
            requestAnim({ anim: "wave", holdMs: 1200, force: true });
          }
        }, 900);
        break;
      case "celebrate":
        set({ target: null });
        requestAnim({ anim: "happy", holdMs: 1000, force: true });
        break;
      case "idle":
      default:
        if (anim === "walk" && !get().target) {
          requestAnim({ anim: "idle" });
        }
        break;
    }
  },
  runBehaviourTick: () => {
    const s = get();
    if (!s.enabled) return;
    if (Date.now() < s.nextThinkAt) return;
    const busy = Date.now() < s.busyUntil;
    const decision = chooseBehaviour(s.emotions, {
      msSinceInteract: Date.now() - s.lastInteractionAt,
      currentGoal: s.goal,
      busy,
    });
    if (!decision) {
      set({ nextThinkAt: Date.now() + 2000 });
      return;
    }
    if (decision.goal === s.goal && decision.goal !== "wander") {
      set({ nextThinkAt: Date.now() + decision.cooldownMs });
      return;
    }
    s.applyGoal(decision.goal);
    set({ nextThinkAt: Date.now() + decision.cooldownMs });
  },
  requestWander: () => {
    get().applyGoal("wander");
  },
  dispatch: (e) => {
    const { bumpEmotion, requestAnim, applyGoal } = get();

    switch (e.type) {
      case "tick": {
        const { busyUntil, anim, emotions } = get();
        if (Date.now() < busyUntil) break;
        if (
          anim === "happy" ||
          anim === "wave" ||
          anim === "surprised" ||
          anim === "point"
        )
          break;
        if (anim === "sleep") {
          if (shouldWake(emotions, false)) {
            requestAnim({ anim: "idle" });
            set({ goal: "idle" });
          }
          break;
        }
        get().runBehaviourTick();
        break;
      }
      case "notice-ui":
        bumpEmotion("curiosity", 0.06);
        bumpEmotion("attention", 0.04);
        if (get().emotions.curiosity > 0.5 && Date.now() > get().busyUntil) {
          requestAnim({ anim: "point", holdMs: 1400 });
        }
        break;
      case "ui-hover": {
        bumpEmotion("curiosity", 0.04);
        bumpEmotion("attention", 0.06);
        const hz = screenToHabitatTarget(e.clientX, e.clientY);
        const t = clampToHabitat(hz.x * 0.85, hz.z);
        set({
          lookBias: {
            x: (e.clientX / window.innerWidth - 0.5) * 2,
            y: (e.clientY / window.innerHeight - 0.5) * 2,
          },
        });
        if (Date.now() > get().busyUntil && Math.random() < 0.4) {
          set({ target: t, goal: "wander" });
          requestAnim({ anim: "walk" });
        } else {
          requestAnim({ anim: "point", holdMs: 900 });
        }
        break;
      }
      case "click":
      case "pet":
        set({ lastInteractionAt: Date.now(), goal: "celebrate" });
        bumpEmotion("happiness", 0.14);
        bumpEmotion("attention", 0.25);
        bumpEmotion("boredom", -0.2);
        bumpEmotion("sleepiness", -0.25);
        bumpEmotion("energy", 0.1);
        bumpEmotion("confidence", 0.08);
        bumpEmotion("stress", -0.12);
        set({ target: null });
        if (get().anim === "sleep") {
          requestAnim({ anim: "surprised", holdMs: 600, force: true });
          window.setTimeout(() => {
            requestAnim({ anim: "happy", holdMs: 1100, force: true });
          }, 500);
        } else {
          requestAnim({ anim: "happy", holdMs: 1200, force: true });
        }
        set({ nextThinkAt: Date.now() + 3000 });
        break;
      case "seal":
      case "complete":
        set({ lastInteractionAt: Date.now(), goal: "celebrate" });
        bumpEmotion("happiness", 0.24);
        bumpEmotion("energy", 0.14);
        bumpEmotion("confidence", 0.12);
        bumpEmotion("sleepiness", -0.15);
        bumpEmotion("stress", -0.1);
        set({ target: null });
        requestAnim({ anim: "happy", holdMs: 1000, force: true });
        window.setTimeout(() => {
          requestAnim({ anim: "wave", holdMs: 900, force: true });
        }, 950);
        set({ nextThinkAt: Date.now() + 4000 });
        break;
      case "go-to": {
        if (get().anim === "sleep") {
          requestAnim({ anim: "surprised", holdMs: 500, force: true });
        }
        const t = clampToHabitat(e.x, e.z);
        set({ target: t, goal: "wander" });
        requestAnim({ anim: "walk", force: true });
        bumpEmotion("curiosity", 0.05);
        break;
      }
      case "idle-long":
        bumpEmotion("sleepiness", 0.1);
        bumpEmotion("boredom", 0.08);
        bumpEmotion("energy", -0.05);
        bumpEmotion("stress", 0.03);
        set({ nextThinkAt: 0 });
        get().runBehaviourTick();
        break;
      case "route":
        set({ lastInteractionAt: Date.now() });
        bumpEmotion("curiosity", 0.1);
        bumpEmotion("attention", 0.12);
        bumpEmotion("sleepiness", -0.06);
        bumpEmotion("stress", 0.04);
        if (get().anim === "sleep") {
          requestAnim({ anim: "wave", holdMs: 800, force: true });
          set({ goal: "seek-attention" });
        } else if (Date.now() > get().busyUntil) {
          applyGoal("seek-attention");
        }
        set({ nextThinkAt: Date.now() + 5000 });
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
