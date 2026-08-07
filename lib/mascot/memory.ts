/**
 * Sprint 5 — Relationship & long-term memory (localStorage)
 *
 * Trust, affection, genre bias, and interaction counts shape decisions.
 */

const KEY = "anime_nexus_mascot_memory_v1";

export type CompanionMemory = {
  version: 1;
  /** 0–1 bond strength */
  trust: number;
  /** Cumulative pets / soft interactions */
  pets: number;
  /** Times ignored for long stretches */
  ignores: number;
  /** Seals celebrated together */
  seals: number;
  /** Genre labels → exposure weight */
  genres: Record<string, number>;
  /** Last pet / interaction timestamps */
  lastPetAt: number;
  lastSeenAt: number;
  /** Days they’ve “known” the user (approx) */
  firstSeenAt: number;
  totalSessions: number;
};

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export function defaultMemory(): CompanionMemory {
  const now = Date.now();
  return {
    version: 1,
    trust: 0.35,
    pets: 0,
    ignores: 0,
    seals: 0,
    genres: {},
    lastPetAt: 0,
    lastSeenAt: now,
    firstSeenAt: now,
    totalSessions: 1,
  };
}

export function loadMemory(): CompanionMemory {
  if (typeof window === "undefined") return defaultMemory();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultMemory();
    const parsed = JSON.parse(raw) as CompanionMemory;
    if (parsed.version !== 1) return defaultMemory();
    return { ...defaultMemory(), ...parsed };
  } catch {
    return defaultMemory();
  }
}

export function saveMemory(m: CompanionMemory) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(m));
  } catch {
    /* quota */
  }
}

let cache: CompanionMemory | null = null;

export function getMemory(): CompanionMemory {
  if (!cache) cache = loadMemory();
  return cache;
}

function commit(m: CompanionMemory) {
  cache = m;
  saveMemory(m);
  return m;
}

export function noteSessionStart() {
  const m = getMemory();
  const gap = Date.now() - (m.lastSeenAt || 0);
  // New session if away > 30 min
  if (gap > 30 * 60_000) {
    m.totalSessions += 1;
    // Slight trust decay if long absence, but recovery on return
    if (gap > 7 * 24 * 60_000) m.trust = clamp01(m.trust - 0.05);
    else m.trust = clamp01(m.trust + 0.02);
  }
  m.lastSeenAt = Date.now();
  return commit(m);
}

export function notePet() {
  const m = getMemory();
  m.pets += 1;
  m.lastPetAt = Date.now();
  m.lastSeenAt = Date.now();
  // Trust rises faster early, then slows
  const gain = 0.04 / (1 + m.pets * 0.02);
  m.trust = clamp01(m.trust + gain);
  return commit(m);
}

export function noteIgnore() {
  const m = getMemory();
  m.ignores += 1;
  m.trust = clamp01(m.trust - 0.015);
  return commit(m);
}

export function noteSeal() {
  const m = getMemory();
  m.seals += 1;
  m.trust = clamp01(m.trust + 0.05);
  m.lastSeenAt = Date.now();
  return commit(m);
}

export function noteGenres(labels: string[]) {
  if (!labels.length) return getMemory();
  const m = getMemory();
  for (const raw of labels) {
    const g = raw.toLowerCase().trim();
    if (!g) continue;
    m.genres[g] = (m.genres[g] || 0) + 1;
  }
  return commit(m);
}

/** Top genres the user has exposed the companion to */
export function topRememberedGenres(n = 5): string[] {
  const m = getMemory();
  return Object.entries(m.genres)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k]) => k);
}

/** Relationship stage for copy / behaviour bias */
export type BondStage = "stranger" | "acquaintance" | "friend" | "close";

export function bondStage(m: CompanionMemory = getMemory()): BondStage {
  if (m.trust >= 0.75 && m.pets >= 12) return "close";
  if (m.trust >= 0.55) return "friend";
  if (m.trust >= 0.4 || m.pets >= 3) return "acquaintance";
  return "stranger";
}

export function relationshipThought(): string | null {
  const m = getMemory();
  const stage = bondStage(m);
  if (stage === "stranger" && m.pets === 0) {
    return Math.random() < 0.3 ? "Who are you…?" : null;
  }
  if (stage === "close" && Math.random() < 0.25) {
    return "You’re familiar. That’s good.";
  }
  if (m.ignores > 5 && m.trust < 0.4 && Math.random() < 0.3) {
    return "Quiet desk again…";
  }
  const tops = topRememberedGenres(1);
  if (tops[0] && Math.random() < 0.2) {
    return `You linger on ${tops[0]}… noted.`;
  }
  return null;
}

/** Emotion bias from relationship */
export function memoryEmotionBias(): Partial<{
  confidence: number;
  happiness: number;
  stress: number;
  boredom: number;
}> {
  const m = getMemory();
  const stage = bondStage(m);
  switch (stage) {
    case "close":
      return { confidence: 0.12, happiness: 0.08, stress: -0.08 };
    case "friend":
      return { confidence: 0.06, happiness: 0.04, stress: -0.04 };
    case "acquaintance":
      return { confidence: 0.02 };
    default:
      return { stress: 0.05, confidence: -0.05 };
  }
}
