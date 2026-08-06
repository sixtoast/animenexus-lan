import Link from "next/link";
import "./tools.css";

export const metadata = {
  title: "Tools · AnimeNexus",
  description: "Compare, fusion, challenge, sauce, and Night Desk.",
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
  {
    href: "/tools/sauce",
    emoji: "🔍",
    title: "Sauce",
    blurb: "Trace a screenshot to its episode via trace.moe.",
  },
  {
    href: "/tools/oracle",
    emoji: "🕯️",
    title: "Night Desk",
    blurb: "Local oracle — finish, queue, or mood from your list.",
  },
];

export default function ToolsHubPage() {
  return (
    <main>
      <section className="hero" style={{ paddingBottom: 12 }}>
        <div className="container">
          <div className="hero-badge">Playful tools · Sprint 10</div>
          <h1>
            Desk <span>toys</span>
          </h1>
          <p>
            Compare, fuse, challenge, find sauce, or ask the Night Desk — no
            cloud LLM required.
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
