import Link from "next/link";
import { ChallengeClient } from "@/components/ChallengeClient";
import "../tools.css";

export const metadata = { title: "Challenge · AnimeNexus" };

export default function ChallengePage() {
  return (
    <main>
      <section className="hero" style={{ paddingBottom: 12 }}>
        <div className="container">
          <div className="hero-badge">
            <Link href="/tools">Tools</Link> · Challenge
          </div>
          <h1>Challenge</h1>
          <p>Score, year, or format — one guess at a time.</p>
        </div>
      </section>
      <section className="container" style={{ paddingBottom: 48 }}>
        <ChallengeClient />
      </section>
    </main>
  );
}
