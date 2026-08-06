import Link from "next/link";
import "./tools.css";

export const metadata = {
  title: "Tools · AnimeNexus",
  description: "Compare, fusion, radar, oracle, stats, and more desk tools.",
};

const TOOLS = [
  { href: "/tools/compare", emoji: "⚖️", title: "Compare", blurb: "Two titles side by side." },
  { href: "/tools/fusion", emoji: "🧬", title: "Fusion", blurb: "Blend two signals + catalog children." },
  { href: "/tools/dislike", emoji: "🙅", title: "Dislike reverse", blurb: "Opposite genre space." },
  { href: "/tools/completionist", emoji: "✅", title: "Completionist", blurb: "Finish Watching, rank Planning." },
  { href: "/tools/radar", emoji: "📡", title: "Radar", blurb: "Upcoming scanner + prefs." },
  { href: "/tools/stats", emoji: "📊", title: "Stats", blurb: "Watchlist analytics." },
  { href: "/tools/challenge", emoji: "🎯", title: "Challenge", blurb: "Silhouette daily MCQ." },
  { href: "/tools/sauce", emoji: "🔍", title: "Sauce", blurb: "trace.moe screenshot search." },
  { href: "/tools/oracle", emoji: "🕯️", title: "Night Desk", blurb: "Local + cloud oracle." },
  { href: "/airing", emoji: "📺", title: "Airing", blurb: "Schedule + releasing now." },
];

export default function ToolsHubPage() {
  return (
    <main>
      <section className="hero" style={{ paddingBottom: 12 }}>
        <div className="container">
          <div className="hero-badge">Desk tools · Sprint I</div>
          <h1>
            Desk <span>tools</span>
          </h1>
          <p>Fusion, radar, stats, silhouette challenge, oracle, airing.</p>
        </div>
      </section>
      <section className="container" style={{ paddingBottom: 48 }}>
        <div className="tools-hub">
          {TOOLS.map((t) => (
            <Link key={t.href} href={t.href} className="tools-hub-card">
              <span className="tools-hub-emoji">{t.emoji}</span>
              <h2>{t.title}</h2>
              <p>{t.blurb}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
