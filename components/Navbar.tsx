"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/Button";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/seasonal", label: "Seasonal" },
  { href: "/daily", label: "Daily" },
  { href: "/tools", label: "Tools" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/taste", label: "Taste" },
  { href: "/account", label: "Account" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link href="/" className="logo">
          Anime<span>Nexus</span>
        </Link>

        <nav className="nav-desktop" aria-label="Primary">
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

        <div className="nav-right">
          <Button
            variant="icon"
            size="sm"
            onClick={toggleTheme}
            title="Toggle theme"
            aria-label="Toggle light/dark theme"
            className="theme-toggle-btn"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </Button>
          <span className="sprint-badge">Lantern</span>
          <Button
            variant="outline"
            size="sm"
            className="nav-toggle"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </Button>
        </div>
      </div>

      {open ? (
        <nav id="mobile-nav" className="nav-mobile" aria-label="Mobile primary">
          <ul>
            {LINKS.map((l) => {
              const active =
                l.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(l.href);
              return (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className={active ? "active" : undefined}
                    onClick={() => setOpen(false)}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
