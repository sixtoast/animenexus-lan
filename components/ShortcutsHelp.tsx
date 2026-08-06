"use client";

import { useEffect, useState } from "react";

const ROWS: { keys: string; action: string }[] = [
  { keys: "Ctrl/⌘ + K", action: "Command palette — search & jump" },
  { keys: "Q", action: "Tonight queue" },
  { keys: "B", action: "Break timer" },
  { keys: "?", action: "This shortcuts panel" },
  { keys: "Esc", action: "Close overlays / palette" },
  { keys: "FAB ✦", action: "Tonight, Break, Flashback, theme, tools" },
  { keys: "🤖 panel", action: "AI assistant + API keys" },
];

export function ShortcutsHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;

  return (
    <div
      className="session-overlay open"
      role="dialog"
      aria-label="Keyboard shortcuts"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="session-panel" style={{ width: "min(440px, 100%)" }}>
        <div className="session-head">
          <h3>Shortcuts</h3>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close">
            ×
          </button>
        </div>
        <table className="shortcuts-table">
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.keys}>
                <td>
                  <kbd>{r.keys}</kbd>
                </td>
                <td>{r.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="tools-hint" style={{ marginTop: 12 }}>
          Press <kbd>?</kbd> again to close.
        </p>
      </div>
    </div>
  );
}
