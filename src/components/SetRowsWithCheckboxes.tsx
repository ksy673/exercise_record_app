import type { SetEntry } from "../types";

type Props = {
  sets: SetEntry[];
  /** 세트 체크 시 호출 (완료 토글) */
  onToggleSet?: (setIndex: number) => void;
  readOnly?: boolean;
};

export function SetRowsWithCheckboxes({ sets, onToggleSet, readOnly }: Props) {
  return (
    <ul className="mt-2 space-y-2">
      {sets.map((s, i) => {
        const done = s.done === true;
        return (
          <li
            key={i}
            className={`flex items-center gap-3 rounded-xl border px-2 py-2 sm:px-3 ${
              done
                ? "border-primary-500/35 bg-primary-950/25"
                : "border-slate-700/80 bg-slate-900/50"
            }`}
          >
            <label className="flex shrink-0 cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={done}
                disabled={readOnly || !onToggleSet}
                onChange={() => onToggleSet?.(i)}
                className="size-5 rounded border-slate-500 bg-slate-900 text-primary-500 accent-primary-500 focus:ring-2 focus:ring-primary-500/40 disabled:cursor-default disabled:opacity-60"
                aria-label={`${i + 1}세트 완료`}
              />
              <span className="w-9 text-[11px] font-bold tabular-nums text-slate-500">
                {i + 1}세트
              </span>
            </label>
            <div className="flex min-w-0 flex-1 items-center justify-end gap-2 text-sm sm:justify-start">
              <span
                className={`tabular-nums font-bold ${
                  done ? "text-primary-200/90 line-through decoration-slate-500" : "text-slate-100"
                }`}
              >
                {s.weightKg % 1 === 0 ? String(s.weightKg) : s.weightKg.toFixed(1)}kg
              </span>
              <span className="text-slate-600">×</span>
              <span
                className={`tabular-nums font-semibold ${
                  done ? "text-slate-500 line-through" : "text-slate-300"
                }`}
              >
                {s.reps}회
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
