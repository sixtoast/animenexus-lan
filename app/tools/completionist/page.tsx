import Link from "next/link";
import { CompletionistClient } from "@/components/CompletionistClient";
import "../tools.css";

export const metadata = {
  title: "Completionist · AnimeNexus",
  description: "Finish Watching first, then rank the Planning queue.",
};

export default function Page() {
  return (
    <main>
      <section className="hero" style={{ paddingBottom: 12 }}>
        <div className="container">
          <div className="hero-badge">
            <Link href="/tools">Tools</Link> · Completionist
          </div>
          <h1>Completionist</h1>
          <p>Finish Watching first, then rank the Planning queue.</p>
        </div>
      </section>
      <section className="container" style={{ paddingBottom: 48 }}>
        <CompletionistClient />
      </section>
    </main>
  );
}
