import Link from "next/link";
import { MotionClient } from "@/components/MotionClient";
import "../tools.css";

export const metadata = {
  title: "Motion · AnimeNexus",
  description: "Clip room scaffold — honest about upscale limits.",
};

export default function Page() {
  return (
    <main>
      <section className="hero" style={{ paddingBottom: 12 }}>
        <div className="container">
          <div className="hero-badge">
            <Link href="/tools">Tools</Link> · Motion
          </div>
          <h1>Motion studio</h1>
          <p>Browse clips from sauce/trace results. Upscale is key-gated.</p>
        </div>
      </section>
      <section className="container" style={{ paddingBottom: 48 }}>
        <MotionClient />
      </section>
    </main>
  );
}
