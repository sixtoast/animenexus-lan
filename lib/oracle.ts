import type { WatchlistEntry } from "./types";
import { MOODS } from "./moods";

export type OracleReading = {
  headline: string;
  body: string;
  moodSlug?: string;
  moodLabel?: string;
};

/** Local Night Desk oracle — no external LLM */
export function consultOracle(entries: WatchlistEntry[]): OracleReading {
  const n = entries.length;
  if (n === 0) {
    return {
      headline: "The desk is quiet",
      body: "Your list is empty. Open Browse or Seasonal, add a few titles, then return — the signal needs something to reflect.",
      moodSlug: "chill",
      moodLabel: "Chill",
    };
  }

  const watching = entries.filter((e) => e.watchStatus === "watching");
  const planning = entries.filter((e) => e.watchStatus === "planning");
  const completed = entries.filter((e) => e.watchStatus === "completed");
  const hours =
    entries.reduce((sum, e) => {
      const dur = e.duration && e.duration > 0 ? e.duration : 24;
      return sum + Math.max(0, e.progress || 0) * dur;
    }, 0) / 60;

  if (watching.length > 0) {
    const top = [...watching].sort((a, b) => b.progress - a.progress)[0];
    return {
      headline: "Finish the current arc",
      body: `You’re mid-frequency on “${top.title}” (${top.progress} ep logged). The desk says: one more session before opening a new channel. You’ve tracked ~${hours.toFixed(1)} hours total.`,
      moodSlug: "hype",
      moodLabel: "Hype",
    };
  }

  if (planning.length >= 3) {
    const pick =
      planning[Math.floor(Math.random() * Math.min(planning.length, 5))];
    return {
      headline: "The queue is stacking",
      body: `${planning.length} titles wait in Planning. Tonight’s draw from the stack: “${pick.title}”. Move it to Watching and log the first episode.`,
      moodSlug: "chill",
      moodLabel: "Chill",
    };
  }

  if (completed.length > 0 && planning.length === 0) {
    const mood = MOODS[Math.floor(Math.random() * MOODS.length)];
    return {
      headline: "Between seasons",
      body: `You’ve closed ${completed.length} titles. Try a mood feed — ${mood.emoji} ${mood.label}: ${mood.blurb}`,
      moodSlug: mood.slug,
      moodLabel: mood.label,
    };
  }

  const rated = entries.filter((e) => e.userRating > 0);
  if (rated.length > 0) {
    const avg = rated.reduce((s, e) => s + e.userRating, 0) / rated.length;
    return {
      headline: "Your calibration",
      body: `Across ${rated.length} rated titles your average is ${avg.toFixed(1)}. ${
        avg >= 8
          ? "You run a high bar — Masterpiece mood may fit."
          : avg >= 6
            ? "Balanced palate — mix Hype and Chill."
            : "You’re open to experiments — try Mind-bender or Spooky."
      }`,
      moodSlug: avg >= 8 ? "masterpiece" : "mind",
      moodLabel: avg >= 8 ? "Masterpiece" : "Mind-bender",
    };
  }

  return {
    headline: "Keep the lantern lit",
    body: `${n} titles on the list · ~${hours.toFixed(1)} hours logged. Add progress or scores on Watchlist so the desk can read you more clearly.`,
    moodSlug: "fantasy",
    moodLabel: "Fantasy",
  };
}
