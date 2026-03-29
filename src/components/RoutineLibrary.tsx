import { useState } from "react";
import type { SavedRoutine } from "../utils/savedRoutinesStorage";

type Props = {
  routines: SavedRoutine[];
  currentCount: number;
  onSave: (name: string) => void;
  onLoad: (routine: SavedRoutine, mode: "append" | "replace") => void;
  onDelete: (id: string) => void;
};

export function RoutineLibrary({
  routines,
  currentCount,
  onSave,
  onLoad,
  onDelete,
}: Props) {
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);

  function handleSave() {
    const t = name.trim();
    if (!t) {
      window.alert("루틴 이름을 입력해 주세요.");
      return;
    }
    if (currentCount === 0) {
      window.alert("저장할 운동이 없어요. 먼저 오늘 일지에 운동을 추가해 주세요.");
      return;
    }
    onSave(t);
    setName("");
  }

  function handleLoad(r: SavedRoutine) {
    if (currentCount > 0) {
      const ok = window.confirm(
        "이미 오늘 일지에 운동이 있습니다. 전부 지우고 이 루틴으로 바꿀까요?\n취소하면 현재 목록 뒤에 이어서 추가합니다.",
      );
      onLoad(r, ok ? "replace" : "append");
    } else {
      onLoad(r, "append");
    }
  }

  return (
    <div className="rounded-2xl border border-slate-700/80 bg-slate-900/40 p-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-sm font-bold text-amber-200/95">내 루틴 저장 · 불러오기</span>
        <span className="text-xs text-slate-500">{open ? "접기" : "펼치기"}</span>
      </button>
      {open ? (
        <div className="mt-4 space-y-4">
          <p className="text-xs leading-relaxed text-slate-500">
            현재 날짜에 적힌 운동 목록을 이름 붙여 저장해 두었다가, 다른 날에 한 번에
            불러올 수 있어요.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <label className="min-w-0 flex-1">
              <span className="text-[11px] font-bold text-slate-500">새 루틴 이름</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 가슴·등 A 루틴"
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/35"
              />
            </label>
            <button
              type="button"
              onClick={handleSave}
              className="shrink-0 rounded-xl bg-gradient-to-r from-amber-700 to-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950"
            >
              현재 목록 저장
            </button>
          </div>
          {routines.length === 0 ? (
            <p className="text-sm text-slate-500">저장된 루틴이 없습니다.</p>
          ) : (
            <ul className="space-y-2">
              {routines.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2.5"
                >
                  <span className="min-w-0 flex-1 font-semibold text-slate-100">{r.name}</span>
                  <span className="text-xs text-slate-500">{r.items.length}종</span>
                  <button
                    type="button"
                    onClick={() => handleLoad(r)}
                    className="rounded-lg border border-amber-600/50 bg-amber-500/10 px-2.5 py-1.5 text-xs font-bold text-amber-200"
                  >
                    불러오기
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`「${r.name}」 루틴을 삭제할까요?`)) {
                        onDelete(r.id);
                      }
                    }}
                    className="rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs text-slate-400"
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
