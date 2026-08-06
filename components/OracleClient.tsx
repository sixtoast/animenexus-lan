"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useWatchlist } from "@/components/WatchlistProvider";
import { consultOracle } from "@/lib/oracle";

export function OracleClient() {
  const { entries, ready } = useWatchlist();
  const [seed, setSeed] = useState(0);

  const reading = useMemo(() => {
    void seed;
    return consultOracle(entries);
  }, [entries, seed]);

  if (!ready) {
    return (
      <div className="state-box">
        <div className="spinner" />
        <p>Warming the desk…</p>
      </div>
    );
  }

  return (
    <div className="oracle-card">
      <p className="daily-kicker">Night Desk · local oracle</p>
      <h2 className="oracle-headline">{reading.headline}</h2>
      <p className="oracle-body">{reading.body}</p>
      <div className="daily-actions">
        {reading.moodSlug ? (
          <Link
            href={`/mood/${reading.moodSlug}`}
            className="btn btn-accent btn-sm"
          >
            {reading.moodLabel || "Mood"} feed →
          </Link>
        ) : null}
        <Link href="/watchlist" className="btn btn-outline btn-sm">
          Watchlist
        </Link>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => setSeed((s) => s + 1)}
        >
          Ask again
        </button>
      </div>
      <p className="taste-footnote" style={{ marginTop: 20 }}>
        This oracle runs on-device from your watchlist — no cloud model, no API
        key. Sprint 10 keeps the desk honest.
      </p>
    </div>
  );
}
