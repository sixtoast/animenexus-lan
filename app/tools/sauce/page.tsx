import Link from "next/link";
import { SauceClient } from "@/components/SauceClient";
import "../tools.css";
import "./sauce.css";

export const metadata = {
  title: "Sauce · AnimeNexus",
  description: "Find the anime from a screenshot via trace.moe.",
};

export default function SaucePage() {
  return (
    <main>
      <section className="hero" style={{ paddingBottom: 12 }}>
        <div className="container">
          <div className="hero-badge">
            <Link href="/tools">Tools</Link> · Sauce · Sprint 10
          </div>
          <h1>
            Find the <span>sauce</span>
          </h1>
          <p>
            Trace a frame to its source episode. Results link into AnimeNexus
            detail pages when AniList IDs are available.
          </p>
        </div>
      </section>
      <section className="container" style={{ paddingBottom: 48 }}>
        <SauceClient />
      </section>
    </main>
  );
}
