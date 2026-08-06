"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/watchlist", label: "Watchlist" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link href="/" className="logo">
          Anime<span>Nexus</span>
        </Link>
        <nav aria-label="Primary">
          <ul className="nav-links">
            {LINKS.map((l) => {
              const active =
                l.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(l.href);
              return (
                <li key={l.label}>
                  <Link href={l.href} className={active ? "active" : undefined}>
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <span
          style={{
            fontSize: "0.7rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--color-accent)",
            fontWeight: 600,
          }}
        >
          Sprint 4
        </span>
      </div>
    </header>
  );
}
