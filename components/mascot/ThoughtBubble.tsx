"use client";

import { useEffect, useState } from "react";

/**
 * Soft, rare thought line — never spammy.
 * Listens for animenexus:mascot-thought from the decision layer.
 */
export function ThoughtBubble() {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    let hide: number | undefined;
    const onThought = (e: Event) => {
      const d = (e as CustomEvent).detail as { text?: string } | undefined;
      if (!d?.text) return;
      // Low duty: skip if one is already showing
      if (text) return;
      // Only show ~40% of thoughts
      if (Math.random() > 0.4) return;
      setText(d.text);
      window.clearTimeout(hide);
      hide = window.setTimeout(() => setText(null), 3200);
    };
    window.addEventListener("animenexus:mascot-thought", onThought);
    return () => {
      window.removeEventListener("animenexus:mascot-thought", onThought);
      window.clearTimeout(hide);
    };
  }, [text]);

  if (!text) return null;

  return (
    <div className="mascot-thought" role="status" aria-live="polite">
      {text}
    </div>
  );
}
