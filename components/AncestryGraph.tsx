"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AnimeRelation } from "@/lib/types";
import Link from "next/link";

type Props = {
  centerTitle: string;
  centerId: number;
  relations: AnimeRelation[];
};

declare global {
  interface Window {
    vis?: {
      Network: new (
        el: HTMLElement,
        data: unknown,
        options: unknown,
      ) => {
        destroy: () => void;
        on: (ev: string, cb: (p: { nodes: number[] }) => void) => void;
      };
      DataSet: new (data: unknown[]) => unknown;
    };
  }
}

function loadVis(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.vis?.Network) {
      resolve();
      return;
    }
    const cssId = "vis-network-css";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href =
        "https://cdnjs.cloudflare.com/ajax/libs/vis-network/9.1.6/dist/vis-network.min.css";
      document.head.appendChild(link);
    }
    const existing = document.querySelector(
      "script[data-vis-network]",
    ) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("vis load")));
      return;
    }
    const s = document.createElement("script");
    s.src =
      "https://cdnjs.cloudflare.com/ajax/libs/vis-network/9.1.6/dist/vis-network.min.js";
    s.async = true;
    s.dataset.visNetwork = "1";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("vis load failed"));
    document.body.appendChild(s);
  });
}

export function AncestryGraph({
  centerTitle,
  centerId,
  relations,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);
  const netRef = useRef<{ destroy: () => void } | null>(null);

  useEffect(() => {
    if (!open || !hostRef.current || !relations.length) return;
    let cancelled = false;

    loadVis()
      .then(() => {
        if (cancelled || !hostRef.current || !window.vis) return;
        if (netRef.current) {
          netRef.current.destroy();
          netRef.current = null;
        }
        const nodes = [
          {
            id: centerId,
            label: centerTitle.slice(0, 28),
            color: { background: "#f0a090", border: "#f8c4b8" },
            font: { color: "#2a1210", bold: true, size: 14 },
            shape: "box",
            margin: 12,
          },
          ...relations.map((r) => ({
            id: r.id,
            label: r.title.slice(0, 24),
            color: {
              background: "#221c18",
              border: "rgba(240,160,144,0.45)",
            },
            font: { color: "#faf4ef", size: 12 },
            shape: "box",
            margin: 10,
          })),
        ];
        const seen = new Set<number>();
        const uniqueNodes = nodes.filter((n) => {
          if (seen.has(n.id)) return false;
          seen.add(n.id);
          return true;
        });
        const edges = relations.map((r, i) => ({
          id: `e-${i}`,
          from: centerId,
          to: r.id,
          label: (r.relationType || "").replace(/_/g, " ").slice(0, 14),
          font: { size: 11, color: "#c4b4a8" },
          color: { color: "rgba(240,160,144,0.5)", highlight: "#f0a090" },
          width: 2,
        }));
        const data = {
          nodes: new window.vis!.DataSet(uniqueNodes),
          edges: new window.vis!.DataSet(edges),
        };
        const options = {
          physics: {
            enabled: true,
            barnesHut: {
              gravitationalConstant: -12000,
              springLength: 160,
              springConstant: 0.04,
            },
          },
          interaction: { hover: true, tooltipDelay: 80, navigationButtons: true },
          edges: { smooth: { type: "continuous" } },
        };
        const net = new window.vis!.Network(hostRef.current, data, options);
        net.on("click", (params) => {
          const id = params.nodes?.[0];
          if (id && id !== centerId) {
            setOpen(false);
            router.push(`/anime/${id}`);
          }
        });
        netRef.current = net;
      })
      .catch(() => setFailed(true));

    return () => {
      cancelled = true;
      if (netRef.current) {
        netRef.current.destroy();
        netRef.current = null;
      }
    };
  }, [open, centerId, centerTitle, relations, router]);

  if (!relations.length) return null;

  const groups = new Map<string, AnimeRelation[]>();
  for (const r of relations) {
    const key = r.relationType || "RELATED";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }

  return (
    <section className="detail-section ancestry-section">
      <div className="ancestry-callout">
        <div>
          <h2>Ancestry graph</h2>
          <p className="ancestry-lead">
            {relations.length} linked title{relations.length === 1 ? "" : "s"} —
            sequels, prequels, and side stories mapped as a network.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-accent"
          onClick={() => {
            setFailed(false);
            setOpen(true);
          }}
        >
          Open interactive graph
        </button>
      </div>

      {open ? (
        <div
          className="ancestry-overlay open"
          role="dialog"
          aria-modal="true"
          aria-label="Ancestry graph"
        >
          <div className="ancestry-content">
            <div className="ancestry-header">
              <h3>Ancestry · {centerTitle}</h3>
              <button
                type="button"
                className="ancestry-close"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            {failed ? (
              <p className="tools-hint" style={{ padding: 24 }}>
                Graph library failed to load (CDN blocked?). Use the list below.
              </p>
            ) : (
              <div
                ref={hostRef}
                id="ancestryNetwork"
                style={{ flex: 1, minHeight: 0 }}
              />
            )}
            <div className="ancestry-footer">
              Drag to pan · scroll to zoom · click a node to open its page
            </div>
          </div>
        </div>
      ) : null}

      <div className="ancestry-wrap">
        {[...groups.entries()].map(([type, list]) => (
          <div key={type} className="ancestry-group">
            <div className="ancestry-type">{type.replace(/_/g, " ")}</div>
            <div className="ancestry-nodes">
              {list.map((r) => (
                <Link
                  key={`${r.id}-${r.relationType}`}
                  href={`/anime/${r.id}`}
                  className="ancestry-node"
                >
                  {r.title}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
