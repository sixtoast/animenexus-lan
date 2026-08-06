import { OracleClient } from "@/components/OracleClient";
import { DeskShell } from "@/components/DeskShell";
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
          <div className="hero-badge">Night Desk · Oracle</div>
          <h1>
            Night <span>Desk</span>
          </h1>
          <p>
            Switch bands. Vibe cast deals resolved title cards.
          </p>
        </div>
      </section>
      <section className="container" style={{ paddingBottom: 48 }}>
        <DeskShell title="Oracle">
          <OracleClient />
        </DeskShell>
      </section>
    </main>
  );
}
