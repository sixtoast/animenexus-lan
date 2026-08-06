import Link from "next/link";
import { fetchDailyPool } from "@/lib/anilist-discover";
import { dailySeed, pickIndex } from "@/lib/season";
import type { Metadata } from "next";
import "./daily.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Daily pick · AnimeNexus",
  description: "One title for today — stable until midnight.",
};

export default async function DailyPage() {
  const seed = dailySeed();
  const today = new Date();
  const dateLabel = today.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let error: string | null = null;
  let anime = null as Awaited<
    ReturnType<typeof fetchDailyPool>
  >[number] | null;

  try {
    const pool = await fetchDailyPool(48);
    if (pool.length) {
      anime = pool[pickIndex(seed, pool.length)] || null;
    }
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load daily pool";
  }

  return (
    <main>
      <section className="hero" style={{ paddingBottom: 12 }}>
        <div className="container">
          <div className="hero-badge">Daily pick · Sprint 8</div>
          <h1>
            Tonight’s <span>signal</span>
          </h1>
          <p>
            One title from a popular pool, locked for {dateLabel}. Same seed all
            day — refresh won’t change it.
          </p>
        </div>
      </section>

      <section className="container" style={{ paddingBottom: 48 }}>
        {error ? (
          <div className="state-box error">
            <p>{error}</p>
          </div>
        ) : !anime ? (
          <div className="state-box">
            <p>No pick available right now.</p>
          </div>
        ) : (
          <article className="daily-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="daily-cover" src={anime.image} alt="" />
            <div className="daily-body">
              <p className="daily-kicker">Seed {seed}</p>
              <h2 className="daily-title">{anime.title}</h2>
              {anime.titleNative ? (
                <p className="daily-native">{anime.titleNative}</p>
              ) : null}
              <div className="daily-meta">
                {anime.score > 0 ? (
                  <span className="detail-pill score">
                    ★ {anime.score.toFixed(1)}
                  </span>
                ) : null}
                <span className="detail-pill">{anime.format}</span>
                {anime.year ? (
                  <span className="detail-pill">{anime.year}</span>
                ) : null}
                {anime.tags.slice(0, 3).map((g) => (
                  <span key={g} className="detail-pill">
                    {g}
                  </span>
                ))}
              </div>
              <p className="daily-desc">
                {anime.description.slice(0, 320)}
                {anime.description.length > 320 ? "…" : ""}
              </p>
              <div className="daily-actions">
                <Link
                  href={`/anime/${anime.id}`}
                  className="btn btn-accent btn-sm"
                >
                  Open detail
                </Link>
                <Link href="/seasonal" className="btn btn-outline btn-sm">
                  Seasonal chart
                </Link>
                <Link href="/browse" className="btn btn-outline btn-sm">
                  Browse
                </Link>
              </div>
            </div>
          </article>
        )}
      </section>
    </main>
  );
}
