import type { BodyPart, SetEntry, WorkoutItem, WorkoutsByDate } from "../types";

const STORAGE_KEY_V3 = "workout-routines-v3";
const STORAGE_KEY_V2 = "workout-routines-v2";

const DEFAULT_REPS = 10;

function isBodyPart(v: unknown): v is BodyPart {
  return (
    typeof v === "string" &&
    ["가슴", "등", "어깨", "팔", "하체", "코어", "전신", "기타"].includes(v)
  );
}

function parseSetEntry(raw: unknown): SetEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const weightKg =
    typeof o.weightKg === "number" && Number.isFinite(o.weightKg) ? o.weightKg : null;
  const reps = typeof o.reps === "number" && Number.isFinite(o.reps) ? o.reps : null;
  if (weightKg == null || reps == null) return null;
  if (weightKg < 0 || reps < 1 || !Number.isInteger(reps)) return null;
  const done = o.done === true;
  return { weightKg, reps, ...(done ? { done: true } : {}) };
}

/** v3 형식 */
function parseItemV3(raw: unknown): WorkoutItem | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = typeof o.id === "string" ? o.id : null;
  const name = typeof o.name === "string" ? o.name : null;
  const bodyPart = isBodyPart(o.bodyPart) ? o.bodyPart : null;
  const completed = o.completed === true;
  if (id == null || name == null || bodyPart == null) return null;

  const entriesRaw = o.setEntries;
  if (!Array.isArray(entriesRaw)) return null;
  const setEntries = entriesRaw.map(parseSetEntry).filter((x): x is SetEntry => x !== null);
  if (setEntries.length === 0) return null;

  return { id, bodyPart, name, setEntries, completed };
}

/** v2 → WorkoutItem (setEntries 생성) */
function migrateFromV2(raw: unknown): WorkoutItem | null {
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
  const setEntries: SetEntry[] = Array.from({ length: sets }, () => ({
    weightKg,
    reps: DEFAULT_REPS,
    ...(completed ? { done: true } : {}),
  }));
  return { id, bodyPart, name, setEntries, completed };
}

function parseV2Payload(parsed: unknown): WorkoutsByDate {
  if (!parsed || typeof parsed !== "object") return {};
  const out: WorkoutsByDate = {};
  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key) || !Array.isArray(value)) continue;
    const items = value
      .map(migrateFromV2)
      .filter((x): x is WorkoutItem => x !== null);
    if (items.length) out[key] = items;
  }
  return out;
}

function loadRaw(): WorkoutsByDate {
  try {
    const v3 = localStorage.getItem(STORAGE_KEY_V3);
    if (v3) {
      const parsed = JSON.parse(v3) as unknown;
      if (!parsed || typeof parsed !== "object") return {};
      const out: WorkoutsByDate = {};
      for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(key) || !Array.isArray(value)) continue;
        const items = value.map(parseItemV3).filter((x): x is WorkoutItem => x !== null);
        if (items.length) out[key] = items;
      }
      return out;
    }

    const v2 = localStorage.getItem(STORAGE_KEY_V2);
    if (v2) {
      const parsed = JSON.parse(v2) as unknown;
      const migrated = parseV2Payload(parsed);
      if (Object.keys(migrated).length > 0) {
        try {
          localStorage.setItem(STORAGE_KEY_V3, JSON.stringify(migrated));
        } catch {
          /* ignore */
        }
      }
      return migrated;
    }
    return {};
  } catch {
    return {};
  }
}

export function loadWorkouts(): WorkoutsByDate {
  return loadRaw();
}

export function saveWorkouts(state: WorkoutsByDate): void {
  try {
    localStorage.setItem(STORAGE_KEY_V3, JSON.stringify(state));
  } catch {
    /* ignore quota / private mode */
  }
}
