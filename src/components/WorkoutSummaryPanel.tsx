import type { WorkoutItem } from "../types";
import { sessionStatsForItems } from "../utils/workoutStats";
import { SetRowsWithCheckboxes } from "./SetRowsWithCheckboxes";

type Props = {
  dateLabel: string;
  items: WorkoutItem[];
};

export function WorkoutSummaryPanel({ dateLabel, items }: Props) {
  const stats = sessionStatsForItems(items);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-6 py-14 text-center">
        <p className="text-sm font-semibold text-slate-400">이 날짜에는 기록이 없어요</p>
        <p className="mt-2 text-xs text-slate-500">오늘 탭에서 운동을 추가해 보세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-3 py-4 text-center sm:px-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            볼륨
          </p>
          <p className="mt-1.5 text-lg font-extrabold tabular-nums text-white sm:text-xl">
            {Math.round(stats.volumeKg).toLocaleString()}
            <span className="ml-0.5 text-xs font-bold text-slate-500">kg</span>
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-3 py-4 text-center sm:px-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            총 횟수
          </p>
          <p className="mt-1.5 text-lg font-extrabold tabular-nums text-white sm:text-xl">
            {stats.totalReps}
            <span className="ml-0.5 text-xs font-bold text-slate-500">회</span>
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-3 py-4 text-center sm:px-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            세트
          </p>
          <p className="mt-1.5 text-lg font-extrabold tabular-nums text-white sm:text-xl">
            {stats.totalSets}
          </p>
        </div>
      </div>

      <div>
        <p className="mt-1 text-xs font-semibold text-slate-500">{dateLabel}</p>
        <p className="text-lg font-bold text-white">운동 세트 요약</p>
        <ul className="mt-4 space-y-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl border border-slate-800 bg-black/40 px-4 py-4"
            >
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                  {item.bodyPart}
                </span>
                <span className="text-base font-bold text-white">{item.name}</span>
              </div>
              <div className="mt-3">
                <SetRowsWithCheckboxes sets={item.setEntries} readOnly />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
