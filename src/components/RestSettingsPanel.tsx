import type { RestSoundId } from "../types";
import { playRestCompleteSound } from "../utils/restSound";
import type { AppSettings } from "../utils/appSettings";
import { REST_SOUND_OPTIONS } from "../utils/appSettings";

type Props = {
  settings: AppSettings;
  onChange: (next: AppSettings) => void;
};

export function RestSettingsPanel({ settings, onChange }: Props) {
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
              className="h-2 w-full flex-1 cursor-pointer accent-amber-500"
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
            className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
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
    </div>
  );
}
