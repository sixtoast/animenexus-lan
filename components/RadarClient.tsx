"use client";

import { useMemo } from "react";
import { useWatchlist } from "@/components/WatchlistProvider";
import { genreHeatmap } from "@/lib/taste";

export function RadarClient() {
  const { entries, ready } = useWatchlist();

  const heat = useMemo(() => genreHeatmap(entries), [entries]);
  const max = Math.max(...heat.map((h) => h.count), 1);

  if (!ready) {
    return (
      <div className="state-box">
        <div className="spinner" />
      </div>
    );
  }

  if (heat.length === 0) {
    return (
      <div className="state-box">
        <p>
          Genre radar needs titles with genres — add from Browse/Detail so tags
          attach.
        </p>
      </div>
    );
  }

  const top = heat.slice(0, 12);

  return (
    <div>
      <p className="tools-hint" style={{ marginBottom: 16 }}>
        Preference intensity from list genres.
      </p>
      <div className="radar-bars">
        {top.map((h) => (
          <div key={h.genre} className="radar-row">
            <div className="radar-label">{h.genre}</div>
            <div className="taste-bar-track">
              <div
                className="taste-bar-fill"
                style={{ width: `${(h.count / max) * 100}%` }}
              />
            </div>
            <div className="radar-count">{h.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
