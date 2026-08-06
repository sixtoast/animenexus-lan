import Link from "next/link";
import { OracleClient } from "@/components/OracleClient";
import "../tools.css";
import "../../oracle-vibe.css";

export const metadata = {
  title: "Night Desk · AnimeNexus",
  description: "Local + cloud oracle; vibe-cast resolves to title cards.",
};

export default function OraclePage() {
  return (
    <main>
      <section className="hero" style={{ paddingBottom: 12 }}>
        <div className="container">
          <div className="hero-badge">
            <Link href="/tools">Tools</Link> · Night Desk
          </div>
          <h1>
            Night <span>Desk</span>
          </h1>
          <p>
            Local reading or cloud modes. Vibe cast returns resolved title cards.
          </p>
        </div>
      </section>
      <section className="container" style={{ paddingBottom: 48 }}>
        <OracleClient />
      </section>
    </main>
  );
}
