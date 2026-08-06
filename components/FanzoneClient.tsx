"use client";

import { useEffect, useState } from "react";
import {
  addConfession,
  newBingo,
  readBingo,
  readConfessions,
  toggleBingo,
  type BingoBoard,
  type Confession,
} from "@/lib/fanzone";
import {
  buildTasteDNA,
  parseTasteDNA,
  compareSoulmates,
} from "@/lib/taste-dna";
import { useWatchlist } from "@/components/WatchlistProvider";
import { useToast } from "@/components/ToastProvider";
import { isAIConfigured } from "@/lib/ai-settings";
import { callChatCompletions } from "@/lib/ai-chat";

export function FanzoneClient() {
  const { entries } = useWatchlist();
  const { showToast } = useToast();
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [text, setText] = useState("");
  const [bingo, setBingo] = useState<BingoBoard | null>(null);
  const [importCode, setImportCode] = useState("");
  const [compareResult, setCompareResult] = useState<string | null>(null);
  const [freq, setFreq] = useState<string | null>(null);
  const [lastPct, setLastPct] = useState<number | null>(null);

  useEffect(() => {
    setConfessions(readConfessions());
    setBingo(readBingo() || newBingo());
  }, []);

  function submitConfess() {
    const next = addConfession(text);
    setConfessions(next);
    setText("");
    showToast("Confession logged", "💌");
  }

  async function exportDNA() {
    const code = buildTasteDNA(entries);
    try {
      await navigator.clipboard.writeText(code);
      showToast("Taste DNA copied", "🧬");
    } catch {
      prompt("Copy your Taste DNA:", code);
    }
  }

  function runCompare() {
    const other = parseTasteDNA(importCode);
    if (!other) {
      setCompareResult("Invalid code.");
      setLastPct(null);
      return;
    }
    const r = compareSoulmates(entries, other);
    setLastPct(r.pct);
    let label = "Distant stars";
    if (r.pct >= 75) label = "Anime soulmates";
    else if (r.pct >= 50) label = "Strong resonance";
    else if (r.pct >= 30) label = "Some overlap";
    setCompareResult(
      `${r.pct}% — ${label}. Shared genres: ${r.shared.join(", ") || "none"}.`,
    );
    setFreq(null);
  }

  async function frequencyRead() {
    if (lastPct == null || !compareResult) return;
    if (!isAIConfigured()) {
      showToast("Configure AI in the panel first", "🤖");
      return;
    }
    try {
      const reply = await callChatCompletions(
        [
          {
            role: "system",
            content:
              "You write a short poetic 'frequency read' about two anime fans. " +
              "You MUST treat the given percentage as ground truth. Never invent a different %. " +
              "2-4 sentences max. No unlock codes or ARG.",
          },
          {
            role: "user",
            content: `Computed overlap: ${lastPct}%. Context: ${compareResult}. Give the frequency read.`,
          },
        ],
        { temperature: 0.8 },
      );
      setFreq(reply.trim());
    } catch (e) {
      showToast(e instanceof Error ? e.message : "AI failed", "😅");
    }
  }

  return (
    <div className="tools-panel fanzone">
      <section className="fz-section">
        <h2>Confessions</h2>
        <div className="picker-row">
          <input
            className="filter-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Anonymous local note…"
            maxLength={280}
          />
          <button
            type="button"
            className="btn btn-accent btn-sm"
            onClick={submitConfess}
          >
            Post
          </button>
        </div>
        <ul className="confession-list">
          {confessions.map((c) => (
            <li key={c.id}>{c.text}</li>
          ))}
          {!confessions.length ? (
            <li className="tools-hint">No confessions yet.</li>
          ) : null}
        </ul>
      </section>

      <section className="fz-section">
        <h2>Bingo</h2>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => setBingo(newBingo())}
        >
          New board
        </button>
        {bingo ? (
          <div className="bingo-grid">
            {bingo.cells.map((cell, i) => (
              <button
                key={`${cell}-${i}`}
                type="button"
                className={"bingo-cell" + (bingo.marked[i] ? " marked" : "")}
                onClick={() => setBingo(toggleBingo(i))}
              >
                {cell}
              </button>
            ))}
          </div>
        ) : null}
      </section>

      <section className="fz-section">
        <h2>Taste DNA</h2>
        <div className="daily-actions">
          <button
            type="button"
            className="btn btn-accent btn-sm"
            onClick={exportDNA}
          >
            Export my DNA
          </button>
        </div>
        <label className="filter-label">Friend&apos;s code</label>
        <textarea
          className="filter-input"
          rows={3}
          value={importCode}
          onChange={(e) => setImportCode(e.target.value)}
          placeholder="Paste Taste DNA…"
        />
        <button
          type="button"
          className="btn btn-outline btn-sm"
          style={{ marginTop: 8 }}
          onClick={runCompare}
        >
          Compare
        </button>
        {compareResult ? (
          <p className="tools-hint" style={{ marginTop: 12 }}>
            {compareResult}
          </p>
        ) : null}
        {lastPct != null ? (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            style={{ marginTop: 8 }}
            onClick={frequencyRead}
          >
            Frequency read (AI)
          </button>
        ) : null}
        {freq ? (
          <p className="oracle-cloud" style={{ marginTop: 12 }}>
            {freq}
          </p>
        ) : null}
      </section>
    </div>
  );
}
