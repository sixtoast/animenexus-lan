/**
 * Sprint 2 — Decision layer
 *
 * Event → Thought → Decision → Emotion deltas → Action (anim/goal)
 * Personality shapes every step; store only executes the plan.
 */

import {
  COMPANION,
  dayPart,
  genreAffinity,
  reactToEvent,
  reactToGenres,
  routineBias,
  type ReactionIntent,
} from "./personality";
import { planReaction, type ReactionPlan } from "./reactions";
import type { MascotAnim, MascotEmotions } from "./types";
import type { MascotGoal } from "./behaviour";

export type Thought = {
  /** Internal monologue (for debug / future speech) */
  text: string;
  confidence: number;
};

export type Decision = {
  intent: ReactionIntent;
  thought: Thought;
  plan: ReactionPlan;
  /** Optional goal override (e.g. nap, wander) */
  goal?: MascotGoal;
  /** Optional navigate toward UI */
  seekUi?: boolean;
};

export type DecisionContext = {
  emotions: MascotEmotions;
  msSinceInteract: number;
  genres?: string[];
  path?: string;
  modalOpen?: boolean;
};

function think(
  event: string,
  intent: ReactionIntent,
  ctx: DecisionContext,
): Thought {
  const name = COMPANION.shortName;
  const shy = COMPANION.traits.shyness;

  switch (intent) {
    case "hide":
      return {
        text: "Too sharp… I’ll stay by the corner.",
        confidence: 0.9,
      };
    case "blush":
      return {
        text: "Oh— soft one. Nice.",
        confidence: 0.7,
      };
    case "pilot":
      return {
        text: "Mecha… if I were bigger I’d climb in.",
        confidence: 0.55,
      };
    case "celebrate":
      return {
        text: "You finished it. That matters.",
        confidence: 0.85,
      };
    case "curious":
      return {
        text: "Maybe they’ll like this signal.",
        confidence: 0.65 + ctx.emotions.curiosity * 0.2,
      };
    case "point":
      return {
        text: "Here— look.",
        confidence: 0.7,
      };
    case "shy_wave":
      return {
        text: shy > 0.5 ? "…thanks." : "Hey.",
        confidence: 0.6,
      };
    case "trust":
      return {
        text: "Okay. I needed that.",
        confidence: 0.8,
      };
    case "nap":
      return {
        text: "Desk is quiet. Dim the light.",
        confidence: 0.75,
      };
    case "stretch":
      return {
        text: "Stretch— then look again.",
        confidence: 0.5,
      };
    case "complain":
      return {
        text: "Careful…",
        confidence: 0.7,
      };
    default:
      return {
        text: `${name} watches.`,
        confidence: 0.4,
      };
  }
}

/**
 * Core pipeline for discrete events.
 */
export function decide(
  event:
    | "pet"
    | "drag"
    | "seal"
    | "complete"
    | "search"
    | "idle-long"
    | "modal-open"
    | "route"
    | "genres",
  ctx: DecisionContext,
): Decision {
  let intent: ReactionIntent = "neutral";

  if (event === "genres" && ctx.genres?.length) {
    intent = reactToGenres(ctx.genres);
  } else if (event !== "genres") {
    intent = reactToEvent(event);
  }

  // Personality modulation: high stress + shy → prefer hide/ponder over celebrate noise
  if (
    ctx.emotions.stress > 0.65 &&
    COMPANION.traits.shyness > 0.5 &&
    intent === "celebrate"
  ) {
    intent = "shy_wave";
  }

  const thought = think(event, intent, ctx);
  const plan = planReaction(intent);

  let goal: MascotGoal | undefined;
  let seekUi = false;

  if (intent === "nap") goal = "nap";
  if (intent === "curious" || intent === "point") {
    seekUi = true;
    goal = "wander";
  }
  if (intent === "celebrate") goal = "celebrate";
  if (intent === "hide") goal = "ponder";

  // Routine: late night dampens seek-ui energy
  const r = routineBias(dayPart());
  if (r.preferNap && seekUi && ctx.emotions.energy < 0.35) {
    seekUi = false;
    goal = "nap";
    intent = "nap";
  }

  return {
    intent: seekUi && intent === "nap" ? "nap" : intent,
    thought,
    plan: intent === "nap" ? planReaction("nap") : plan,
    goal,
    seekUi,
  };
}

/** Ambient decision when nothing urgent is happening */
export function decideAmbient(ctx: DecisionContext): Decision | null {
  const r = routineBias(dayPart());
  const e = ctx.emotions;

  if (e.sleepiness > 0.7 && e.energy < 0.4) {
    return decide("idle-long", ctx);
  }
  if (ctx.msSinceInteract > 55_000 && e.attention < 0.35) {
    const intent: ReactionIntent = "shy_wave";
    return {
      intent,
      thought: {
        text: "Still here. Want a signal?",
        confidence: 0.55,
      },
      plan: planReaction(intent),
      goal: "seek-attention",
      seekUi: false,
    };
  }
  if (r.preferExplore && e.curiosity > 0.55 && e.boredom > 0.4) {
    return {
      intent: "curious",
      thought: {
        text: "Maybe something on the desk…",
        confidence: 0.5,
      },
      plan: planReaction("curious"),
      goal: "wander",
      seekUi: true,
    };
  }
  return null;
}

/** Helper for browse/search pages */
export function decideFromGenreLabels(labels: string[], ctx: DecisionContext): Decision {
  return decide("genres", { ...ctx, genres: labels });
}

export function affinitySummary(labels: string[]): number {
  if (!labels.length) return 0;
  return labels.reduce((s, g) => s + genreAffinity(g), 0) / labels.length;
}
