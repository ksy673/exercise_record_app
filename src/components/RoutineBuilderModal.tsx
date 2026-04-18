import { useState, type FormEvent } from "react";
import { EXERCISES_BY_PART } from "../data/exerciseSuggestions";
import { BODY_PART_OPTIONS, type BodyPart, type WorkoutFields, type SetEntry } from "../types";

type Props = {
  onClose: () => void;
  onSave: (name: string, items: WorkoutFields[]) => void;
};

const labelCn = "block text-[11px] font-bold uppercase tracking-wider text-slate-500";
const inputCn =
  "mt-1.5 w-full rounded-xl border-0 bg-slate-900 px-3.5 py-2.5 text-sm text-slate-100 shadow-inner ring-1 ring-slate-700 transition placeholder:text-slate-500 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/40";
const btnPrimary =
  "rounded-xl bg-gradient-to-r from-primary-700 to-primary-500 px-4 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-primary-900/25 transition hover:brightness-110 active:scale-[0.99]";
const btnGhost =
  "rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800";
const chipCn =
  "rounded-full border border-slate-600 bg-slate-900 px-3 py-1.5 text-left text-xs font-semibold text-slate-100 transition hover:border-primary-500/40 hover:bg-slate-800 active:scale-[0.98]";

function defaultSetRows(): { weightKg: string; reps: string }[] {
  return [
    { weightKg: "60", reps: "10" },
    { weightKg: "60", reps: "10" },
    { weightKg: "60", reps: "10" },
  ];
}

export function RoutineBuilderModal({ onClose, onSave }: Props) {
  const [routineName, setRoutineName] = useState("");
  const [items, setItems] = useState<WorkoutFields[]>([]);

  // Draft exercise states
  const [bodyPart, setBodyPart] = useState<BodyPart>("가슴");
  const [name, setName] = useState("");
  const [setRows, setSetRows] = useState(defaultSetRows());
  const [addError, setAddError] = useState<string | null>(null);

  function handleAddExercise(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setAddError("운동 이름을 입력해 주세요.");
      return;
    }
    if (setRows.length === 0) {
      setAddError("세트를 1개 이상 추가해 주세요.");
      return;
    }
    const parsedSets: SetEntry[] = [];
    for (let i = 0; i < setRows.length; i++) {
      const w = Number(String(setRows[i].weightKg).trim());
      const r = Number(String(setRows[i].reps).trim());
      if (!Number.isFinite(w) || w < 0) {
        setAddError(`${i + 1}세트 무게가 올바르지 않아요.`);
        return;
      }
      if (!Number.isFinite(r) || !Number.isInteger(r) || r < 1) {
        setAddError(`${i + 1}세트 횟수는 1 이상 정수여야 해요.`);
        return;
      }
      parsedSets.push({ weightKg: w, reps: r });
    }

    setItems((prev) => [
      ...prev,
      { bodyPart, name: trimmed, setEntries: parsedSets },
    ]);
    setName("");
    setSetRows(defaultSetRows());
    setAddError(null);
  }

  function handleSaveRoutine() {
    const rName = routineName.trim();
    if (!rName) {
      window.alert("루틴 이름을 상단에 입력해 주세요.");
      return;
    }
    if (items.length === 0) {
      window.alert("최소 1개 이상의 운동을 추가해 주세요.");
      return;
    }
    onSave(rName, items);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-900/90 py-4 px-6 backdrop-blur">
          <h2 className="text-xl font-bold text-white">직접 루틴 짜기</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-slate-400 hover:text-white"
          >
            &times;
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Routine Name Input */}
          <div>
            <label className={labelCn}>
              새 루틴 이름
              <input
                type="text"
                value={routineName}
                onChange={(e) => setRoutineName(e.target.value)}
                placeholder="예: 월요일 가슴/삼두 루틴"
                className={`${inputCn} font-semibold text-lg py-3`}
              />
            </label>
          </div>

          {/* List of currently added items */}
          {items.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="mb-3 text-sm font-bold text-slate-300">추가된 운동들</p>
              <ul className="space-y-3">
                {items.map((it, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between rounded-xl bg-slate-900 p-3 border border-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                        {it.bodyPart}
                      </span>
                      <span className="font-bold text-slate-100">{it.name}</span>
                      <span className="text-xs font-semibold text-slate-500">
                        {it.setEntries.length}세트
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setItems((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="text-xs text-red-500 hover:text-red-400"
                    >
                      삭제
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Form to add an exercise */}
          <form
            onSubmit={handleAddExercise}
            className="rounded-2xl border border-slate-700 bg-slate-800/30 p-5 space-y-4"
          >
            <p className="text-sm font-bold text-slate-200">새 운동 추가</p>
            {addError && (
              <p className="text-xs text-red-400 font-medium bg-red-950/30 p-2 rounded-lg">
                {addError}
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className={labelCn}>
                부위
                <select
                  value={bodyPart}
                  onChange={(e) => setBodyPart(e.target.value as BodyPart)}
                  className={inputCn}
                >
                  {BODY_PART_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
              <label className={`${labelCn} sm:col-span-1 lg:col-span-2`}>
                운동 이름
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 인클라인 벤치프레스"
                  className={inputCn}
                />
              </label>
            </div>

            <div className="mt-3 flex max-h-[120px] flex-wrap gap-2 overflow-y-auto">
              {EXERCISES_BY_PART[bodyPart].map((ex) => (
                <button
                  key={ex}
                  type="button"
                  className={chipCn}
                  onClick={() => setName(ex)}
                >
                  {ex}
                </button>
              ))}
            </div>

            <div className="my-4 border-t border-slate-700/50 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <p className="text-xs font-bold uppercase text-slate-500">세트 구성</p>
                <button
                  type="button"
                  className={btnGhost}
                  onClick={() =>
                    setSetRows((r) => [...r, { weightKg: "60", reps: "10" }])
                  }
                >
                  + 세트 추가
                </button>
              </div>
              <ul className="space-y-2">
                {setRows.map((row, i) => (
                  <li
                    key={i}
                    className="grid grid-cols-[1fr_1fr_auto] items-end gap-2"
                  >
                    <label className={labelCn}>
                      {i + 1}세트 kg
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        value={row.weightKg}
                        onChange={(e) => {
                          const v = e.target.value;
                          setSetRows((rows) =>
                            rows.map((x, j) => (j === i ? { ...x, weightKg: v } : x))
                          );
                        }}
                        className={inputCn}
                      />
                    </label>
                    <label className={labelCn}>
                      횟수
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={row.reps}
                        onChange={(e) => {
                          const v = e.target.value;
                          setSetRows((rows) =>
                            rows.map((x, j) => (j === i ? { ...x, reps: v } : x))
                          );
                        }}
                        className={inputCn}
                      />
                    </label>
                    <button
                      type="button"
                      disabled={setRows.length <= 1}
                      onClick={() =>
                        setSetRows((rows) => rows.filter((_, j) => j !== i))
                      }
                      className="mb-0.5 rounded-lg border border-slate-700 px-2 py-2 text-xs font-bold text-slate-400 disabled:opacity-30"
                    >
                      삭제
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <button type="submit" className={`${btnGhost} w-full py-3 hover:bg-slate-700`}>
              ↑ 루틴에 이 운동 넣기
            </button>
          </form>

        </div>

        <div className="sticky bottom-0 border-t border-slate-800 bg-slate-900/90 p-4 backdrop-blur flex gap-3">
          <button type="button" onClick={onClose} className={`${btnGhost} flex-1`}>
            취소
          </button>
          <button
            type="button"
            onClick={handleSaveRoutine}
            className={`${btnPrimary} flex-1`}
          >
            루틴 저장 완성
          </button>
        </div>
      </div>
    </div>
  );
}
