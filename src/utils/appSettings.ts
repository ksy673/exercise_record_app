import type { RestSoundId } from "../types";

const STORAGE_KEY = "workout-app-settings-v1";

export type AppSettings = {
  restDurationSec: number;
  restSoundId: RestSoundId;
};

export const DEFAULT_SETTINGS: AppSettings = {
  restDurationSec: 90,
  restSoundId: "beep",
};

export const REST_SOUND_OPTIONS: { id: RestSoundId; label: string }[] = [
  { id: "beep", label: "짧은 비프 (기본)" },
  { id: "chime", label: "차임벨" },
  { id: "bell", label: "종소리" },
  { id: "digital", label: "디지털 비프" },
];

function clampDuration(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_SETTINGS.restDurationSec;
  return Math.min(300, Math.max(15, Math.round(n)));
}

function isRestSoundId(v: unknown): v is RestSoundId {
  return v === "beep" || v === "chime" || v === "bell" || v === "digital";
}

export function loadAppSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const o = JSON.parse(raw) as unknown;
    if (!o || typeof o !== "object") return { ...DEFAULT_SETTINGS };
    const rec = o as Record<string, unknown>;
    const restDurationSec = clampDuration(
      typeof rec.restDurationSec === "number" ? rec.restDurationSec : DEFAULT_SETTINGS.restDurationSec,
    );
    const restSoundId = isRestSoundId(rec.restSoundId)
      ? rec.restSoundId
      : DEFAULT_SETTINGS.restSoundId;
    return { restDurationSec, restSoundId };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveAppSettings(s: AppSettings): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        restDurationSec: clampDuration(s.restDurationSec),
        restSoundId: s.restSoundId,
      }),
    );
  } catch {
    /* ignore */
  }
}
