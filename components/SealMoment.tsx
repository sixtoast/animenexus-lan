"use client";

import { useEffect, useState } from "react";

type Detail = {
  title?: string;
  mode?: "seal" | "watching";
};

/** Quiet watchlist seal — one recognisable Lantern moment */
export function SealMomentHost() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState<"seal" | "watching">("seal");

  useEffect(() => {
    const onSeal = (e: Event) => {
      const d = (e as CustomEvent).detail as Detail | undefined;
      setTitle(d?.title || "Title");
      setMode(d?.mode === "watching" ? "watching" : "seal");
      setOpen(true);
      const t = window.setTimeout(() => setOpen(false), 2200);
      return () => window.clearTimeout(t);
    };
    window.addEventListener("animenexus:seal", onSeal);
    return () => window.removeEventListener("animenexus:seal", onSeal);
  }, []);

  if (!open) return null;

  return (
    <div className="seal-moment" role="status" aria-live="polite">
      <div className="seal-card">
        <div className="seal-wax" aria-hidden>
          <span className="seal-wax-inner">🕯️</span>
        </div>
        <p className="seal-kicker">
          {mode === "watching" ? "Channel locked" : "Sealed by Lantern"}
        </p>
        <p className="seal-title">{title}</p>
        <p className="seal-sub">
          {mode === "watching"
            ? "Progress lives on your shelf."
            : "Added to your shelf. The desk remembers."}
        </p>
      </div>
    </div>
  );
}

export function fireSeal(title: string, mode: "seal" | "watching" = "seal") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("animenexus:seal", { detail: { title, mode } }),
  );
  window.dispatchEvent(new CustomEvent("animenexus:lantern-pulse"));
}
