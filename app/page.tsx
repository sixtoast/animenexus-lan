import Link from "next/link";
import { AnimeGrid } from "@/components/AnimeGrid";
import { MoodChips } from "@/components/MoodChips";
import { fetchDiscover } from "@/lib/anilist";
import "./mood-home.css";

export const dynamic = "force-dynamic";

function greeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12)
    return { icon: "🌅", text: "Good morning — ready for a new arc?" };
  if (hour >= 12 && hour < 17)
    return { icon: "☀️", text: "Good afternoon — what’s on the queue?" };
  if (hour >= 17 && hour < 21)
    return { icon: "🌆", text: "Good evening — perfect time for a binge." };
  return { icon: "🌙", text: "Still tuned — the night signal is clear." };
}

export default async function HomePage() {
  const g = greeting();
  let error: string | null = null;
  let items: Awaited<ReturnType<typeof fetchDiscover>>["data"] = [];
  let total = 0;

  try {
    const page = await fetchDiscover("trending", 1, 24, "exclude");
    items = page.data;
    total = page.pagination.total;
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to reach AniList";
  }

  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="hero-badge">
            <span>{g.icon}</span>
            <span>{g.text}</span>
          </div>
          <h1>
            AnimeNexus <span>Lantern</span>
          </h1>
          <p>
            Pick a mood — or browse the full catalog with filters and search.
            Your watchlist stays local to this browser.
          </p>
          <div className="mood-home-block">
            <p className="mood-home-label">How are you feeling?</p>
            <MoodChips />
          </div>
          <p style={{ marginTop: 18 }}>
            <Link href="/browse" className="btn btn-outline btn-sm">
              Open browse →
            </Link>
          </p>
        </div>
      </section>

      <section className="container" id="trending" style={{ paddingBottom: 48 }}>
        <div className="section-head">
          <h2>
            <span className="accent">🔥</span> Trending now
          </h2>
          <span className="meta">
            {error
              ? "—"
              : `${items.length} shown · ${total.toLocaleString()} in catalog`}
          </span>
        </div>

        {error ? (
          <div className="state-box error">
            <p>Could not load trending titles.</p>
            <p style={{ marginTop: 8, fontSize: "0.85rem", opacity: 0.85 }}>
              {error}
            </p>
          </div>
        ) : (
          <AnimeGrid items={items} />
        )}
      </section>
    </main>
  );
}
