import Link from "next/link";
import "./tools.css";

export const metadata = {
  title: "Tools · AnimeNexus",
  description: "Compare, fusion, and challenge — playful desk tools.",
};

const TOOLS = [
  {
    href: "/tools/compare",
    emoji: "⚖️",
    title: "Compare",
    blurb: "Two titles, side by side — scores, formats, shared genres.",
  },
  {
    href: "/tools/fusion",
    emoji: "🧬",
    title: "Fusion",
    blurb: "Blend two signals and read a playful compatibility score.",
  },
  {
    href: "/tools/challenge",
    emoji: "🎯",
    title: "Challenge",
    blurb: "Guess score, year, or format from a popular cover.",
  },
];

export default function ToolsHubPage() {
  return (
    <main>
      <section className="hero" style={{ paddingBottom: 12 }}>
        <div className="container">
          <div className="hero-badge">Playful tools · Sprint 9</div>
          <h1>
            Desk <span>toys</span>
          </h1>
          <p>
            Compare charts, fuse vibes, or run a quick memory challenge — no
            account required.
          </p>
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
