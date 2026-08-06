"use client";

import type { Anime, WatchStatus } from "@/lib/types";
import { useWatchlist } from "@/components/WatchlistProvider";
import { useToast } from "@/components/ToastProvider";

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

function sealLantern() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("animenexus:lantern-pulse"));
}

export function AddToWatchlist({ anime }: Props) {
  const { ready, getEntry, add, remove, setStatus } = useWatchlist();
  const { showToast } = useToast();
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
          onClick={() => {
            add(anime, "planning");
            showToast("Sealed to your list", "🕯️", true);
            sealLantern();
          }}
        >
          + Add to watchlist
        </button>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => {
            add(anime, "watching");
            showToast("Now watching", "▶", true);
            sealLantern();
          }}
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
        onClick={() => {
          remove(anime.id);
          showToast("Removed from list", "·");
        }}
      >
        Remove
      </button>
    </div>
  );
}
