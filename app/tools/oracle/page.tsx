import Link from "next/link";
import { OracleClient } from "@/components/OracleClient";
import "../tools.css";
import "../sauce/sauce.css";

export const metadata = {
  title: "Night Desk · AnimeNexus",
  description: "Local oracle reading from your watchlist.",
};

export default function OraclePage() {
  return (
    <main>
      <section className="hero" style={{ paddingBottom: 12 }}>
        <div className="container">
          <div className="hero-badge">
            <Link href="/tools">Tools</Link> · Night Desk · Sprint 10
          </div>
          <h1>
            Night <span>Desk</span>
          </h1>
          <p>
            A local reading from your watchlist — what to finish, what to start,
            which mood to open next.
          </p>
        </div>
      </section>
      <section className="container" style={{ paddingBottom: 48 }}>
        <OracleClient />
      </section>
    </main>
  );
}
