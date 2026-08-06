"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useWatchlist } from "@/components/WatchlistProvider";
import { touchStreak, readStreak } from "@/lib/streak";
import { useToast } from "@/components/ToastProvider";
import type { Anime } from "@/lib/types";

type Props = {
  trending: Anime[];
};

export function HomeDashboard({ trending }: Props) {
  const { entries, ready } = useWatchlist();
  const { showToast } = useToast();
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const { state, milestone } = touchStreak();
    setStreak(state.count);
    if (milestone) {
      showToast(`${state.count}-day listening streak`, "🎧");
    } else {
      setStreak(readStreak().count);
    }
  }, [showToast]);

  const continueList = useMemo(() => {
    return entries
      .filter(
        (e) =>
          e.watchStatus === "watching" ||
          (e.watchStatus === "paused" && e.progress > 0),
      )
      .slice(0, 12);
  }, [entries]);

  const counts = useMemo(() => {
    const c = { watching: 0, planning: 0, completed: 0 };
    for (const e of entries) {
      if (e.watchStatus in c) c[e.watchStatus as keyof typeof c]++;
    }
    return c;
  }, [entries]);

  return (
    <div className="home-dash">
      <div className="home-stat-chips">
        <div className="home-chip">
          <strong>{ready ? counts.watching : "—"}</strong>
          <span>Watching</span>
        </div>
        <div className="home-chip">
          <strong>{ready ? counts.planning : "—"}</strong>
          <span>Planning</span>
        </div>
        <div className="home-chip">
          <strong>{ready ? counts.completed : "—"}</strong>
          <span>Done</span>
        </div>
        <div className="home-chip accent">
          <strong>{streak}</strong>
          <span>Streak</span>
        </div>
      </div>

      <div className="home-cta-row">
        <Link href="/browse" className="btn btn-accent btn-sm">
          Recommend / browse
        </Link>
        <Link href="/daily" className="btn btn-outline btn-sm">
          Daily pick
        </Link>
        <Link href="/seasonal" className="btn btn-outline btn-sm">
          Seasonal
        </Link>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() =>
            window.dispatchEvent(new CustomEvent("animenexus:tonight"))
          }
        >
          Tonight
        </button>
      </div>

      {continueList.length > 0 ? (
        <section className="home-rail-section">
          <div className="home-rail-head">
            <h2>Continue</h2>
            <Link href="/watchlist">Watchlist →</Link>
          </div>
          <div className="home-rail">
            {continueList.map((e) => (
              <Link
                key={e.id}
                href={`/anime/${e.id}`}
                className="home-rail-card"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={e.image} alt="" />
                <div className="hrc-body">
                  <div className="hrc-title">{e.title}</div>
                  <div className="hrc-meta">
                    Ep {e.progress}
                    {e.episodes ? ` / ${e.episodes}` : ""}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {trending.length > 0 ? (
        <section className="home-rail-section">
          <div className="home-rail-head">
            <h2>Trending</h2>
            <Link href="/browse">See all →</Link>
          </div>
          <div className="home-rail">
            {trending.slice(0, 12).map((a) => (
              <Link
                key={a.id}
                href={`/anime/${a.id}`}
                className="home-rail-card"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.image} alt="" />
                <div className="hrc-body">
                  <div className="hrc-title">{a.title}</div>
                  <div className="hrc-meta">
                    {a.score ? `★ ${a.score.toFixed(1)}` : a.format}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
