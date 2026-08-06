import Link from "next/link";
import { RadarClient } from "@/components/RadarClient";
import "../tools.css";
import "../stats/stats.css";

export const metadata = {
  title: "Radar · AnimeNexus",
  description: "Scan upcoming / not-yet-released anime by genre and studio.",
};

export default function Page() {
  return (
    <main>
      <section className="hero" style={{ paddingBottom: 12 }}>
        <div className="container">
          <div className="hero-badge">
            <Link href="/tools">Tools</Link> · Radar
          </div>
          <h1>Radar</h1>
          <p>Upcoming titles from AniList — filter by genre or studio.</p>
        </div>
      </section>
      <section className="container" style={{ paddingBottom: 48 }}>
        <RadarClient />
      </section>
    </main>
  );
}
