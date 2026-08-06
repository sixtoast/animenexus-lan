import Link from "next/link";
import { RadarClient } from "@/components/RadarClient";
import "../tools.css";
import "../../airing/airing.css";

export const metadata = {
  title: "Radar · AnimeNexus",
  description: "Genre preference bars from your list.",
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
          <p>Genre preference intensity from your list.</p>
        </div>
      </section>
      <section className="container" style={{ paddingBottom: 48 }}>
        <RadarClient />
      </section>
    </main>
  );
}
