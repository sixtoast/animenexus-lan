"use client";

import { useEffect } from "react";
import {
  getMemory,
  memoryEmotionBias,
  noteSessionStart,
} from "@/lib/mascot/memory";
import { useMascotStore } from "@/lib/mascot/store";

/** Boot relationship memory once per mount */
export function MemoryBoot() {
  useEffect(() => {
    noteSessionStart();
    const bias = memoryEmotionBias();
    const store = useMascotStore.getState();
    for (const [k, v] of Object.entries(bias)) {
      if (typeof v === "number") {
        store.bumpEmotion(k as keyof typeof store.emotions, v);
      }
    }
    // Soft greet thought for returning friends
    const m = getMemory();
    if (m.totalSessions > 1 && m.trust > 0.5) {
      window.setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("animenexus:mascot-thought", {
            detail: { text: "You’re back." },
          }),
        );
      }, 1200);
    }
  }, []);

  return null;
}
