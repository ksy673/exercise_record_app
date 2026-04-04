type Props = {
  secondsLeft: number;
  /** 이번 휴식에 사용한 총 초 (진행 막대용) */
  totalSeconds: number;
  /** 마지막 3초 구간 강조 */
  urgent?: boolean;
};

function formatMmSs(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function RestTimerBar({ secondsLeft, totalSeconds, urgent }: Props) {
  const total = Math.max(1, totalSeconds);
  const pct = Math.min(100, Math.max(0, (secondsLeft / total) * 100));

  return (
    <div
      className={`fixed bottom-16 left-0 right-0 z-50 border-t px-4 pt-4 text-white shadow-[0_-12px_40px_-8px_rgb(0_0_0/0.5)] transition-colors duration-300 sm:px-8 lg:px-10 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] ${
        urgent
          ? "border-primary-500/40 bg-gradient-to-r from-primary-950/90 via-slate-950 to-primary-950/90"
          : "border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950"
      }`}
      role="status"
      aria-live="polite"
      aria-label={`휴식 타이머 ${formatMmSs(secondsLeft)} 남음`}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-400/40 to-transparent"
        aria-hidden
      />
      <div className="mx-auto flex w-full max-w-2xl items-center gap-4 lg:max-w-3xl">
        <div
          className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ring-1 ${
            urgent
              ? "animate-pulse bg-primary-500/25 ring-primary-400/40"
              : "bg-primary-500/15 ring-primary-500/30"
          }`}
        >
          <span className="text-xl" aria-hidden>
            ⏱
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            휴식 타이머
            {urgent ? (
              <span className="ml-2 rounded-md bg-primary-500/90 px-1.5 py-0.5 text-[9px] font-extrabold tracking-normal text-slate-900">
                3초 알림 중
              </span>
            ) : null}
          </p>
          <p
            className={`mt-0.5 text-3xl font-extrabold tabular-nums tracking-tight ${
              urgent ? "text-primary-200" : "text-white"
            }`}
          >
            {formatMmSs(secondsLeft)}
          </p>
        </div>
        <div className="hidden w-px self-stretch bg-white/10 sm:block" aria-hidden />
        <div className="hidden w-28 sm:block">
          <div className="h-2.5 overflow-hidden rounded-full bg-black/40 ring-1 ring-white/10">
            <div
              className={`h-full rounded-full shadow-[0_0_12px_rgb(251_191_36/0.35)] transition-[width] duration-1000 ease-linear ${
                urgent
                  ? "bg-gradient-to-r from-primary-400 via-orange-400 to-red-400"
                  : "bg-gradient-to-r from-primary-600 via-primary-400 to-cyan-500"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-1.5 text-right text-[10px] font-medium text-slate-500">
            {total}초 중
          </p>
        </div>
      </div>
      <div className="mx-auto mt-3 w-full max-w-2xl sm:hidden lg:max-w-3xl">
        <div className="h-2 overflow-hidden rounded-full bg-black/40 ring-1 ring-white/10">
          <div
            className={`h-full transition-[width] duration-1000 ease-linear ${
              urgent
                ? "bg-gradient-to-r from-primary-400 via-orange-400 to-red-400"
                : "bg-gradient-to-r from-primary-600 via-primary-400 to-cyan-500"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
