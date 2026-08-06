import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "clamp(48px, 10vw, 96px) 24px",
      }}
    >
      <p
        style={{
          fontSize: "0.75rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--color-accent)",
          fontWeight: 600,
          marginBottom: 16,
        }}
      >
        Night Signal · Next.js
      </p>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2.4rem, 6vw, 3.6rem)",
          fontWeight: 700,
          lineHeight: 1.15,
          marginBottom: 16,
        }}
      >
        AnimeNexus <span style={{ color: "var(--color-accent)" }}>Lantern</span>
      </h1>
      <p
        style={{
          color: "var(--color-text-muted)",
          fontSize: "1.1rem",
          maxWidth: 540,
          marginBottom: 32,
        }}
      >
        Mood-based recommendations, a deep taste profile, and AI-powered tools —
        rebuilt as a Next.js project while preserving the full late-night
        broadcast console.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 48 }}>
        <Link
          href="/app"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 28px",
            borderRadius: 50,
            background: "linear-gradient(135deg, #e8a598, #d4847a)",
            color: "#2a1210",
            fontWeight: 700,
            border: "none",
          }}
        >
          Open Lantern Console →
        </Link>
        <a
          href="https://github.com/sixtoast/animenexus-lantern"
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 28px",
            borderRadius: 50,
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
            background: "var(--color-tertiary)",
            fontWeight: 600,
          }}
        >
          GitHub
        </a>
      </div>

      <section
        style={{
          background: "var(--color-secondary)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius)",
          padding: 28,
        }}
      >
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 600,
            marginBottom: 12,
            color: "var(--color-text)",
          }}
        >
          Project structure
        </h2>
        <ul
          style={{
            color: "var(--color-text-muted)",
            fontSize: "0.9rem",
            paddingLeft: 20,
            lineHeight: 1.8,
          }}
        >
          <li>
            <code style={{ color: "var(--color-accent)" }}>public/index.html</code> — full
            original SPA (served at <code>/app</code>)
          </li>
          <li>
            <code style={{ color: "var(--color-accent)" }}>styles/lantern.css</code> —
            extracted design system (~287KB)
          </li>
          <li>
            <code style={{ color: "var(--color-accent)" }}>app/</code> — Next.js App Router
            shell for gradual React migration
          </li>
          <li>
            <code style={{ color: "var(--color-accent)" }}>components/</code> ·{" "}
            <code style={{ color: "var(--color-accent)" }}>lib/</code> — placeholders for
            extracted features
          </li>
        </ul>
        <p
          style={{
            marginTop: 20,
            fontSize: "0.85rem",
            color: "var(--color-text-muted)",
          }}
        >
          Run locally: <code style={{ color: "var(--color-amber)" }}>npm install && npm run dev</code>
        </p>
      </section>
    </main>
  );
}
