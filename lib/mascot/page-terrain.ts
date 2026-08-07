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
  /** World center X (horizontal) */
  x: number;
  /** World center Y (vertical — up the page) */
  y: number;
  /** Half-width / half-height in world units */
  hw: number;
  hh: number;
  /** Priority for path picks */
  priority: number;
};

/** World units: full viewport width ≈ 2 * aspect */
export function screenToWorld(
  clientX: number,
  clientY: number,
  scrollY: number,
): { x: number; y: number } {
  const vw = window.innerWidth || 1;
  const vh = window.innerHeight || 1;
  const aspect = vw / vh;
  // x: -aspect … +aspect across the viewport
  const x = ((clientX / vw) * 2 - 1) * aspect;
  // y: 0 at top of document, increases downward in screen space → flip for 3D up
  const pageY = clientY + scrollY;
  const y = -((pageY / vh) * 2 - 1) * 1.0;
  return { x, y };
}

export function rectToPlatform(lm: Landmark, scrollY: number): TerrainPlatform | null {
  const r = lm.rect;
  if (!r || r.width < 8 || r.height < 8) return null;
  const vw = window.innerWidth || 1;
  const vh = window.innerHeight || 1;
  const aspect = vw / vh;

  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const center = screenToWorld(cx, cy, scrollY);

  // Scale pixel size → world
  const hw = (r.width / vw) * aspect;
  const hh = (r.height / vh) * 1.0;

  return {
    id: lm.id,
    type: lm.type,
    x: center.x,
    y: center.y,
    hw: Math.max(0.08, hw * 0.92),
    hh: Math.max(0.04, hh * 0.5),
    priority: lm.priority,
  };
}

export function buildTerrain(): TerrainPlatform[] {
  if (typeof window === "undefined") return [];
  scanDomLandmarks();
  refreshLandmarkRects();

  // Also harvest common surfaces without data attributes
  document.querySelectorAll(
    "nav, header, .anime-card, .home-rail-card, .home-panel, .hero, main .container, [role='navigation']",
  ).forEach((el, i) => {
    const id = el.id || `auto-surface-${i}`;
    if (!el.getAttribute("data-mascot-landmark")) {
      el.setAttribute("data-mascot-landmark", el.classList.contains("anime-card") ? "card" : "generic");
      el.setAttribute("data-mascot-id", id);
    }
  });
  scanDomLandmarks();
  refreshLandmarkRects();

  const scrollY = window.scrollY || 0;
  const out: TerrainPlatform[] = [];
  for (const lm of listLandmarks()) {
    const p = rectToPlatform(lm, scrollY);
    if (p) out.push(p);
  }

  // Always include a ground strip at bottom of viewport for safety
  const aspect = window.innerWidth / (window.innerHeight || 1);
  out.push({
    id: "viewport-floor",
    type: "floor",
    x: 0,
    y: -0.85,
    hw: aspect * 0.95,
    hh: 0.08,
    priority: 0,
  });

  return out;
}

export function nearestPlatform(
  platforms: TerrainPlatform[],
  x: number,
  y: number,
): TerrainPlatform | null {
  let best: TerrainPlatform | null = null;
  let bestD = Infinity;
  for (const p of platforms) {
    const dx = Math.max(Math.abs(x - p.x) - p.hw, 0);
    const dy = Math.max(Math.abs(y - p.y) - p.hh, 0);
    const d = Math.hypot(dx, dy);
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  return best;
}

export function pickWanderPlatform(
  platforms: TerrainPlatform[],
  fromId?: string,
): TerrainPlatform | null {
  const candidates = platforms.filter(
    (p) => p.id !== fromId && p.type !== "floor" && p.priority >= 1,
  );
  if (!candidates.length) return platforms[0] ?? null;
  // Prefer higher priority + a little randomness
  candidates.sort((a, b) => b.priority - a.priority + (Math.random() - 0.5));
  return candidates[Math.floor(Math.random() * Math.min(4, candidates.length))];
}
