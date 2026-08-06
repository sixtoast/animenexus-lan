import { TasteClient } from "@/components/TasteClient";
import "./taste.css";

export const metadata = {
  title: "Taste · AnimeNexus",
  description:
    "Your local taste profile — hours, scores, formats, and status breakdown.",
};

export default function TastePage() {
  return (
    <main>
      <section className="hero" style={{ paddingBottom: 12 }}>
        <div className="container">
          <div className="hero-badge">Taste · Sprint 7</div>
          <h1>
            Your <span>signal</span>
          </h1>
          <p>
            Aggregated from this browser’s watchlist — progress, scores, and
            formats. Sync from Account to fill it faster.
          </p>
        </div>
      </section>
      <section className="container" style={{ paddingBottom: 48 }}>
        <TasteClient />
      </section>
    </main>
  );
}
