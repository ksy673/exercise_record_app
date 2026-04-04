import { useMemo } from "react";
import type { WorkoutsByDate } from "../types";
import {
  formatLocalDateKey,
  formatShortDate,
} from "../utils/week";

export type CalendarMonth = { year: number; monthIndex: number };

type Props = {
  month: CalendarMonth;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onPickDate: (d: Date) => void;
  selectedDate: Date;
  workoutsByDate: WorkoutsByDate;
};

const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"] as const;

function monthMatrix(year: number, monthIndex: number): (Date | null)[][] {
  const first = new Date(year, monthIndex, 1);
  const startDow = first.getDay();
  const mondayOffset = startDow === 0 ? 6 : startDow - 1;
  const start = new Date(year, monthIndex, 1 - mondayOffset);
  const rows: (Date | null)[][] = [];
  let cur = new Date(start);
  for (let i = 0; i < 6; i++) {
    const row: (Date | null)[] = [];
    for (let j = 0; j < 7; j++) {
      if (cur.getMonth() !== monthIndex) {
        row.push(null);
      } else {
        row.push(new Date(cur));
      }
      cur.setDate(cur.getDate() + 1);
    }
    rows.push(row);
  }
  return rows;
}

export function HistoryCalendar({
  month,
  onPrevMonth,
  onNextMonth,
  onPickDate,
  selectedDate,
  workoutsByDate,
}: Props) {
  const matrix = useMemo(
    () => monthMatrix(month.year, month.monthIndex),
    [month.year, month.monthIndex],
  );

  const title = useMemo(
    () =>
      new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long" }).format(
        new Date(month.year, month.monthIndex, 1),
      ),
    [month.year, month.monthIndex],
  );

  const selectedKey = formatLocalDateKey(selectedDate);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onPrevMonth}
          className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-bold text-white transition hover:bg-slate-700"
        >
          ←
        </button>
        <p className="text-center text-sm font-bold text-white">{title}</p>
        <button
          type="button"
          onClick={onNextMonth}
          className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-bold text-white transition hover:bg-slate-700"
        >
          →
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {WEEKDAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="mt-2 space-y-1">
        {matrix.map((row, ri) => (
          <div key={ri} className="grid grid-cols-7 gap-1">
            {row.map((cell, ci) => {
              if (!cell) {
                return <div key={ci} className="min-h-[44px]" />;
              }
              const key = formatLocalDateKey(cell);
              const has = (workoutsByDate[key] ?? []).length > 0;
              const isSel = key === selectedKey;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onPickDate(cell)}
                  className={`flex min-h-[44px] flex-col items-center justify-center rounded-xl text-xs font-bold transition ${
                    isSel
                      ? "bg-gradient-to-br from-primary-500 to-primary-600 text-slate-950 shadow-lg shadow-primary-900/40"
                      : "text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  <span className="tabular-nums">{cell.getDate()}</span>
                  {has ? (
                    <span
                      className={`mt-0.5 h-1.5 w-1.5 rounded-full ${
                        isSel ? "bg-slate-950" : "bg-primary-500"
                      }`}
                      aria-hidden
                    />
                  ) : (
                    <span className="mt-0.5 h-1.5 w-1.5" aria-hidden />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <p className="mt-4 text-center text-xs text-zinc-500">
        선택: {formatShortDate(selectedDate)}
      </p>
    </div>
  );
}
