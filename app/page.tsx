import { AnimeGrid } from "@/components/AnimeGrid";
import { fetchDiscover } from "@/lib/anilist";

export const dynamic = "force-dynamic";

function greeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { icon: "🌅", text: "Good morning — ready for a new arc?" };
  if (hour >= 12 && hour < 17) return { icon: "☀️", text: "Good afternoon — what’s on the queue?" };
  if (hour >= 17 && hour < 21) return { icon: "🌆", text: "Good evening — perfect time for a binge." };
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
            Mood-based recommendations and a late-night broadcast console —
            rebuilt in Next.js, one sprint at a time. Sprint 1 wires the
            foundation and live trending data.
          </p>
        </div>
      </section>

      <section className="container" id="trending" style={{ paddingBottom: 48 }}>
        <div className="section-head">
          <h2>
            <span className="accent">🔥</span> Trending now
          </h2>
          <span className="meta">
            {error ? "—" : `${items.length} shown · ${total.toLocaleString()} in catalog`}
          </span>
        </div>

        {error ? (
          <div className="state-box error">
            <p>Could not load trending titles.</p>
            <p style={{ marginTop: 8, fontSize: "0.85rem", opacity: 0.85 }}>{error}</p>
          </div>
        ) : (
          <AnimeGrid items={items} />
        )}
      </section>
    </main>
  );
}
