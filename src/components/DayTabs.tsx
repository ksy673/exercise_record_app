import type { WeekdayIndex } from "../types";

const LABELS = ["월", "화", "수", "목", "금", "토", "일"] as const;

type Props = {
  weekDates: Date[];
  selected: WeekdayIndex;
  onSelect: (day: WeekdayIndex) => void;
};

export function DayTabs({ weekDates, selected, onSelect }: Props) {
  return (
    <div className="w-full rounded-2xl border border-white/60 bg-white/55 p-2 shadow-[0_8px_30px_-8px_rgb(15_23_42/0.12)] backdrop-blur-md sm:p-2.5">
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
                  ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30 ring-1 ring-white/20"
                  : "text-slate-600 hover:bg-white/85 hover:text-slate-900 hover:shadow-sm"
              }`}
            >
              <span
                className={`text-[11px] font-bold leading-none sm:text-xs ${
                  isActive ? "text-violet-100" : "text-slate-400"
                }`}
              >
                {label}
              </span>
              <span
                className={`mt-1.5 text-[15px] font-extrabold tabular-nums leading-none sm:mt-2 sm:text-lg ${
                  isActive ? "text-white" : "text-slate-800"
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
