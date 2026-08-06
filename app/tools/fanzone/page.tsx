import Link from "next/link";
import { FanzoneClient } from "@/components/FanzoneClient";
import "../tools.css";
import "../sauce/sauce.css";

export const metadata = {
  title: "Fan zone · AnimeNexus",
  description: "Bingo, confessions, Taste DNA compare.",
};

export default function Page() {
  return (
    <main>
      <section className="hero" style={{ paddingBottom: 12 }}>
        <div className="container">
          <div className="hero-badge">
            <Link href="/tools">Tools</Link> · Fan zone
          </div>
          <h1>Fan zone</h1>
          <p>Bingo, local confessions, Taste DNA export & compare.</p>
        </div>
      </section>
      <section className="container" style={{ paddingBottom: 48 }}>
        <FanzoneClient />
      </section>
    </main>
  );
}
