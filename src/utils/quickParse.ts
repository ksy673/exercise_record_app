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

/** 한 줄: `[부위] 이름 세트 무게` — 예: `벤치프레스 3 60`, `가슴 인클라인 4 40` */
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

  const wTok = tokens[tokens.length - 1]?.replace(/kg$/i, "") ?? "";
  const sTok = tokens[tokens.length - 2] ?? "";
  const sets = Number(sTok);
  const weightKg = Number(wTok);
  if (!Number.isFinite(sets) || !Number.isInteger(sets) || sets < 1) return null;
  if (!Number.isFinite(weightKg) || weightKg < 0) return null;

  const name = tokens.slice(start, -2).join(" ").trim();
  if (!name) return null;

  return { bodyPart: part, name, sets, weightKg };
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
