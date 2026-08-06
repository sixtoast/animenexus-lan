"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AnimeRelation } from "@/lib/types";

type NodeSpec = {
  id: number;
  title: string;
  image?: string;
  kind: "center" | "official" | "recommended";
  relationType: string;
  year?: number | string | null;
  score?: number | null;
};

type Props = {
  center: NodeSpec;
  nodes: NodeSpec[];
};

type LaidOut = NodeSpec & { x: number; y: number; r: number };

function edgeColor(kind: NodeSpec["kind"], relationType: string) {
  const t = relationType.toUpperCase();
  if (kind === "recommended") return "rgba(240,160,144,0.55)";
  if (t === "SEQUEL") return "rgba(143,212,160,0.7)";
  if (t === "PREQUEL" || t === "PARENT") return "rgba(138,176,232,0.7)";
  if (t === "SIDE_STORY") return "rgba(239,192,122,0.7)";
  if (t === "SPIN_OFF") return "rgba(201,160,232,0.7)";
  return "rgba(212,160,144,0.55)";
}

function shortLabel(t: string) {
  return t.replace(/_/g, " ").slice(0, 12);
}

/** Polar layout: official inner ring, recommended outer */
function layoutNodes(
  center: NodeSpec,
  nodes: NodeSpec[],
  w: number,
  h: number,
): LaidOut[] {
  const cx = w / 2;
  const cy = h / 2;
  const official = nodes.filter((n) => n.kind === "official");
  const recommended = nodes.filter((n) => n.kind === "recommended");
  const minDim = Math.min(w, h);
  const rInner = minDim * 0.28;
  const rOuter = minDim * 0.42;
  const nodeR = Math.max(28, Math.min(44, minDim * 0.07));

  const out: LaidOut[] = [
    { ...center, x: cx, y: cy, r: nodeR * 1.35 },
  ];

  const place = (list: NodeSpec[], radius: number, phase: number) => {
    const n = list.length || 1;
    list.forEach((spec, i) => {
      const a = phase + (i / n) * Math.PI * 2 - Math.PI / 2;
      out.push({
        ...spec,
        x: cx + Math.cos(a) * radius,
        y: cy + Math.sin(a) * radius,
        r: nodeR * (spec.kind === "official" ? 1 : 0.88),
      });
    });
  };

  place(official, rInner, 0);
  place(recommended, rOuter, Math.PI / nOr(recommended.length, 8));

  return out;
}

function nOr(n: number, d: number) {
  return n || d;
}

export function AncestrySpace2D({ center, nodes }: Props) {
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 360, h: 420 });
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selected, setSelected] = useState<LaidOut | null>(null);
  const drag = useRef<{
    mode: "pan" | none;
    x: number;
    y: number;
    px: number;
    py: number;
    moved: boolean;
  } | null>(null);
  const pinch = useRef<{ dist: number; scale: number } | null>(null);

  type none = never;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (!cr) return;
      setSize({
        w: Math.max(280, cr.width),
        h: Math.max(340, Math.min(520, cr.width * 1.15)),
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const laid = useMemo(
    () => layoutNodes(center, nodes, size.w, size.h),
    [center, nodes, size.w, size.h],
  );

  const hitTest = useCallback(
    (clientX: number, clientY: number) => {
      const el = wrapRef.current;
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      // Inverse pan/scale: screen -> world
      const sx = clientX - rect.left;
      const sy = clientY - rect.top;
      const wx = (sx - pan.x - size.w / 2) / scale + size.w / 2;
      const wy = (sy - pan.y - size.h / 2) / scale + size.h / 2;
      // Prefer smallest distance
      let best: LaidOut | null = null;
      let bestD = Infinity;
      for (const n of laid) {
        const d = Math.hypot(wx - n.x, wy - n.y);
        const hitR = n.r + 12; // generous mobile hit area
        if (d < hitR && d < bestD) {
          bestD = d;
          best = n;
        }
      }
      return best;
    },
    [laid, pan, scale, size.w, size.h],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "touch" && (e as unknown as TouchEvent).touches) {
      /* handled via native below for multi-touch */
    }
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = {
      mode: "pan",
      x: e.clientX,
      y: e.clientY,
      px: pan.x,
      py: pan.y,
      moved: false,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    if (Math.hypot(dx, dy) > 6) drag.current.moved = true;
    setPan({
      x: drag.current.px + dx,
      y: drag.current.py + dy,
    });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.moved) return;
    const hit = hitTest(e.clientX, e.clientY);
    if (!hit) {
      setSelected(null);
      return;
    }
    setSelected(hit);
    if (hit.kind !== "center") {
      // short delay so user sees selection flash on mobile
      window.setTimeout(() => router.push(`/anime/${hit.id}`), 120);
    }
  };

  // Native touch for pinch-zoom
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const dist = (t: TouchList) =>
      Math.hypot(
        t[0].clientX - t[1].clientX,
        t[0].clientY - t[1].clientY,
      );

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        pinch.current = { dist: dist(e.touches), scale };
        drag.current = null;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinch.current) {
        e.preventDefault();
        const ratio = dist(e.touches) / pinch.current.dist;
        setScale(Math.max(0.65, Math.min(2.2, pinch.current.scale * ratio)));
      }
    };
    const onTouchEnd = () => {
      pinch.current = null;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("touchcancel", onTouchEnd);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [scale]);

  const zoomBy = (delta: number) => {
    setScale((s) => Math.max(0.65, Math.min(2.2, s + delta)));
  };

  const resetView = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
    setSelected(null);
  };

  const cx = size.w / 2;
  const cy = size.h / 2;

  return (
    <div className="ab2-shell">
      <div className="ab2-toolbar" role="toolbar" aria-label="Map controls">
        <button type="button" className="ab2-tool" onClick={() => zoomBy(0.15)} aria-label="Zoom in">
          +
        </button>
        <button type="button" className="ab2-tool" onClick={() => zoomBy(-0.15)} aria-label="Zoom out">
          −
        </button>
        <button type="button" className="ab2-tool ab2-tool-wide" onClick={resetView}>
          Reset
        </button>
      </div>

      <div
        ref={wrapRef}
        className="ab2-stage"
        style={{ height: size.h }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          drag.current = null;
        }}
        role="application"
        aria-label="Ancestry map. Drag to pan, pinch or use buttons to zoom, tap a title to open."
      >
        <svg
          className="ab2-svg"
          width={size.w}
          height={size.h}
          viewBox={`0 0 ${size.w} ${size.h}`}
        >
          <defs>
            <radialGradient id="ab2-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(240,160,144,0.25)" />
              <stop offset="100%" stopColor="rgba(240,160,144,0)" />
            </radialGradient>
            <filter id="ab2-soft">
              <feGaussianBlur stdDeviation="1.2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transformOrigin: `${cx}px ${cy}px`,
            }}
          >
            {/* ambient glow */}
            <circle cx={cx} cy={cy} r={Math.min(size.w, size.h) * 0.35} fill="url(#ab2-glow)" />

            {/* orbit guides */}
            <circle
              cx={cx}
              cy={cy}
              r={Math.min(size.w, size.h) * 0.28}
              fill="none"
              stroke="rgba(240,160,144,0.12)"
              strokeWidth={1}
              strokeDasharray="4 6"
            />
            <circle
              cx={cx}
              cy={cy}
              r={Math.min(size.w, size.h) * 0.42}
              fill="none"
              stroke="rgba(240,160,144,0.08)"
              strokeWidth={1}
              strokeDasharray="2 8"
            />

            {/* links */}
            {laid
              .filter((n) => n.kind !== "center")
              .map((n) => (
                <line
                  key={`l-${n.id}-${n.relationType}`}
                  x1={cx}
                  y1={cy}
                  x2={n.x}
                  y2={n.y}
                  stroke={edgeColor(n.kind, n.relationType)}
                  strokeWidth={n.kind === "official" ? 2 : 1.25}
                  strokeLinecap="round"
                  opacity={selected && selected.id === n.id ? 1 : 0.85}
                  filter="url(#ab2-soft)"
                />
              ))}

            {/* nodes rendered as foreignObject-free circles; posters via HTML overlay */}
          </g>
        </svg>

        {/* HTML node layer (better images + a11y on mobile) */}
        <div
          className="ab2-nodes"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: `${cx}px ${cy}px`,
            width: size.w,
            height: size.h,
          }}
        >
          {laid.map((n) => {
            const isSel = selected?.id === n.id && selected.relationType === n.relationType;
            const isCenter = n.kind === "center";
            return (
              <button
                key={`${n.kind}-${n.id}-${n.relationType}`}
                type="button"
                className={
                  "ab2-node" +
                  (isCenter ? " ab2-node-center" : "") +
                  (n.kind === "recommended" ? " ab2-node-rec" : "") +
                  (isSel ? " ab2-node-sel" : "")
                }
                style={{
                  left: n.x,
                  top: n.y,
                  width: n.r * 2,
                  height: n.r * 2,
                }}
                aria-label={
                  isCenter
                    ? `${n.title} (current)`
                    : `Open ${n.title}, ${shortLabel(n.relationType)}`
                }
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected(n);
                  if (!isCenter) router.push(`/anime/${n.id}`);
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={n.image || "https://placehold.co/120x120/1a1a1a/555?text=?"}
                  alt=""
                  draggable={false}
                />
                {!isCenter ? (
                  <span className={"ab2-chip ab2-chip-" + n.kind}>
                    {shortLabel(n.relationType)}
                  </span>
                ) : (
                  <span className="ab2-chip ab2-chip-here">Here</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="ab2-hud" aria-live="polite">
        {selected ? (
          <>
            <strong>{selected.title}</strong>
            <span>
              {["n.kind" === "x"
                ? null
                : selected.kind === "center"
                  ? "Current title"
                  : selected.relationType.replace(/_/g, " "),
                selected.year ? String(selected.year) : null,
                selected.score != null ? `★ ${selected.score.toFixed(1)}` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </span>
            {selected.kind !== "center" ? (
              <span className="ab2-hud-cta">Tap again or wait — opening…</span>
            ) : null}
          </>
        ) : (
          <span className="ab2-hint">
            Drag to pan · pinch or +/− to zoom · tap a poster to open
          </span>
        )}
      </div>

      <div className="ab2-legend">
        <span className="ab2-leg ab2-leg-off">Official</span>
        <span className="ab2-leg ab2-leg-rec">Similar</span>
      </div>
    </div>
  );
}
