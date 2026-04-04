import type { RestSoundId } from "../types";
import { playRestCompleteSound } from "../utils/restSound";
import type { AppSettings, ViewMode, ThemeColor } from "../utils/appSettings";
import { REST_SOUND_OPTIONS } from "../utils/appSettings";

type Props = {
  settings: AppSettings;
  onChange: (next: AppSettings) => void;
};

export function SettingsPanel({ settings, onChange }: Props) {
  return (
    <div className="rounded-2xl border border-slate-700/80 bg-slate-900/50 p-4 backdrop-blur-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        휴식 타이머
      </p>
      <p className="mt-1 text-sm text-slate-400">
        세트 체크 시 아래 시간만큼 카운트다운합니다. 알림음은 종료·3·2·1초에 적용됩니다.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-[11px] font-bold text-slate-500">휴식 시간 (초)</span>
          <div className="mt-1.5 flex items-center gap-3">
            <input
              type="range"
              min={15}
              max={300}
              step={5}
              value={settings.restDurationSec}
              onChange={(e) =>
                onChange({
                  ...settings,
                  restDurationSec: Number(e.target.value),
                })
              }
              className="h-2 w-full flex-1 cursor-pointer accent-primary-500"
            />
            <input
              type="number"
              min={15}
              max={300}
              step={5}
              value={settings.restDurationSec}
              onChange={(e) =>
                onChange({
                  ...settings,
                  restDurationSec: Number(e.target.value),
                })
              }
              className="w-16 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-center text-sm font-bold tabular-nums text-white"
            />
          </div>
        </label>
        <label className="block">
          <span className="text-[11px] font-bold text-slate-500">알림음</span>
          <select
            value={settings.restSoundId}
            onChange={(e) =>
              onChange({
                ...settings,
                restSoundId: e.target.value as RestSoundId,
              })
            }
            className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          >
            {REST_SOUND_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button
        type="button"
        onClick={() => playRestCompleteSound(settings.restSoundId)}
        className="mt-4 w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-900"
      >
        선택한 알림음 미리듣기
      </button>

      <div className="mt-8 mb-4 border-t border-slate-700/80 pt-6">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          UI 및 테마 설정
        </p>
        <p className="mt-1 text-sm text-slate-400">
          앱의 화면 레이아웃과 컬러 테마를 자유롭게 선택하세요.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-[11px] font-bold text-slate-500">뷰 모드 (레이아웃)</span>
            <select
              value={settings.viewMode}
              onChange={(e) =>
                onChange({
                  ...settings,
                  viewMode: e.target.value as ViewMode,
                })
              }
              className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-primary-500/40"
            >
              <option value="pro">프로 모드 (상세 이미지 아코디언)</option>
              <option value="classic">클래식 모드 (압축된 심플 리스트)</option>
            </select>
          </label>

          <label className="block">
            <span className="text-[11px] font-bold text-slate-500">컬러 테마</span>
            <select
              value={settings.themeColor}
              onChange={(e) => {
                const newTheme = e.target.value as ThemeColor;
                onChange({
                  ...settings,
                  themeColor: newTheme,
                });
                document.documentElement.setAttribute("data-theme", newTheme);
              }}
              className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-primary-500/40"
            >
              <option value="amber">오리지널 다크 (Amber)</option>
              <option value="indigo">나이트 블루 (Indigo)</option>
              <option value="rose">스파르탄 레드 (Rose)</option>
              <option value="emerald">네온 그린 (Emerald)</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
