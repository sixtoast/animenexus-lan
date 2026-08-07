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

const PageTerrainScene = dynamic(
  () => import("./PageTerrainScene").then((m) => m.PageTerrainScene),
  { ssr: false },
);

export function MascotHost() {
  const enabled = useMascotStore((s) => s.enabled);
  const setEnabled = useMascotStore((s) => s.setEnabled);
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [hiddenTab, setHiddenTab] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [lowPower, setLowPower] = useState(false);
  const [terrainMode, setTerrainMode] = useState(false);

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
    setLowPower(
      window.matchMedia("(max-width: 480px)").matches ||
        (navigator as Navigator & { connection?: { saveData?: boolean } })
          .connection?.saveData === true,
    );
  }, [setEnabled]);

  useEffect(() => {
    const onVis = () => setHiddenTab(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    const check = () => {
      const open = !!(
        document.querySelector(
          '[role="dialog"][data-open="true"], .modal-root.open, .cmdk-root[data-open="true"], .ai-panel.open',
        ) || document.body.classList.contains("modal-open")
      );
      setModalOpen(open);
    };
    const id = window.setInterval(check, 800);
    check();
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    mascotNotify({ type: "route", path: pathname });
    // Leave terrain on route change so map rebuilds cleanly
    setTerrainMode(false);
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

  // Escape exits terrain
  useEffect(() => {
    if (!terrainMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTerrainMode(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [terrainMode]);

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

  if (terrainMode) {
    return (
      <>
        <UiAwareness />
        <ContextBridge />
        <PageTerrainScene
          reducedMotion={reducedMotion}
          onClose={() => setTerrainMode(false)}
        />
      </>
    );
  }

  const pauseScene = hiddenTab || modalOpen;

  return (
    <>
      <UiAwareness />
      <ContextBridge />
      <div
        className={
          "mascot-habitat" + (modalOpen ? " mascot-habitat--dim" : "")
        }
        role="complementary"
        aria-label="Companion"
        aria-hidden={modalOpen || undefined}
      >
        <div className="mascot-stage">
          {!pauseScene ? (
            <MascotScene reducedMotion={reducedMotion} lowPower={lowPower} />
          ) : (
            <div className="mascot-sleeping" aria-hidden>
              {modalOpen ? "…" : "zzz"}
            </div>
          )}
        </div>
        <div className="mascot-bar">
          <span className="mascot-name">Lantern-ko</span>
          <div className="mascot-bar-actions">
            <button
              type="button"
              className="mascot-terrain-btn"
              onClick={() => setTerrainMode(true)}
              title="Page as terrain"
              aria-label="Open page terrain mode"
            >
              Map
            </button>
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
      </div>
    </>
  );
}
