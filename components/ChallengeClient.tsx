"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Anime } from "@/lib/types";
import {
  challengePrompt,
  checkChallenge,
  type ChallengeKind,
} from "@/lib/tools";

const KINDS: ChallengeKind[] = ["score", "year", "format"];

export function ChallengeClient() {
  const [anime, setAnime] = useState<Anime | null>(null);
  const [kind, setKind] = useState<ChallengeKind>("score");
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState<"ok" | "no" | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    setResult(null);
    setGuess("");
    try {
      const res = await fetch("/api/challenge-pool");
      if (!res.ok) throw new Error("Could not load challenge pool");
      const json = (await res.json()) as { data: Anime[] };
      const pool = json.data || [];
      if (!pool.length) throw new Error("Empty pool");
      const pick = pool[Math.floor(Math.random() * pool.length)];
      const k = KINDS[Math.floor(Math.random() * KINDS.length)];
      setAnime(pick);
      setKind(k);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Load failed");
      setAnime(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!anime) return;
    const ok = checkChallenge(kind, anime, guess);
    setResult(ok ? "ok" : "no");
    setStreak((s) => (ok ? s + 1 : 0));
  }

  const prompt = anime ? challengePrompt(anime, kind) : null;

  return (
    <div className="tools-panel">
      {err ? (
        <div className="state-box error">
          <p>{err}</p>
          <button type="button" className="btn btn-outline btn-sm" onClick={load}>
            Retry
          </button>
        </div>
      ) : loading || !anime || !prompt ? (
        <div className="state-box">
          <div className="spinner" />
          <p>Tuning the challenge…</p>
        </div>
      ) : (
        <>
          <div className="challenge-hero">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={anime.image} alt="" />
            <div>
              <p className="daily-kicker">Streak {streak}</p>
              <h2 className="challenge-q">{prompt.question}</h2>
              <p className="tools-hint" style={{ marginTop: 8 }}>
                Cover is a hint. No looking it up — pure signal memory.
              </p>
            </div>
          </div>

          {result === null ? (
            <form className="challenge-form" onSubmit={submit}>
              <input
                className="filter-input"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder={
                  kind === "score"
                    ? "e.g. 8.5"
                    : kind === "year"
                      ? "e.g. 2013"
                      : "e.g. TV"
                }
                autoFocus
              />
              <button type="submit" className="btn btn-accent btn-sm">
                Lock in
              </button>
            </form>
          ) : (
            <div className="challenge-result">
              <p className={result === "ok" ? "ok" : "no"}>
                {result === "ok"
                  ? "Correct frequency."
                  : `Off-channel. Answer: ${prompt.answer}`}
              </p>
              <div className="daily-actions">
                <Link
                  href={`/anime/${anime.id}`}
                  className="btn btn-outline btn-sm"
                >
                  Open detail
                </Link>
                <button
                  type="button"
                  className="btn btn-accent btn-sm"
                  onClick={load}
                >
                  Next challenge
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
