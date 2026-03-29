const STORAGE_KEY = "workout-session-start-v1";

/** 날짜(YYYY-MM-DD) → ISO 시작 시각 */
export type SessionStartByDate = Record<string, string>;

export function loadSessionStarts(): SessionStartByDate {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const o = JSON.parse(raw) as unknown;
    if (!o || typeof o !== "object") return {};
    const out: SessionStartByDate = {};
    for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(k)) continue;
      if (typeof v === "string" && !Number.isNaN(Date.parse(v))) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

export function saveSessionStarts(s: SessionStartByDate): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

/** 해당 날짜에 시작 시각이 없으면 지금 시각으로 기록 */
export function ensureSessionStart(
  prev: SessionStartByDate,
  dateKey: string,
): SessionStartByDate {
  if (prev[dateKey]) return prev;
  return { ...prev, [dateKey]: new Date().toISOString() };
}

export function formatSessionStartLabel(iso: string): string {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("ko-KR", {
      month: "long",
      day: "numeric",
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  } catch {
    return "";
  }
}
