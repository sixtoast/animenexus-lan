import Link from "next/link";
import { FusionClient } from "@/components/FusionClient";
import "../tools.css";

export const metadata = { title: "Fusion · AnimeNexus" };

export default function FusionPage() {
  return (
    <main>
      <section className="hero" style={{ paddingBottom: 12 }}>
        <div className="container">
          <div className="hero-badge">
            <Link href="/tools">Tools</Link> · Fusion
          </div>
          <h1>Fusion</h1>
          <p>How well do two signals resonate?</p>
        </div>
      </section>
      <section className="container" style={{ paddingBottom: 48 }}>
        <FusionClient />
      </section>
    </main>
  );
}
