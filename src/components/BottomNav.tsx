import type { AppTab } from "../types";

type Props = {
  active: AppTab;
  onChange: (t: AppTab) => void;
};

const tabs: { id: AppTab; short: string }[] = [
  { id: "today", short: "오늘" },
  { id: "summary", short: "요약" },
  { id: "history", short: "기록" },
];

export function BottomNav({ active, onChange }: Props) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800 bg-slate-950/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-xl"
      aria-label="메인"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around gap-1 px-2 pt-2">
        {tabs.map((t) => {
          const on = active === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(t.id)}
              className={`flex min-h-[48px] flex-1 flex-col items-center justify-center rounded-xl px-2 py-2 text-[11px] font-bold transition sm:text-xs ${
                on ? "text-primary-400" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <span className="text-lg leading-none sm:hidden" aria-hidden>
                {t.id === "today" ? "🏋️" : t.id === "summary" ? "📊" : "📅"}
              </span>
              <span className="mt-0.5 sm:mt-0">{t.short}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
