import type { WorkoutFields } from "../types";

const STORAGE_KEY = "workout-saved-routines-v1";

export type SavedRoutine = {
  id: string;
  name: string;
  createdAt: string;
  /** 템플릿 (id 없음) */
  items: WorkoutFields[];
};

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `r-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function loadSavedRoutines(): SavedRoutine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: SavedRoutine[] = [];
    for (const row of parsed) {
      if (!row || typeof row !== "object") continue;
      const o = row as Record<string, unknown>;
      const id = typeof o.id === "string" ? o.id : newId();
      const name = typeof o.name === "string" ? o.name.trim() : "";
      const createdAt =
        typeof o.createdAt === "string" ? o.createdAt : new Date().toISOString();
      const items = o.items;
      if (!name || !Array.isArray(items)) continue;
      out.push({ id, name, createdAt, items: items as WorkoutFields[] });
    }
    return out;
  } catch {
    return [];
  }
}

export function saveSavedRoutines(list: SavedRoutine[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function createRoutine(name: string, items: WorkoutFields[]): SavedRoutine {
  return {
    id: newId(),
    name: name.trim(),
    createdAt: new Date().toISOString(),
    items,
  };
}
