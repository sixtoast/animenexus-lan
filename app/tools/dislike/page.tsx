import Link from "next/link";
import { DislikeClient } from "@/components/DislikeClient";
import "../tools.css";

export const metadata = {
  title: "Dislike reverse · AnimeNexus",
  description: "Reverse a title you bounced off — opposite genre space.",
};

export default function Page() {
  return (
    <main>
      <section className="hero" style={{ paddingBottom: 12 }}>
        <div className="container">
          <div className="hero-badge">
            <Link href="/tools">Tools</Link> · Dislike
          </div>
          <h1>Dislike reverse</h1>
          <p>Bounced off a title? Steer into opposite genre space.</p>
        </div>
      </section>
      <section className="container" style={{ paddingBottom: 48 }}>
        <DislikeClient />
      </section>
    </main>
  );
}
