"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useMascotStore, mascotNotify } from "@/lib/mascot/store";
import { UiAwareness } from "./UiAwareness";
import { ContextBridge } from "./ContextBridge";

const MascotScene = dynamic(
  () => import("./MascotScene").then((m) => m.MascotScene),
  {
    ssr: false,
    loading: () => <div className="mascot-loading" aria-hidden />,
  },
);

export function MascotHost() {
  const enabled = useMascotStore((s) => s.enabled);
  const setEnabled = useMascotStore((s) => s.setEnabled);
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [hiddenTab, setHiddenTab] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReady(true);
    try {
      const saved = localStorage.getItem("anime_nexus_mascot");
      if (saved === "off") setEnabled(false);
    } catch {
      /* ignore */
    }
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, [setEnabled]);

  useEffect(() => {
    const onVis = () => setHiddenTab(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    mascotNotify({ type: "route", path: pathname });
  }, [pathname, enabled]);

  useEffect(() => {
    const onSeal = (e: Event) => {
      const d = (e as CustomEvent).detail as { mode?: string } | undefined;
      if (d?.mode === "completed") mascotNotify({ type: "complete" });
      else mascotNotify({ type: "seal" });
    };
    window.addEventListener("animenexus:seal", onSeal);
    return () => window.removeEventListener("animenexus:seal", onSeal);
  }, []);

  useEffect(() => {
    if (!enabled || hiddenTab) return;
    const id = window.setInterval(() => {
      const last = useMascotStore.getState().lastInteractionAt;
      if (Date.now() - last > 45_000) {
        mascotNotify({ type: "idle-long" });
      }
    }, 20_000);
    return () => window.clearInterval(id);
  }, [enabled, hiddenTab]);

  if (!ready || !enabled) {
    return (
      <button
        type="button"
        className="mascot-enable"
        onClick={() => {
          setEnabled(true);
          try {
            localStorage.setItem("anime_nexus_mascot", "on");
          } catch {
            /* */
          }
        }}
        title="Show companion"
        aria-label="Show companion"
      >
        🕯️
      </button>
    );
  }

  return (
    <>
      <UiAwareness />
      <ContextBridge />
      <div
        className="mascot-habitat"
        role="complementary"
        aria-label="Companion"
      >
        <div className="mascot-stage">
          {!hiddenTab ? (
            <MascotScene reducedMotion={reducedMotion} />
          ) : (
            <div className="mascot-sleeping" aria-hidden>
              zzz
            </div>
          )}
        </div>
        <div className="mascot-bar">
          <span className="mascot-name">Lantern-ko</span>
          <button
            type="button"
            className="mascot-hide"
            onClick={() => {
              setEnabled(false);
              try {
                localStorage.setItem("anime_nexus_mascot", "off");
              } catch {
                /* */
              }
            }}
            aria-label="Hide companion"
          >
            Hide
          </button>
        </div>
      </div>
    </>
  );
}
