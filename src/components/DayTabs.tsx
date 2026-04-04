import type { WeekdayIndex } from "../types";

const LABELS = ["월", "화", "수", "목", "금", "토", "일"] as const;

type Props = {
  weekDates: Date[];
  selected: WeekdayIndex;
  onSelect: (day: WeekdayIndex) => void;
};

export function DayTabs({ weekDates, selected, onSelect }: Props) {
  return (
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/50 p-2 backdrop-blur-md sm:p-2.5">
      <div className="grid w-full grid-cols-7 gap-1.5 sm:gap-2.5">
        {LABELS.map((label, index) => {
          const day = index as WeekdayIndex;
          const isActive = selected === day;
          const d = weekDates[index];
          const dateNum = d.getDate();
          return (
            <button
              key={label}
              type="button"
              onClick={() => onSelect(day)}
              className={`flex min-w-0 flex-col items-center justify-center rounded-xl px-0.5 py-2.5 text-center transition-all duration-200 sm:py-3 ${
                isActive
                  ? "bg-gradient-to-br from-primary-600 to-primary-500 text-slate-950 shadow-lg shadow-primary-900/30 ring-1 ring-white/10"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              }`}
            >
              <span
                className={`text-[11px] font-bold leading-none sm:text-xs ${
                  isActive ? "text-primary-950/80" : "text-slate-500"
                }`}
              >
                {label}
              </span>
              <span
                className={`mt-1.5 text-[15px] font-extrabold tabular-nums leading-none sm:mt-2 sm:text-lg ${
                  isActive ? "text-slate-950" : "text-slate-200"
                }`}
              >
                {dateNum}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
