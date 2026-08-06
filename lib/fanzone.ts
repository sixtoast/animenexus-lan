const CONFESS_KEY = "anime_nexus_confessions_v1";
const BINGO_KEY = "anime_nexus_bingo_v1";

const TROPES = [
  "Found family",
  "Training arc",
  "Rival becomes friend",
  "Festival episode",
  "Amnesia",
  "Power of friendship",
  "Beach episode",
  "Tournament arc",
  "Time skip",
  "Unreliable narrator",
  "Slow burn",
  "Betrayal",
  "Mentor falls",
  "Food montage",
  "OP spoiler",
  "ED tears",
  "Chibi interlude",
  "Dream sequence",
  "Masked identity",
  "Last episode twist",
  "Cameo cameo",
  "Rain confession",
  "School festival",
  "Chosen one",
  "Anti-hero turn",
];

export type Confession = {
  id: string;
  text: string;
  at: string;
};

export function readConfessions(): Confession[] {
  if (typeof window === "undefined") return [];
  try {
    const j = JSON.parse(localStorage.getItem(CONFESS_KEY) || "[]");
    return Array.isArray(j) ? j : [];
  } catch {
    return [];
  }
}

export function addConfession(text: string): Confession[] {
  const t = text.trim().slice(0, 280);
  if (!t) return readConfessions();
  const next = [
    { id: `${Date.now()}`, text: t, at: new Date().toISOString() },
    ...readConfessions(),
  ].slice(0, 40);
  localStorage.setItem(CONFESS_KEY, JSON.stringify(next));
  return next;
}

export type BingoBoard = {
  cells: string[];
  marked: boolean[];
  createdAt: string;
};

export function readBingo(): BingoBoard | null {
  if (typeof window === "undefined") return null;
  try {
    const j = JSON.parse(localStorage.getItem(BINGO_KEY) || "null");
    if (!j?.cells?.length) return null;
    return j as BingoBoard;
  } catch {
    return null;
  }
}

export function newBingo(): BingoBoard {
  const shuffled = [...TROPES].sort(() => Math.random() - 0.5);
  const cells = shuffled.slice(0, 24);
  cells.splice(12, 0, "FREE");
  const board: BingoBoard = {
    cells,
    marked: cells.map((c) => c === "FREE"),
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(BINGO_KEY, JSON.stringify(board));
  return board;
}

export function toggleBingo(i: number): BingoBoard | null {
  const b = readBingo();
  if (!b || i < 0 || i >= b.cells.length || b.cells[i] === "FREE") return b;
  b.marked[i] = !b.marked[i];
  localStorage.setItem(BINGO_KEY, JSON.stringify(b));
  return b;
}
