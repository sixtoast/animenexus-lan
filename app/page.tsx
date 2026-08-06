import Link from "next/link";
import { AnimeGrid } from "@/components/AnimeGrid";
import { HeroGreeting } from "@/components/HeroGreeting";
import { QuoteBanner } from "@/components/QuoteBanner";
import { ViewModeToggle } from "@/components/ViewModeToggle";
import { MoodChips } from "@/components/MoodChips";
import { HomeDashboard } from "@/components/HomeDashboard";
import { RitualLine } from "@/components/RitualLine";
import { fetchDiscover } from "@/lib/anilist";
import "./mood-home.css";

export const dynamic = "force-dynamic";

export default async function HomePage() {
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
          <HeroGreeting />
          <div className="hero-badge">Lantern · late-night console</div>
          <h1>
            AnimeNexus <span>Lantern</span>
          </h1>
          <p>
            Pick a mood — or browse the full catalog with filters and search.
            Your watchlist stays local to this browser.
          </p>
          <RitualLine />
          <div className="mood-home-block">
            <p className="mood-home-label">How are you feeling?</p>
            <MoodChips />
          </div>
          <p
            style={{
              marginTop: 18,
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <Link href="/browse" className="btn btn-outline btn-sm">
              Browse →
            </Link>
            <Link href="/seasonal" className="btn btn-outline btn-sm">
              Seasonal
            </Link>
            <Link href="/daily" className="btn btn-accent btn-sm">
              Daily pick
            </Link>
          </p>
        </div>
      </section>

      <section
        className="container"
        id="trending"
        style={{ paddingBottom: 48 }}
      >
        <div style={{ marginBottom: 24 }}>
          <HomeDashboard trending={items} />
        </div>
        <QuoteBanner />
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 12,
          }}
        >
          <ViewModeToggle />
        </div>
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
