import Link from "next/link";
import { CompareClient } from "@/components/CompareClient";
import "../tools.css";

export const metadata = { title: "Compare · AnimeNexus" };

export default function ComparePage() {
  return (
    <main>
      <section className="hero" style={{ paddingBottom: 12 }}>
        <div className="container">
          <div className="hero-badge">
            <Link href="/tools">Tools</Link> · Compare
          </div>
          <h1>Compare</h1>
          <p>Put two titles on the same channel.</p>
        </div>
      </section>
      <section className="container" style={{ paddingBottom: 48 }}>
        <CompareClient />
      </section>
    </main>
  );
}
