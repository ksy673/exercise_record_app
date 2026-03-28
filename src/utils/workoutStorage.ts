import type { BodyPart, WorkoutItem, WorkoutsByDate } from "../types";

const STORAGE_KEY = "workout-routines-v2";

function isBodyPart(v: unknown): v is BodyPart {
  return (
    typeof v === "string" &&
    ["가슴", "등", "어깨", "팔", "하체", "코어", "전신", "기타"].includes(v)
  );
}

function parseItem(raw: unknown): WorkoutItem | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = typeof o.id === "string" ? o.id : null;
  const name = typeof o.name === "string" ? o.name : null;
  const bodyPart = isBodyPart(o.bodyPart) ? o.bodyPart : null;
  const setsRaw = typeof o.sets === "number" && Number.isFinite(o.sets) ? o.sets : null;
  const weightKg =
    typeof o.weightKg === "number" && Number.isFinite(o.weightKg) ? o.weightKg : null;
  const sets =
    setsRaw != null && Number.isInteger(setsRaw) && setsRaw >= 1 ? setsRaw : null;
  const completed = o.completed === true;
  if (id == null || name == null || bodyPart == null || sets == null || weightKg == null) {
    return null;
  }
  if (weightKg < 0) return null;
  return { id, bodyPart, name, sets, weightKg, completed };
}

export function loadWorkouts(): WorkoutsByDate {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const out: WorkoutsByDate = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(key) || !Array.isArray(value)) continue;
      const items = value.map(parseItem).filter((x): x is WorkoutItem => x !== null);
      if (items.length) out[key] = items;
    }
    return out;
  } catch {
    return {};
  }
}

export function saveWorkouts(state: WorkoutsByDate): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota / private mode */
  }
}
