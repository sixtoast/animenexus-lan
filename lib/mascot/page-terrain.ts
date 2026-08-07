/**
 * Map the live page into a walkable 3D terrain.
 * Screen-space DOM rects → world platforms the companion can stand on.
 */

import {
  listLandmarks,
  refreshLandmarkRects,
  scanDomLandmarks,
  type Landmark,
} from "./ui-registry";

export type TerrainPlatform = {
  id: string;
  type: string;
  x: number;
  y: number;
  hw: number;
  hh: number;
  priority: number;
  /** Original DOM center for scroll-into-view */
  clientX: number;
  clientY: number;
};

export function screenToWorld(
  clientX: number,
  clientY: number,
  _scrollY: number,
): { x: number; y: number } {
  const vw = window.innerWidth || 1;
  const vh = window.innerHeight || 1;
  const aspect = vw / vh;
  // Use viewport coordinates only (platforms rebuild on scroll)
  const x = ((clientX / vw) * 2 - 1) * aspect;
  const y = -((clientY / vh) * 2 - 1);
  return { x, y };
}

export function rectToPlatform(lm: Landmark, scrollY: number): TerrainPlatform | null {
  const r = lm.rect;
  if (!r || r.width < 12 || r.height < 12) return null;
  const vw = window.innerWidth || 1;
  const vh = window.innerHeight || 1;
  // Only visible-ish rects
  if (r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw) return null;

  const aspect = vw / vh;
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const center = screenToWorld(cx, cy, scrollY);
  const hw = Math.max(0.06, (r.width / vw) * aspect * 0.9);
  const hh = Math.max(0.03, (r.height / vh) * 0.45);

  return {
    id: lm.id,
    type: lm.type,
    x: center.x,
    y: center.y,
    hw,
    hh,
    priority: lm.priority,
    clientX: cx,
    clientY: cy,
  };
}

export function buildTerrain(): TerrainPlatform[] {
  if (typeof window === "undefined") return [];
  scanDomLandmarks();

  document
    .querySelectorAll(
      "nav, header, .anime-card, .home-rail-card, .home-panel, .hero, main .container, [role='navigation'], .btn, .home-hero-actions",
    )
    .forEach((el, i) => {
      const id = el.getAttribute("data-mascot-id") || el.id || `auto-surface-${i}`;
      if (!el.getAttribute("data-mascot-landmark")) {
        const type = el.classList.contains("anime-card")
          ? "card"
          : el.tagName === "NAV" || el.getAttribute("role") === "navigation"
            ? "nav"
            : el.classList.contains("btn")
              ? "button"
              : "generic";
        el.setAttribute("data-mascot-landmark", type);
        el.setAttribute("data-mascot-id", id);
        if (!el.getAttribute("data-mascot-priority")) {
          el.setAttribute(
            "data-mascot-priority",
            type === "card" ? "5" : type === "nav" ? "3" : "2",
          );
        }
      }
    });

  scanDomLandmarks();
  refreshLandmarkRects();

  const scrollY = window.scrollY || 0;
  const out: TerrainPlatform[] = [];
  const seen = new Set<string>();
  for (const lm of listLandmarks()) {
    if (seen.has(lm.id)) continue;
    const p = rectToPlatform(lm, scrollY);
    if (p) {
      seen.add(lm.id);
      out.push(p);
    }
  }

  const aspect = window.innerWidth / (window.innerHeight || 1);
  out.push({
    id: "viewport-floor",
    type: "floor",
    x: 0,
    y: -0.88,
    hw: aspect * 0.95,
    hh: 0.06,
    priority: 0,
    clientX: window.innerWidth / 2,
    clientY: window.innerHeight - 20,
  });

  return out;
}

export function pickWanderPlatform(
  platforms: TerrainPlatform[],
  fromId?: string,
): TerrainPlatform | null {
  const candidates = platforms.filter(
    (p) => p.id !== fromId && p.type !== "floor" && p.priority >= 1,
  );
  if (!candidates.length) return platforms.find((p) => p.type !== "floor") ?? null;
  candidates.sort((a, b) => b.priority - a.priority + (Math.random() - 0.5) * 2);
  return candidates[Math.floor(Math.random() * Math.min(5, candidates.length))];
}

/** Simple hop chain: prefer intermediate platforms when far. */
export function planHops(
  from: TerrainPlatform | null,
  to: TerrainPlatform,
  platforms: TerrainPlatform[],
): TerrainPlatform[] {
  if (!from || from.id === to.id) return [to];
  const dist = Math.hypot(to.x - from.x, to.y - from.y);
  if (dist < 0.9) return [to];

  // Find a midpoint platform
  let mid: TerrainPlatform | null = null;
  let best = Infinity;
  for (const p of platforms) {
    if (p.id === from.id || p.id === to.id || p.type === "floor") continue;
    const d1 = Math.hypot(p.x - from.x, p.y - from.y);
    const d2 = Math.hypot(p.x - to.x, p.y - to.y);
    const score = d1 + d2;
    if (score < dist * 1.15 && score < best) {
      best = score;
      mid = p;
    }
  }
  return mid ? [mid, to] : [to];
}

export function scrollLandmarkIntoView(p: TerrainPlatform) {
  if (typeof document === "undefined") return;
  const el =
    document.querySelector(`[data-mascot-id="${CSS.escape(p.id)}"]`) ||
    document.getElementById(p.id);
  if (el && "scrollIntoView" in el) {
    (el as HTMLElement).scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });
  }
}
