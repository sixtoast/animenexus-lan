"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/ToastProvider";

type Quote = { quote: string; character?: string; anime?: string };

const FALLBACKS: Quote[] = [
  {
    quote: "Whatever you lose, you’ll find it again.",
    character: "Haku",
    anime: "Spirited Away",
  },
  {
    quote: "It’s not the face that makes someone a monster.",
    character: "The Cat",
    anime: "Howl’s Moving Castle",
  },
];

async function fetchQuoteChain(): Promise<Quote> {
  const endpoints = ["https://api.animechan.io/v1/quotes/random"];
  for (const url of endpoints) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (!res.ok) continue;
      const data = await res.json();
      const q =
        data?.quote ||
        data?.content ||
        data?.data?.content ||
        data?.data?.quote;
      const character =
        data?.character?.name || data?.character || data?.data?.character;
      const anime = data?.anime?.name || data?.anime || data?.data?.anime;
      if (typeof q === "string" && q.trim()) {
        return {
          quote: q.trim(),
          character: typeof character === "string" ? character : undefined,
          anime: typeof anime === "string" ? anime : undefined,
        };
      }
    } catch {
      /* try next */
    }
  }
  return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
}

export function QuoteBanner() {
  const [q, setQ] = useState<Quote | null>(null);
  const [busy, setBusy] = useState(false);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const next = await fetchQuoteChain();
      setQ(next);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function copy() {
    if (!q) return;
    const line = q.character
      ? `“${q.quote}” — ${q.character}${q.anime ? ` (${q.anime})` : ""}`
      : `“${q.quote}”`;
    try {
      await navigator.clipboard.writeText(line);
      showToast("Quote copied", "📖");
    } catch {
      showToast("Could not copy", "😅");
    }
  }

  return (
    <div className="quote-banner">
      <div className="quote-top">
        <p className="quote-text">
          <span className="quote-mark">“</span>
          {q ? q.quote : busy ? "Tuning the desk…" : "…"}
          <span className="quote-mark">”</span>
        </p>
        <div className="quote-actions">
          <button
            type="button"
            className="btn-icon"
            title="Next quote"
            onClick={load}
            disabled={busy}
          >
            ↻
          </button>
          <button
            type="button"
            className="btn-icon"
            title="Copy"
            onClick={copy}
            disabled={!q}
          >
            ⎘
          </button>
        </div>
      </div>
      {q?.character || q?.anime ? (
        <p className="quote-source">
          — {q.character}
          {q.anime ? ` · ${q.anime}` : ""}
        </p>
      ) : null}
    </div>
  );
}
