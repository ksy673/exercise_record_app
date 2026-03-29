import type { BodyPart, WorkoutFields } from "../types";

const PARTS: readonly BodyPart[] = [
  "가슴",
  "등",
  "어깨",
  "팔",
  "하체",
  "코어",
  "전신",
  "기타",
] as const;

const DEFAULT_REPS = 10;

function allNumericStrings(ss: string[]): boolean {
  return ss.every((s) => {
    const n = Number(s.replace(/kg$/i, ""));
    return Number.isFinite(n);
  });
}

/**
 * 한 줄: `[부위] 이름 … 세트 무게` 또는 `[부위] 이름 … 세트 무게 횟수`
 * 예: `벤치프레스 3 60`, `가슴 인클라인 4 40 12`
 */
export function parseQuickLine(line: string): WorkoutFields | null {
  const t = line.trim();
  if (!t || t.startsWith("#") || t.startsWith("//")) return null;

  const tokens = t.split(/\s+/).filter(Boolean);
  if (tokens.length < 3) return null;

  let part: BodyPart = "가슴";
  let start = 0;
  if (tokens[0] && PARTS.includes(tokens[0] as BodyPart)) {
    part = tokens[0] as BodyPart;
    start = 1;
  }

  const tail = tokens.slice(start);
  if (tail.length < 3) return null;

  let sets: number;
  let weightKg: number;
  let reps: number;
  let nameTokens: string[];

  const last3 = tail.slice(-3).map((x) => x.replace(/kg$/i, ""));
  const last2 = tail.slice(-2).map((x) => x.replace(/kg$/i, ""));

  if (
    tail.length >= 4 &&
    allNumericStrings(last3) &&
    Number.isInteger(Number(last3[0])) &&
    Number(last3[0]) >= 1
  ) {
    sets = Number(last3[0]);
    weightKg = Number(last3[1]);
    reps = Number(last3[2]);
    nameTokens = tail.slice(0, -3);
  } else if (allNumericStrings(last2)) {
    sets = Number(last2[0]);
    weightKg = Number(last2[1]);
    reps = DEFAULT_REPS;
    nameTokens = tail.slice(0, -2);
  } else {
    return null;
  }

  if (!Number.isFinite(sets) || !Number.isInteger(sets) || sets < 1) return null;
  if (!Number.isFinite(weightKg) || weightKg < 0) return null;
  if (!Number.isFinite(reps) || !Number.isInteger(reps) || reps < 1) return null;

  const name = nameTokens.join(" ").trim();
  if (!name) return null;

  const setEntries = Array.from({ length: sets }, () => ({ weightKg, reps }));
  return { bodyPart: part, name, setEntries };
}

/** 여러 줄 붙여넣기 → 유효한 항목만 */
export function parsePastedWorkoutText(text: string): WorkoutFields[] {
  const lines = text.split(/\r?\n/);
  const out: WorkoutFields[] = [];
  for (const line of lines) {
    const row = parseQuickLine(line);
    if (row) out.push(row);
  }
  return out;
}
