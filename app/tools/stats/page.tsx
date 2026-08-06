import Link from "next/link";
import { StatsClient } from "@/components/StatsClient";
import "../tools.css";
import "./stats.css";

export const metadata = {
  title: "Stats · AnimeNexus",
  description: "Watchlist analytics — counts, hours, scores, genres.",
};

export default function StatsPage() {
  return (
    <main>
      <section className="hero" style={{ paddingBottom: 12 }}>
        <div className="container">
          <div className="hero-badge">
            <Link href="/tools">Tools</Link> · Stats
          </div>
          <h1>Stats</h1>
          <p>Real numbers from your local watchlist only.</p>
        </div>
      </section>
      <section className="container" style={{ paddingBottom: 48 }}>
        <StatsClient />
      </section>
    </main>
  );
}
