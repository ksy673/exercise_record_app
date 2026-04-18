import { useState } from "react";
import type { SavedRoutine } from "../utils/savedRoutinesStorage";
import { RoutineBuilderModal } from "./RoutineBuilderModal";
import type { WorkoutFields } from "../types";

type Props = {
  routines: SavedRoutine[];
  currentCount: number;
  onLoad: (routine: SavedRoutine, mode: "append" | "replace") => void;
  onDelete: (id: string) => void;
  onCreateCustomRoutine: (name: string, items: WorkoutFields[]) => void;
};

export function RoutineLibrary({
  routines,
  currentCount,
  onLoad,
  onDelete,
  onCreateCustomRoutine,
}: Props) {
  const [open, setOpen] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);

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
        <span className="text-sm font-bold text-primary-200/95">내 루틴 저장 · 불러오기</span>
        <span className="text-xs text-slate-500">{open ? "접기" : "펼치기"}</span>
      </button>
      {open ? (
        <div className="mt-4 space-y-4">
          <p className="text-xs leading-relaxed text-slate-500">
            현재 날짜에 적힌 운동 목록을 이름 붙여 저장해 두었다가, 다른 날에 한 번에
            불러올 수 있어요.
          </p>
          <div className="mb-4 text-left">
            <button
               type="button"
               onClick={() => setBuilderOpen(true)}
               className="w-full sm:w-auto rounded-xl border border-primary-500/50 bg-primary-900/30 px-4 py-2.5 text-sm font-bold text-primary-300 transition hover:bg-primary-900/50"
             >
               ➕ 새 커스텀 루틴 만들기
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
                    className="rounded-lg border border-primary-600/50 bg-primary-500/10 px-2.5 py-1.5 text-xs font-bold text-primary-200"
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
      {builderOpen && (
        <RoutineBuilderModal
          onClose={() => setBuilderOpen(false)}
          onSave={(newName, items) => {
            onCreateCustomRoutine(newName, items);
            setBuilderOpen(false);
          }}
        />
      )}
    </div>
  );
}
