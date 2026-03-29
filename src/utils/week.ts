import type { WeekdayIndex } from "../types";

/** 기준일이 속한 주의 월요일 00:00:00 (로컬 타임) */
export function startOfIsoWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + mondayOffset);
  return d;
}

/** 월~일 7일의 Date 배열 */
export function getWeekDates(anchorDate: Date): Date[] {
  const monday = startOfIsoWeek(anchorDate);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(monday);
    x.setDate(monday.getDate() + i);
    return x;
  });
}

export function formatShortDate(d: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).format(d);
}

/** 로컬 기준 YYYY-MM-DD (스토리지 키) */
export function formatLocalDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function weekdayIndexFromDate(d: Date): WeekdayIndex {
  const day = d.getDay();
  if (day === 0) return 6;
  return (day - 1) as WeekdayIndex;
}

/** reference 주 대비 target이 몇 주 앞/뒤인지 */
export function weekOffsetBetween(target: Date, reference: Date): number {
  const tMon = startOfIsoWeek(target).getTime();
  const rMon = startOfIsoWeek(reference).getTime();
  return Math.round((tMon - rMon) / (7 * 24 * 60 * 60 * 1000));
}
