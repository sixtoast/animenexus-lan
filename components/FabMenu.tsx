"use client";

import Link from "next/link";
import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { useToast } from "@/components/ToastProvider";

export function FabMenu() {
  const [open, setOpen] = useState(false);
  const { toggleTheme, theme } = useTheme();
  const { showToast } = useToast();

  return (
    <div className={`fab-root${open ? " open" : ""}`}>
      {open ? (
        <div className="fab-menu" role="menu">
          <Link
            href="/tools/challenge"
            className="fab-item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            🎯 Challenge
          </Link>
          <Link
            href="/seasonal"
            className="fab-item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            📅 Seasonal
          </Link>
          <Link
            href="/tools/oracle"
            className="fab-item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            🕯️ Night Desk
          </Link>
          <Link
            href="/tools/sauce"
            className="fab-item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            🔍 Sauce
          </Link>
          <Link
            href="/daily"
            className="fab-item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            ☀️ Daily
          </Link>
          <button
            type="button"
            className="fab-item"
            role="menuitem"
            onClick={() => {
              toggleTheme();
              showToast(
                theme === "dark" ? "Light frequency" : "Dark frequency",
                theme === "dark" ? "☀️" : "🌙",
              );
              setOpen(false);
            }}
          >
            {theme === "dark" ? "☀️ Light theme" : "🌙 Dark theme"}
          </button>
          <Link
            href="/browse"
            className="fab-item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            🎲 Browse
          </Link>
        </div>
      ) : null}
      <button
        type="button"
        className="fab-toggle"
        aria-expanded={open}
        aria-label={open ? "Close quick menu" : "Open quick menu"}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "×" : "✦"}
      </button>
    </div>
  );
}
