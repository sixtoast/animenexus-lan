"use client";

import type { Anime, WatchStatus } from "@/lib/types";
import { useWatchlist } from "@/components/WatchlistProvider";

const STATUSES: { value: WatchStatus; label: string }[] = [
  { value: "planning", label: "Planning" },
  { value: "watching", label: "Watching" },
  { value: "completed", label: "Completed" },
  { value: "paused", label: "Paused" },
  { value: "dropped", label: "Dropped" },
];

type Props = {
  anime: Anime;
};

export function AddToWatchlist({ anime }: Props) {
  const { ready, getEntry, add, remove, setStatus } = useWatchlist();
  const entry = getEntry(anime.id);

  if (!ready) {
    return (
      <button type="button" className="btn btn-outline btn-sm" disabled>
        …
      </button>
    );
  }

  if (!entry) {
    return (
      <div className="wl-actions">
        <button
          type="button"
          className="btn btn-accent btn-sm"
          onClick={() => add(anime, "planning")}
        >
          + Add to watchlist
        </button>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => add(anime, "watching")}
        >
          Start watching
        </button>
      </div>
    );
  }

  return (
    <div className="wl-actions">
      <label className="wl-status-label">
        <span className="filter-label">List status</span>
        <select
          className="filter-input"
          value={entry.watchStatus}
          onChange={(e) => setStatus(anime.id, e.target.value as WatchStatus)}
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className="btn btn-outline btn-sm"
        onClick={() => remove(anime.id)}
      >
        Remove
      </button>
    </div>
  );
}
