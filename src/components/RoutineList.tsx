import { useState, type FormEvent } from "react";
import { EXERCISES_BY_PART } from "../data/exerciseSuggestions";
import {
  BODY_PART_OPTIONS,
  type BodyPart,
  type SetEntry,
  type WorkoutFields,
  type WorkoutItem,
} from "../types";
import { parsePastedWorkoutText } from "../utils/quickParse";
import { formatShortDate } from "../utils/week";
import type { SavedRoutine } from "../utils/savedRoutinesStorage";
import type { ViewMode } from "../utils/appSettings";
import { ExerciseVideoThumb } from "./ExerciseVideoThumb";
import { RoutineLibrary } from "./RoutineLibrary";
import { SetRowsWithCheckboxes } from "./SetRowsWithCheckboxes";
import { ProgressChartModal } from "./ProgressChartModal";
import { getLastWorkoutSets, getChartDataForExercise } from "../utils/workoutAnalytics";

type Props = {
  date: Date;
  items: WorkoutItem[];
  workoutsByDate: Record<string, WorkoutItem[]>;
  viewMode: ViewMode;
  sessionStartLabel: string | null;
  savedRoutines: SavedRoutine[];
  onLoadRoutine: (routine: SavedRoutine, mode: "append" | "replace") => void;
  onDeleteRoutine: (id: string) => void;
  onCreateCustomRoutine: (name: string, items: WorkoutFields[]) => void;
  onAdd: (item: WorkoutFields) => void;
  onAddBatch: (items: WorkoutFields[]) => void;
  onUpdate: (id: string, item: WorkoutFields) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
  onToggleSet: (id: string, setIndex: number) => void;
};

const labelCn =
  "block text-[11px] font-bold uppercase tracking-wider text-slate-500";
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

function parseSetRows(
  rows: { weightKg: string; reps: string }[],
): { ok: true; value: SetEntry[] } | { ok: false; message: string } {
  if (rows.length < 1) {
    return { ok: false, message: "세트를 1개 이상 추가해 주세요." };
  }
  const out: SetEntry[] = [];
  for (let i = 0; i < rows.length; i++) {
    const w = Number(String(rows[i].weightKg).trim());
    const r = Number(String(rows[i].reps).trim());
    if (!Number.isFinite(w) || w < 0) {
      return { ok: false, message: `${i + 1}세트 무게(kg)가 올바르지 않아요.` };
    }
    if (!Number.isFinite(r) || !Number.isInteger(r) || r < 1) {
      return { ok: false, message: `${i + 1}세트 횟수는 1 이상 정수여야 해요.` };
    }
    out.push({ weightKg: w, reps: r });
  }
  return { ok: true, value: out };
}

function parseWorkoutFieldsOrExplain(
  bodyPart: BodyPart,
  name: string,
  rows: { weightKg: string; reps: string }[],
): { ok: true; value: WorkoutFields } | { ok: false; message: string } {
  const trimmed = name.trim();
  if (!trimmed) {
    return { ok: false, message: "운동 이름을 입력해 주세요." };
  }
  const sets = parseSetRows(rows);
  if (!sets.ok) return sets;
  return { ok: true, value: { bodyPart, name: trimmed, setEntries: sets.value } };
}

type AddMode = "detail" | "quick";

export function RoutineList({
  date,
  items,
  workoutsByDate,
  viewMode,
  sessionStartLabel,
  savedRoutines,
  onLoadRoutine,
  onDeleteRoutine,
  onCreateCustomRoutine,
  onAdd,
  onAddBatch,
  onUpdate,
  onDelete,
  onToggleComplete,
  onToggleSet,
}: Props) {
  const [addMode, setAddMode] = useState<AddMode>("detail");
  const [quickText, setQuickText] = useState("");

  const [bodyPart, setBodyPart] = useState<BodyPart>("가슴");
  const [name, setName] = useState("");
  const [setRows, setSetRows] = useState(defaultSetRows);
  const [addError, setAddError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBodyPart, setEditBodyPart] = useState<BodyPart>("가슴");
  const [editName, setEditName] = useState("");
  const [editRows, setEditRows] = useState(defaultSetRows());
  const [editError, setEditError] = useState<string | null>(null);

  const [expandedItemIds, setExpandedItemIds] = useState<Set<string>>(new Set());
  const [chartExercise, setChartExercise] = useState<string | null>(null);

  function toggleExpand(id: string) {
    setExpandedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function beginEdit(item: WorkoutItem) {
    setEditingId(item.id);
    setEditBodyPart(item.bodyPart);
    setEditName(item.name);
    setEditRows(
      item.setEntries.map((s) => ({
        weightKg: String(s.weightKg),
        reps: String(s.reps),
      })),
    );
    setEditError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError(null);
  }

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    const result = parseWorkoutFieldsOrExplain(bodyPart, name, setRows);
    if (!result.ok) {
      setAddError(result.message);
      return;
    }
    setAddError(null);

    const nameTrimmed = result.value.name;
    const sameSets = result.value.setEntries.length === 3 && result.value.setEntries.every((s) => s.weightKg === 60 && s.reps === 10);
    const lastSets = getLastWorkoutSets(nameTrimmed, workoutsByDate);
    if (sameSets && lastSets) {
      result.value.setEntries = lastSets;
    }

    onAdd(result.value);
    setName("");
    setSetRows(defaultSetRows());
  }

  function handleQuickAdd() {
    const parsed = parsePastedWorkoutText(quickText);
    if (parsed.length === 0) {
      setAddError(
        "읽을 수 있는 줄이 없어요. 형식: `운동이름 세트 무게` 또는 `벤치 3 60 12` (마지막 숫자는 횟수)",
      );
      return;
    }
    setAddError(null);
    onAddBatch(parsed);
    setQuickText("");
  }

  function handleSaveEdit(e: FormEvent, id: string) {
    e.preventDefault();
    const result = parseWorkoutFieldsOrExplain(editBodyPart, editName, editRows);
    if (!result.ok) {
      setEditError(result.message);
      return;
    }
    setEditError(null);
    onUpdate(id, result.value);
    setEditingId(null);
  }

  function handleDeleteClick(id: string) {
    if (window.confirm("이 운동을 삭제할까요?")) {
      onDelete(id);
      if (editingId === id) setEditingId(null);
    }
  }

  const modeBtn = (mode: AddMode, label: string) => (
    <button
      key={mode}
      type="button"
      onClick={() => {
        setAddMode(mode);
        setAddError(null);
      }}
      className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition sm:text-sm ${
        addMode === mode
          ? "bg-slate-800 text-white shadow-sm ring-1 ring-primary-500/40"
          : "text-slate-500 hover:text-slate-200"
      }`}
    >
      {label}
    </button>
  );

  return (
    <section className="mt-7">
      <div className="flex items-center gap-3">
        <span
          className="h-9 w-1 shrink-0 rounded-full bg-gradient-to-b from-primary-500 to-cyan-600 shadow-sm shadow-primary-900/30"
          aria-hidden
        />
        <div className="min-w-0">
          <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">
            {formatShortDate(date)}
          </h2>
          <p className="text-xs font-semibold text-slate-500">운동 일지</p>
          {sessionStartLabel ? (
            <p className="mt-1 text-[11px] font-medium text-primary-200/90">
              이 날 운동 시작: {sessionStartLabel}
            </p>
          ) : (
            <p className="mt-1 text-[11px] text-slate-600">
              운동을 추가하거나 세트를 완료하면 시작 시각이 기록됩니다.
            </p>
          )}
        </div>
      </div>

      <div className="mt-5">
        <RoutineLibrary
          routines={savedRoutines}
          currentCount={items.length}
          onLoad={onLoadRoutine}
          onDelete={onDeleteRoutine}
          onCreateCustomRoutine={onCreateCustomRoutine}
        />
      </div>

      <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary-400/90">
              새 기록
            </p>
            <p className="text-sm font-semibold text-slate-200">루틴 추가</p>
          </div>
          <div className="flex w-full max-w-xs rounded-xl bg-slate-950/80 p-1 sm:w-auto">
            {modeBtn("detail", "상세 입력")}
            {modeBtn("quick", "빠른 붙여넣기")}
          </div>
        </div>

        {addError ? (
          <p
            className="mt-3 rounded-xl border border-primary-900/60 bg-primary-950/40 px-3 py-2.5 text-sm font-medium text-primary-200"
            role="alert"
          >
            {addError}
          </p>
        ) : null}

        {addMode === "quick" ? (
          <div className="mt-4 space-y-3">
            <p className="text-[13px] leading-relaxed text-slate-400">
              한 줄에{" "}
              <span className="font-semibold text-slate-200">
                운동이름 세트 무게(kg) [횟수]
              </span>
              순서로 적을 수 있어요. 횟수를 생략하면 10회로 넣습니다.
            </p>
            <textarea
              value={quickText}
              onChange={(e) => {
                setQuickText(e.target.value);
                setAddError(null);
              }}
              rows={8}
              className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 font-mono text-[13px] leading-relaxed text-slate-100 shadow-inner placeholder:text-slate-600 focus:border-primary-500/50 focus:outline-none focus:ring-2 focus:ring-primary-500/25"
              placeholder={"벤치프레스 3 60\n랫풀다운 3 40\n스쿼트 5 100 8"}
              spellCheck={false}
            />
            <button type="button" onClick={handleQuickAdd} className={`${btnPrimary} w-full`}>
              파싱해서 한 번에 추가
            </button>
          </div>
        ) : (
          <form onSubmit={handleAdd} className="mt-4 space-y-4">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(240px,300px)] lg:items-start lg:gap-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className={labelCn}>
                  부위
                  <select
                    value={bodyPart}
                    onChange={(e) => {
                      setBodyPart(e.target.value as BodyPart);
                      setAddError(null);
                    }}
                    className={inputCn}
                  >
                    {BODY_PART_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={`${labelCn} sm:col-span-2`}>
                  운동 이름
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setAddError(null);
                    }}
                    placeholder="아래 추천을 누르거나 직접 입력"
                    className={inputCn}
                  />
                </label>
              </div>

              <aside className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 shadow-inner lg:sticky lg:top-4">
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  추천 운동
                </p>
                <p className="mt-1 text-[12px] leading-snug text-slate-500">
                  버튼을 누르면 이름 칸에 들어갑니다.
                </p>
                <div className="mt-3 flex max-h-[220px] flex-wrap gap-2 overflow-y-auto pr-0.5 lg:max-h-[320px]">
                  {EXERCISES_BY_PART[bodyPart].map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      className={chipCn}
                      onClick={() => {
                        setName(ex);
                        setAddError(null);
                      }}
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </aside>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  세트별 무게 · 횟수
                </p>
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
              <ul className="mt-3 space-y-2">
                {setRows.map((row, i) => (
                  <li
                    key={i}
                    className="grid grid-cols-[1fr_1fr_auto] items-end gap-2 sm:max-w-md"
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
                            rows.map((x, j) => (j === i ? { ...x, weightKg: v } : x)),
                          );
                          setAddError(null);
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
                            rows.map((x, j) => (j === i ? { ...x, reps: v } : x)),
                          );
                          setAddError(null);
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

            <button type="submit" className={`${btnPrimary} w-full`}>
              이 날 일지에 추가
            </button>
          </form>
        )}
      </div>

      {items.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-14 text-center shadow-inner">
          <div
            className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-slate-950 text-3xl ring-1 ring-slate-800"
            aria-hidden
          >
            🏋️
          </div>
          <p className="text-base font-bold text-slate-200">아직 기록이 없어요</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
            세트별 무게·횟수를 넣고 추가하거나, 빠른 붙여넣기를 사용해 보세요.
          </p>
        </div>
      ) : (
        <ul className="mt-5 space-y-4">
          {items.map((item) => (
            <li
              key={item.id}
              className={`rounded-2xl border bg-slate-900/40 p-4 shadow-lg transition duration-200 sm:p-5 ${
                item.completed
                  ? "border-primary-500/35 ring-1 ring-primary-500/15"
                  : "border-slate-800 hover:border-slate-600"
              }`}
            >
              {editingId === item.id ? (
                <form onSubmit={(e) => handleSaveEdit(e, item.id)} className="space-y-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary-400/90">
                    수정 중
                  </p>
                  {editError ? (
                    <p
                      className="rounded-xl border border-primary-900/60 bg-primary-950/40 px-3 py-2.5 text-sm font-medium text-primary-200"
                      role="alert"
                    >
                      {editError}
                    </p>
                  ) : null}
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(240px,300px)] lg:items-start lg:gap-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className={labelCn}>
                        부위
                        <select
                          value={editBodyPart}
                          onChange={(e) => {
                            setEditBodyPart(e.target.value as BodyPart);
                            setEditError(null);
                          }}
                          className={inputCn}
                        >
                          {BODY_PART_OPTIONS.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className={`${labelCn} sm:col-span-2`}>
                        운동 이름
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => {
                            setEditName(e.target.value);
                            setEditError(null);
                          }}
                          className={inputCn}
                        />
                      </label>
                    </div>
                    <aside className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                      <p className="text-xs font-extrabold text-slate-400">추천 운동</p>
                      <div className="mt-2 flex max-h-[160px] flex-wrap gap-2 overflow-y-auto">
                        {EXERCISES_BY_PART[editBodyPart].map((ex) => (
                          <button
                            key={ex}
                            type="button"
                            className={chipCn}
                            onClick={() => {
                              setEditName(ex);
                              setEditError(null);
                            }}
                          >
                            {ex}
                          </button>
                        ))}
                      </div>
                    </aside>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-bold text-slate-500">세트별 무게 · 횟수</p>
                      <button
                        type="button"
                        className={btnGhost}
                        onClick={() =>
                          setEditRows((r) => [...r, { weightKg: "60", reps: "10" }])
                        }
                      >
                        + 세트
                      </button>
                    </div>
                    <ul className="mt-3 space-y-2">
                      {editRows.map((row, i) => (
                        <li
                          key={i}
                          className="grid grid-cols-[1fr_1fr_auto] items-end gap-2 sm:max-w-md"
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
                                setEditRows((rows) =>
                                  rows.map((x, j) =>
                                    j === i ? { ...x, weightKg: v } : x,
                                  ),
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
                                setEditRows((rows) =>
                                  rows.map((x, j) =>
                                    j === i ? { ...x, reps: v } : x,
                                  ),
                                );
                              }}
                              className={inputCn}
                            />
                          </label>
                          <button
                            type="button"
                            disabled={editRows.length <= 1}
                            onClick={() =>
                              setEditRows((rows) => rows.filter((_, j) => j !== i))
                            }
                            className="mb-0.5 rounded-lg border border-slate-700 px-2 py-2 text-xs font-bold text-slate-400 disabled:opacity-30"
                          >
                            삭제
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className={`${btnPrimary} flex-1 py-2.5`}>
                      저장
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className={`${btnGhost} flex-1 py-2.5 text-sm`}
                    >
                      취소
                    </button>
                  </div>
                </form>
              ) : viewMode === "classic" ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">{item.bodyPart}</span>
                      <span className={`text-base font-bold ${item.completed ? "text-slate-500 line-through" : "text-slate-200"}`}>{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setChartExercise(item.name)} className="text-[11px] text-primary-500 hover:text-primary-400">📈 통계</button>
                      <button type="button" onClick={() => beginEdit(item)} className="text-[11px] text-slate-400 hover:text-slate-200">수정</button>
                      <button type="button" onClick={() => onToggleComplete(item.id, !item.completed)} className="text-[11px] text-slate-400 hover:text-slate-200">{item.completed ? '취소' : '완료'}</button>
                      <button type="button" onClick={() => onDelete(item.id)} className="text-[11px] text-red-500/70 hover:text-red-400">삭제</button>
                    </div>
                  </div>
                  <div className="border-t border-slate-800/80 pt-2 mt-1">
                    <SetRowsWithCheckboxes sets={item.setEntries} onToggleSet={(i) => onToggleSet(item.id, i)} />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col">
                  {/* Collapsed Header */}
                  <div
                    className="flex cursor-pointer items-center justify-between gap-3"
                    onClick={() => toggleExpand(item.id)}
                  >
                    <div className="flex flex-1 items-center gap-3 min-w-0">
                      <div className="shrink-0">
                         <ExerciseVideoThumb
                           exerciseName={item.name}
                           className="size-12 sm:size-14 rounded-full ring-2 ring-slate-800 shadow-lg shrink-0"
                         />
                      </div>
                      <div className="flex flex-1 flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                              item.completed
                                ? "bg-slate-800 text-slate-500 line-through"
                                : "bg-slate-800 text-slate-300"
                            }`}
                          >
                            {item.bodyPart}
                          </span>
                          <span
                            className={`min-w-0 truncate text-base font-bold sm:text-lg ${
                              item.completed
                                ? "text-slate-500 line-through"
                                : "text-white"
                            }`}
                          >
                            {item.name}
                          </span>
                        </div>
                        <p className="mt-1 text-xs font-medium text-slate-500">
                           {item.setEntries.length}세트
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                       <label className="mr-1 sm:mr-2 flex cursor-pointer items-center" onClick={(e) => e.stopPropagation()}>
                         <input
                           type="checkbox"
                           checked={item.completed}
                           onChange={(e) =>
                             onToggleComplete(item.id, e.target.checked)
                           }
                           className="size-[1.2rem] shrink-0 cursor-pointer rounded-md border-slate-600 bg-slate-900 text-primary-500 accent-primary-500 focus:ring-2 focus:ring-primary-500/40"
                           aria-label={`${item.name} 전체 완료`}
                         />
                       </label>
                       
                       <button
                         type="button"
                         onClick={(e) => { 
                           e.stopPropagation(); 
                           handleDeleteClick(item.id); 
                         }}
                         className="p-1.5 text-slate-400 hover:text-red-400 transition-colors focus:outline-none"
                         aria-label="삭제"
                       >
                         <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                         </svg>
                       </button>

                       <span className="text-slate-600 text-xs ml-1 font-mono">
                         {expandedItemIds.has(item.id) ? "▲" : "▼"}
                       </span>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedItemIds.has(item.id) && (
                    <div className="mt-4 animate-in fade-in slide-in-from-top-2 border-t border-slate-800/80 pt-4">
                      <div className="mb-4">
                        <ExerciseVideoThumb
                          exerciseName={item.name}
                          className="aspect-[16/9] w-full max-w-sm sm:max-w-md mx-auto shadow-xl ring-1 ring-white/5"
                        />
                      </div>
                      
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <p className="text-[11px] text-slate-500 leading-snug">
                          각 세트의 체크박스를 누르면 타이머가 돌아요 ⏱️
                        </p>
                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() => setChartExercise(item.name)}
                            className={`${btnGhost} bg-primary-950/20 text-primary-500 hover:border-primary-500/50 hover:bg-primary-950/40 border-primary-900/30 px-2 py-1.5 min-w-[3.5rem] text-[11px]`}
                          >
                            📈 통계
                          </button>
                          <button
                            type="button"
                            onClick={() => beginEdit(item)}
                            className={`${btnGhost} min-w-[3.5rem] px-2 py-1.5 text-[11px]`}
                          >
                            수정
                          </button>
                        </div>
                      </div>

                      <SetRowsWithCheckboxes
                        sets={item.setEntries}
                        onToggleSet={(i) => onToggleSet(item.id, i)}
                      />
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {chartExercise && (
        <ProgressChartModal
          exerciseName={chartExercise}
          data={getChartDataForExercise(chartExercise, workoutsByDate)}
          onClose={() => setChartExercise(null)}
        />
      )}
    </section>
  );
}
