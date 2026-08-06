"use client";

import Link from "next/link";
import { useWatchlist } from "@/components/WatchlistProvider";
import { TasteExtras } from "@/components/TasteExtras";
import { computeTaste, statusLabel } from "@/lib/taste";
import type { WatchStatus } from "@/lib/types";

const STATUS_ORDER: WatchStatus[] = [
  "watching",
  "planning",
  "completed",
  "paused",
  "dropped",
];

export function TasteClient() {
  const { entries, ready } = useWatchlist();

  if (!ready) {
    return (
      <div className="state-box">
        <div className="spinner" />
        <p>Reading your list…</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="state-box">
        <p>No data yet — your taste profile fills as the watchlist grows.</p>
        <p style={{ marginTop: 12 }}>
          <Link href="/browse" className="btn btn-accent btn-sm">
            Browse catalog
          </Link>{" "}
          <Link href="/account" className="btn btn-outline btn-sm">
            Sync AniList
          </Link>
        </p>
      </div>
    );
  }

  const s = computeTaste(entries);
  const maxStatus = Math.max(...STATUS_ORDER.map((k) => s.byStatus[k]), 1);
  const maxFormat = Math.max(...s.byFormat.map((f) => f.count), 1);
  const top = s.topRated[0];
  const decadeLead = s.byDecade[0];
  const portraitLine = [
    s.total >= 50 ? "Deep catalog" : s.total >= 20 ? "Growing shelf" : "Early signal",
    s.completionRate >= 0.5 ? "finisher" : "explorer",
    decadeLead ? `${decadeLead.decade}s lean` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="taste">
      <div className="taste-portrait">
        <p className="taste-portrait-kicker">Taste portrait</p>
        <h2 className="taste-portrait-title">{portraitLine}</h2>
        <p className="taste-portrait-body">
          {s.hoursLogged} hours on the desk · {s.episodesLogged} episodes tracked
          {s.avgUserRating != null
            ? ` · avg score ${s.avgUserRating.toFixed(1)}`
            : ""}
          {top ? ` · peak: ${top.title}` : ""}
        </p>
        {top ? (
          <Link href={`/anime/${top.id}`} className="taste-portrait-peak">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={top.image} alt="" />
            <span>Highest rated on your list</span>
          </Link>
        ) : null}
      </div>

      <div className="taste-grid">
        <div className="taste-stat">
          <div className="taste-stat-value">{s.total}</div>
          <div className="taste-stat-label">Titles on list</div>
        </div>
        <div className="taste-stat">
          <div className="taste-stat-value">{s.hoursLogged}</div>
          <div className="taste-stat-label">Hours logged (progress)</div>
        </div>
        <div className="taste-stat">
          <div className="taste-stat-value">{s.episodesLogged}</div>
          <div className="taste-stat-label">Episodes tracked</div>
        </div>
        <div className="taste-stat">
          <div className="taste-stat-value">
            {s.avgUserRating != null ? s.avgUserRating.toFixed(1) : "—"}
          </div>
          <div className="taste-stat-label">
            Avg your score{s.ratedCount ? ` (${s.ratedCount})` : ""}
          </div>
        </div>
        <div className="taste-stat">
          <div className="taste-stat-value">
            {s.avgCommunityScore != null ? s.avgCommunityScore.toFixed(1) : "—"}
          </div>
          <div className="taste-stat-label">Avg community score</div>
        </div>
        <div className="taste-stat">
          <div className="taste-stat-value">
            {Math.round(s.completionRate * 100)}%
          </div>
          <div className="taste-stat-label">Completion rate</div>
        </div>
      </div>

      <section className="taste-section">
        <h2>Status breakdown</h2>
        <ul className="taste-bars">
          {STATUS_ORDER.map((st) => {
            const n = s.byStatus[st];
            const pct = (n / maxStatus) * 100;
            return (
              <li key={st}>
                <div className="taste-bar-label">
                  <span>{statusLabel(st)}</span>
                  <span>{n}</span>
                </div>
                <div className="taste-bar-track">
                  <div
                    className="taste-bar-fill"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {s.byFormat.length > 0 ? (
        <section className="taste-section">
          <h2>Formats</h2>
          <ul className="taste-bars">
            {s.byFormat.slice(0, 8).map((f) => (
              <li key={f.format}>
                <div className="taste-bar-label">
                  <span>{f.format}</span>
                  <span>{f.count}</span>
                </div>
                <div className="taste-bar-track">
                  <div
                    className="taste-bar-fill accent"
                    style={{ width: `${(f.count / maxFormat) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {s.byDecade.length > 0 ? (
        <section className="taste-section">
          <h2>By decade</h2>
          <div className="taste-chips">
            {s.byDecade.map((d) => (
              <span key={d.decade} className="taste-chip">
                {d.decade} · {d.count}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {s.topRated.length > 0 ? (
        <section className="taste-section">
          <h2>Your highest scores</h2>
          <ul className="taste-list">
            {s.topRated.map((e) => (
              <li key={e.id}>
                <Link href={`/anime/${e.id}`} className="taste-list-link">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={e.image} alt="" />
                  <span className="taste-list-title">{e.title}</span>
                  <span className="taste-list-score">{e.userRating}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {s.recentlyUpdated.length > 0 ? (
        <section className="taste-section">
          <h2>Recently updated</h2>
          <ul className="taste-list">
            {s.recentlyUpdated.map((e) => (
              <li key={e.id}>
                <Link href={`/anime/${e.id}`} className="taste-list-link">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={e.image} alt="" />
                  <span className="taste-list-title">{e.title}</span>
                  <span className="taste-list-meta">
                    {statusLabel(e.watchStatus)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <TasteExtras />

      <p className="taste-footnote">
        Hours use progress × episode length (default 24 min). Completed hours
        use full episode count when known. Stats stay on this device.
      </p>
    </div>
  );
}
