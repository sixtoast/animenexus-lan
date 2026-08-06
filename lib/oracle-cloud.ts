import type { WatchlistEntry } from "./types";
import { callChatCompletions } from "./ai-chat";
import { isAIConfigured } from "./ai-settings";

export type OracleMode =
  | "pick"
  | "whatif"
  | "letter"
  | "taste"
  | "marathon"
  | "vibecast";

export const ORACLE_MODES: { id: OracleMode; label: string; blurb: string }[] =
  [
    { id: "pick", label: "Pick", blurb: "What should I watch tonight?" },
    { id: "whatif", label: "What if", blurb: "Hypothetical rewatch path" },
    { id: "letter", label: "Letter", blurb: "A short letter from the desk" },
    { id: "taste", label: "Taste", blurb: "Read of your list personality" },
    { id: "marathon", label: "Marathon", blurb: "Weekend binge plan" },
    { id: "vibecast", label: "Vibe cast", blurb: "Three concrete title picks" },
  ];

function listDigest(entries: WatchlistEntry[]): string {
  return entries
    .slice(0, 40)
    .map(
      (e) =>
        `- ${e.title} [${e.watchStatus}] prog=${e.progress}` +
        (e.userRating ? ` rate=${e.userRating}` : "") +
        (e.genres?.length ? ` genres=${e.genres.slice(0, 4).join("/")}` : ""),
    )
    .join("\n");
}

function systemFor(mode: OracleMode): string {
  const base =
    "You are the Night Desk oracle for AnimeNexus Lantern — warm, concrete, late-night radio host energy. Never invent unlock codes or secret ARG mythology. Never invent titles that are not in the user's list unless clearly labeled as a catalog suggestion. Keep answers 120–220 words unless mode needs a short list.";
  const modes: Record<OracleMode, string> = {
    pick: base + " Mode: pick one thing to watch tonight from their list and say why.",
    whatif:
      base +
      " Mode: what-if — imagine a rewatch or alternate order of 2–3 titles they already have.",
    letter:
      base +
      " Mode: write a short personal letter addressed to the viewer about their list.",
    taste:
      base +
      " Mode: describe their taste personality from statuses, ratings, and genres.",
    marathon:
      base +
      " Mode: propose a realistic weekend marathon using titles they already track.",
    vibecast:
      base +
      " Mode: recommend exactly three concrete titles (prefer from their list) with one-line reasons each.",
  };
  return modes[mode];
}

export async function consultOracleCloud(
  mode: OracleMode,
  entries: WatchlistEntry[],
  userNote?: string,
): Promise<string> {
  if (!isAIConfigured()) {
    throw new Error("Add an API key in the AI panel first");
  }
  const digest =
    entries.length > 0
      ? listDigest(entries)
      : "(list empty — suggest how to start)";
  const user = [
    `Mode: ${mode}`,
    userNote ? `Viewer note: ${userNote}` : "",
    "Watchlist sample:",
    digest,
  ]
    .filter(Boolean)
    .join("\n");

  return callChatCompletions(
    [
      { role: "system", content: systemFor(mode) },
      { role: "user", content: user },
    ],
    { temperature: 0.8 },
  );
}

export async function runAIColdOpen(title: string, synopsis: string) {
  return callChatCompletions(
    [
      {
        role: "system",
        content:
          "Write a cold open — 2–4 sentences of atmospheric, spoiler-light narration that could start a review or video essay. No lists.",
      },
      {
        role: "user",
        content: `Title: ${title}\nSynopsis: ${synopsis.slice(0, 600)}`,
      },
    ],
    { temperature: 0.85 },
  );
}

export async function runAIWatchOrder(
  title: string,
  relationsSummary: string,
) {
  return callChatCompletions(
    [
      {
        role: "system",
        content:
          "Propose a practical watch order. Prefer official/ chronological clarity. Bullet list, short reasons. Admit uncertainty.",
      },
      {
        role: "user",
        content: `Main title: ${title}\nRelations:\n${relationsSummary || "none listed"}`,
      },
    ],
    { temperature: 0.5 },
  );
}

export async function runAIFitCheck(
  title: string,
  genres: string[],
  listDigest: string,
) {
  return callChatCompletions(
    [
      {
        role: "system",
        content:
          "Fit check: will this viewer enjoy the title based on their list? Answer with Fit / Maybe / Skip and 3 short reasons.",
      },
      {
        role: "user",
        content: `Candidate: ${title}\nGenres: ${genres.join(", ") || "unknown"}\nTheir list:\n${listDigest || "(empty)"}`,
      },
    ],
    { temperature: 0.6 },
  );
}
