import type { RestSoundId } from "../types";

const STORAGE_KEY = "workout-app-settings-v1";

export type ViewMode = "pro" | "classic";
export type ThemeColor = "amber" | "indigo" | "rose" | "emerald";

export type AppSettings = {
  restDurationSec: number;
  restSoundId: RestSoundId;
  viewMode: ViewMode;
  themeColor: ThemeColor;
};

export const DEFAULT_SETTINGS: AppSettings = {
  restDurationSec: 90,
  restSoundId: "beep",
  viewMode: "pro",
  themeColor: "amber",
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

function isViewMode(v: unknown): v is ViewMode {
  return v === "pro" || v === "classic";
}

function isThemeColor(v: unknown): v is ThemeColor {
  return v === "amber" || v === "indigo" || v === "rose" || v === "emerald";
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
      
    const viewMode = isViewMode(rec.viewMode) ? rec.viewMode : DEFAULT_SETTINGS.viewMode;
    const themeColor = isThemeColor(rec.themeColor) ? rec.themeColor : DEFAULT_SETTINGS.themeColor;
      
    return { restDurationSec, restSoundId, viewMode, themeColor };
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
        viewMode: s.viewMode,
        themeColor: s.themeColor,
      }),
    );
  } catch {
    /* ignore */
  }
}
