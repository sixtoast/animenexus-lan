"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useWatchlist } from "@/components/WatchlistProvider";
import { consultOracle } from "@/lib/oracle";
import {
  consultOracleCloud,
  ORACLE_MODES,
  parseVibecastPicks,
  type OracleMode,
  type VibecastPick,
} from "@/lib/oracle-cloud";
import { isAIConfigured } from "@/lib/ai-settings";
import { useToast } from "@/components/ToastProvider";
import type { Anime } from "@/lib/types";

type ResolvedPick = VibecastPick & {
  anime?: Anime | null;
};

export function OracleClient() {
  const { entries, ready } = useWatchlist();
  const { showToast } = useToast();
  const [seed, setSeed] = useState(0);
  const [mode, setMode] = useState<OracleMode>("pick");
  const [note, setNote] = useState("");
  const [cloudText, setCloudText] = useState<string | null>(null);
  const [vibeCards, setVibeCards] = useState<ResolvedPick[]>([]);
  const [busy, setBusy] = useState(false);
  const [useCloud, setUseCloud] = useState(false);

  const local = useMemo(() => {
    void seed;
    return consultOracle(entries);
  }, [entries, seed]);

  async function resolvePick(p: VibecastPick): Promise<ResolvedPick> {
    const fromList = entries.find(
      (e) => e.title.toLowerCase() === p.title.toLowerCase(),
    );
    if (fromList) {
      return {
        ...p,
        anime: {
          id: fromList.id,
          title: fromList.title,
          image: fromList.image,
          description: "",
          genre: "",
          tags: fromList.genres || [],
          status: "FINISHED",
          format: fromList.format || "",
          year: fromList.year || "",
          score: fromList.score || 0,
          popularity: 0,
          anilist_id: fromList.id,
          episodes: fromList.episodes || "",
          duration: fromList.duration || 24,
        },
      };
    }
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(p.title)}&perPage=1`,
      );
      const j = await res.json();
      const hit = (j.data || [])[0] as Anime | undefined;
      return { ...p, anime: hit || null };
    } catch {
      return { ...p, anime: null };
    }
  }

  async function runCloud() {
    if (!isAIConfigured()) {
      showToast("Add an API key in the AI panel (🤖)", "🤖");
      return;
    }
    setBusy(true);
    setCloudText(null);
    setVibeCards([]);
    try {
      const text = await consultOracleCloud(mode, entries, note || undefined);
      setUseCloud(true);
      if (mode === "vibecast") {
        const picks = parseVibecastPicks(text);
        if (picks.length) {
          const resolved = await Promise.all(picks.map(resolvePick));
          setVibeCards(resolved);
          setCloudText(null);
        } else {
          setCloudText(text);
        }
      } else {
        setCloudText(text);
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Oracle failed", "😅");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return (
      <div className="state-box">
        <div className="spinner" />
        <p>Opening the desk…</p>
      </div>
    );
  }

  return (
    <div className="oracle">
      <div className="feed-tabs" role="tablist" aria-label="Oracle modes">
        {ORACLE_MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            className={"feed-tab" + (mode === m.id ? " active" : "")}
            onClick={() => setMode(m.id)}
            title={m.blurb}
          >
            {m.label}
          </button>
        ))}
      </div>

      <label className="filter-label" htmlFor="oracle-note">
        Optional note
      </label>
      <input
        id="oracle-note"
        className="filter-input"
        style={{ maxWidth: "100%", marginBottom: 12 }}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="e.g. only 45 minutes free"
      />

      <div className="daily-actions" style={{ marginBottom: 16 }}>
        <button
          type="button"
          className="btn btn-accent btn-sm"
          disabled={busy}
          onClick={runCloud}
        >
          {busy ? "Consulting…" : "Ask Night Desk (cloud)"}
        </button>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => {
            setUseCloud(false);
            setVibeCards([]);
            setCloudText(null);
            setSeed((s) => s + 1);
          }}
        >
          Local reading
        </button>
      </div>

      {useCloud && vibeCards.length > 0 ? (
        <div className="vibe-cards">
          <p className="detail-kicker">Cloud · vibecast</p>
          {vibeCards.map((c, i) => {
            const href = c.anime?.id
              ? `/anime/${c.anime.id}`
              : `/browse?q=${encodeURIComponent(c.title)}`;
            return (
              <Link key={`${c.title}-${i}`} href={href} className="vibe-card">
                {c.anime?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.anime.image} alt="" />
                ) : (
                  <div className="vibe-card-ph" />
                )}
                <div>
                  <div className="vibe-card-title">{c.title}</div>
                  <div className="vibe-card-why">{c.why}</div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : useCloud && cloudText ? (
        <article className="oracle-card">
          <p className="detail-kicker">Cloud · {mode}</p>
          <div className="oracle-body" style={{ whiteSpace: "pre-wrap" }}>
            {cloudText}
          </div>
        </article>
      ) : (
        <article className="oracle-card">
          <p className="detail-kicker">On-device</p>
          <h2 className="oracle-headline">{local.headline}</h2>
          <p className="oracle-body">{local.body}</p>
          {local.moodSlug ? (
            <p style={{ marginTop: 16 }}>
              <Link
                href={`/mood/${local.moodSlug}`}
                className="btn btn-outline btn-sm"
              >
                Mood: {local.moodLabel} →
              </Link>
            </p>
          ) : null}
        </article>
      )}

      <p className="taste-footnote" style={{ marginTop: 20 }}>
        Cloud modes need a key in the 🤖 AI panel. Keys stay in localStorage as{" "}
        <code>anime_nexus_ai_settings</code>.
      </p>
    </div>
  );
}
