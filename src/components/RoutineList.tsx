import { useState, type FormEvent } from "react";
import { EXERCISES_BY_PART } from "../data/exerciseSuggestions";
import {
  BODY_PART_OPTIONS,
  type BodyPart,
  type WorkoutFields,
  type WorkoutItem,
} from "../types";
import { parsePastedWorkoutText } from "../utils/quickParse";
import { formatShortDate } from "../utils/week";

type Props = {
  date: Date;
  items: WorkoutItem[];
  onAdd: (item: WorkoutFields) => void;
  onAddBatch: (items: WorkoutFields[]) => void;
  onUpdate: (id: string, item: WorkoutFields) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
};

const labelCn =
  "block text-[11px] font-bold uppercase tracking-wider text-slate-500";
const inputCn =
  "mt-1.5 w-full rounded-xl border-0 bg-slate-50/90 px-3.5 py-2.5 text-sm text-slate-900 shadow-[inset_0_1px_2px_rgb(15_23_42/0.06)] ring-1 ring-slate-200/80 transition placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/35";

const btnPrimary =
  "rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:brightness-105 active:scale-[0.99]";
const btnGhost =
  "rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/60";
const btnDanger =
  "rounded-xl border border-rose-200/90 bg-rose-50/40 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100/60";

const chipCn =
  "rounded-full border border-emerald-200/90 bg-white px-3 py-1.5 text-left text-xs font-semibold text-slate-800 shadow-sm transition hover:border-emerald-400 hover:bg-emerald-50 active:scale-[0.98]";

function parseWorkoutFieldsOrExplain(
  bodyPart: BodyPart,
  name: string,
  sets: string,
  weightKg: string,
): { ok: true; value: WorkoutFields } | { ok: false; message: string } {
  const trimmed = name.trim();
  if (!trimmed) {
    return { ok: false, message: "운동 이름을 입력해 주세요. (비어 있으면 추가되지 않아요)" };
  }

  const setsStr = String(sets).trim();
  if (setsStr === "") {
    return { ok: false, message: "세트 수를 입력해 주세요. (1 이상 정수)" };
  }
  const setsNum = Number(setsStr);
  if (!Number.isFinite(setsNum)) {
    return { ok: false, message: "세트 수는 숫자로 입력해 주세요." };
  }
  if (setsNum < 1 || !Number.isInteger(setsNum)) {
    return { ok: false, message: "세트 수는 1 이상의 정수여야 해요." };
  }

  const wStr = String(weightKg).trim();
  const weightNum = wStr === "" ? 0 : Number(wStr);
  if (!Number.isFinite(weightNum)) {
    return { ok: false, message: "무게(kg)는 숫자로 입력해 주세요." };
  }
  if (weightNum < 0) {
    return { ok: false, message: "무게는 0 이상이어야 해요." };
  }

  return { ok: true, value: { bodyPart, name: trimmed, sets: setsNum, weightKg: weightNum } };
}

type AddMode = "detail" | "quick";

export function RoutineList({
  date,
  items,
  onAdd,
  onAddBatch,
  onUpdate,
  onDelete,
  onToggleComplete,
}: Props) {
  const [addMode, setAddMode] = useState<AddMode>("detail");
  const [quickText, setQuickText] = useState("");

  const [bodyPart, setBodyPart] = useState<BodyPart>("가슴");
  const [name, setName] = useState("");
  const [sets, setSets] = useState("3");
  const [weightKg, setWeightKg] = useState("0");
  const [addError, setAddError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBodyPart, setEditBodyPart] = useState<BodyPart>("가슴");
  const [editName, setEditName] = useState("");
  const [editSets, setEditSets] = useState("3");
  const [editWeightKg, setEditWeightKg] = useState("0");
  const [editError, setEditError] = useState<string | null>(null);

  function beginEdit(item: WorkoutItem) {
    setEditingId(item.id);
    setEditBodyPart(item.bodyPart);
    setEditName(item.name);
    setEditSets(String(item.sets));
    setEditWeightKg(String(item.weightKg));
    setEditError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError(null);
  }

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    const result = parseWorkoutFieldsOrExplain(bodyPart, name, sets, weightKg);
    if (!result.ok) {
      setAddError(result.message);
      return;
    }
    setAddError(null);
    onAdd(result.value);
    setName("");
    setSets(String(result.value.sets));
    setWeightKg(String(result.value.weightKg));
  }

  function handleQuickAdd() {
    const parsed = parsePastedWorkoutText(quickText);
    if (parsed.length === 0) {
      setAddError(
        "읽을 수 있는 줄이 없어요. 형식: `운동이름 세트 무게` 또는 `가슴 벤치 3 60`",
      );
      return;
    }
    setAddError(null);
    onAddBatch(parsed);
    setQuickText("");
  }

  function handleSaveEdit(e: FormEvent, id: string) {
    e.preventDefault();
    const result = parseWorkoutFieldsOrExplain(
      editBodyPart,
      editName,
      editSets,
      editWeightKg,
    );
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
          ? "bg-white text-emerald-800 shadow-sm ring-1 ring-emerald-200/80"
          : "text-slate-600 hover:text-slate-900"
      }`}
    >
      {label}
    </button>
  );

  return (
    <section className="mt-7">
      <div className="flex items-center gap-3">
        <span
          className="h-9 w-1 shrink-0 rounded-full bg-gradient-to-b from-emerald-500 via-teal-500 to-cyan-500 shadow-sm shadow-emerald-400/30"
          aria-hidden
        />
        <div className="min-w-0">
          <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
            {formatShortDate(date)}
          </h2>
          <p className="text-xs font-semibold text-slate-500">운동 일지</p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-emerald-100/90 bg-white p-5 shadow-[0_20px_50px_-24px_rgb(16_185_129/0.18)] sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700/90">
              새 기록
            </p>
            <p className="text-sm font-semibold text-slate-800">루틴 추가</p>
          </div>
          <div className="flex w-full max-w-xs rounded-xl bg-slate-100/90 p-1 sm:w-auto">
            {modeBtn("detail", "상세 입력")}
            {modeBtn("quick", "빠른 붙여넣기")}
          </div>
        </div>

        {addError ? (
          <p
            className="mt-3 rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-2.5 text-sm font-medium text-amber-900"
            role="alert"
          >
            {addError}
          </p>
        ) : null}

        {addMode === "quick" ? (
          <div className="mt-4 space-y-3">
            <p className="text-[13px] leading-relaxed text-slate-600">
              인터넷에서 복사한 루틴을 그대로 붙여 넣을 수 있어요.{" "}
              <span className="font-semibold text-slate-800">
                한 줄에 하나씩 · 맨 끝에 세트 수와 무게(kg)
              </span>
              순서로 적어 주세요.
            </p>
            <textarea
              value={quickText}
              onChange={(e) => {
                setQuickText(e.target.value);
                setAddError(null);
              }}
              rows={8}
              className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3 font-mono text-[13px] leading-relaxed text-slate-900 shadow-inner placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
              placeholder={
                "벤치프레스 3 60\n랫풀다운 3 40\n가슴 인클라인 덤벨 4 22\n하체 스쿼트 5 100"
              }
              spellCheck={false}
            />
            <button type="button" onClick={handleQuickAdd} className={`${btnPrimary} w-full`}>
              파싱해서 한 번에 추가
            </button>
            <p className="text-center text-[11px] leading-relaxed text-slate-500">
              부위를 쓰려면 맨 앞에{" "}
              <span className="font-medium text-slate-700">
                가슴 / 등 / 어깨 / 팔 / 하체 / 코어 / 전신 / 기타
              </span>{" "}
              중 하나를 넣을 수 있어요.
            </p>
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
                <label className={labelCn}>
                  세트 수
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={sets}
                    onChange={(e) => {
                      setSets(e.target.value);
                      setAddError(null);
                    }}
                    className={inputCn}
                  />
                </label>
                <label className={labelCn}>
                  무게 (kg)
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={weightKg}
                    onChange={(e) => {
                      setWeightKg(e.target.value);
                      setAddError(null);
                    }}
                    className={inputCn}
                  />
                </label>
              </div>

              <aside className="rounded-2xl border border-emerald-100 bg-gradient-to-b from-emerald-50/70 to-white/60 p-4 shadow-inner lg:sticky lg:top-4">
                <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                  추천 운동
                </p>
                <p className="mt-1 text-[12px] leading-snug text-slate-600">
                  초보자도 부위별로 고르기 쉽게 모아 두었어요. 버튼을 누르면 이름 칸에
                  들어갑니다.
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

            <button type="submit" className={`${btnPrimary} w-full`}>
              이 날 일지에 추가
            </button>
            <p className="text-center text-xs leading-relaxed text-slate-500">
              여러 개는 추가할 때마다 이름을 입력하거나,{" "}
              <button
                type="button"
                className="font-semibold text-emerald-700 underline decoration-emerald-300 underline-offset-2 hover:text-emerald-800"
                onClick={() => setAddMode("quick")}
              >
                빠른 붙여넣기
              </button>
              로 한 번에 넣을 수 있어요.
            </p>
          </form>
        )}
      </div>

      {items.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-emerald-200/80 bg-gradient-to-br from-emerald-50/60 via-white/50 to-teal-50/40 px-6 py-14 text-center shadow-inner">
          <div
            className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-[0_8px_24px_-8px_rgb(16_185_129/0.25)] ring-1 ring-emerald-100"
            aria-hidden
          >
            🏋️
          </div>
          <p className="text-base font-bold text-slate-800">아직 기록이 없어요</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
            상세 입력으로 하나씩 넣거나, 웹에서 복사한 루틴을{" "}
            <span className="font-semibold text-emerald-800">빠른 붙여넣기</span>에 붙여
            보세요.
          </p>
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className={`rounded-2xl border bg-white p-4 shadow-[0_8px_30px_-20px_rgb(15_23_42/0.12)] transition duration-200 sm:p-5 ${
                item.completed
                  ? "border-emerald-200/80 ring-1 ring-emerald-100/80"
                  : "border-slate-200/80 hover:border-emerald-200/70 hover:shadow-md"
              }`}
            >
              {editingId === item.id ? (
                <form onSubmit={(e) => handleSaveEdit(e, item.id)} className="space-y-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    수정 중
                  </p>
                  {editError ? (
                    <p
                      className="rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-2.5 text-sm font-medium text-amber-900"
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
                      <label className={labelCn}>
                        세트 수
                        <input
                          type="number"
                          min={1}
                          step={1}
                          value={editSets}
                          onChange={(e) => {
                            setEditSets(e.target.value);
                            setEditError(null);
                          }}
                          className={inputCn}
                        />
                      </label>
                      <label className={labelCn}>
                        무게 (kg)
                        <input
                          type="number"
                          min={0}
                          step={0.5}
                          value={editWeightKg}
                          onChange={(e) => {
                            setEditWeightKg(e.target.value);
                            setEditError(null);
                          }}
                          className={inputCn}
                        />
                      </label>
                    </div>
                    <aside className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                      <p className="text-xs font-extrabold text-emerald-800">추천 운동</p>
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
              ) : (
                <div className="flex flex-wrap items-start gap-3 sm:gap-4">
                  <label className="mt-0.5 flex cursor-pointer items-start">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={(e) =>
                        onToggleComplete(item.id, e.target.checked)
                      }
                      className="mt-1 size-[1.15rem] shrink-0 cursor-pointer rounded-md border-slate-300 text-emerald-600 accent-emerald-600 focus:ring-2 focus:ring-emerald-500/40"
                      aria-label={`${item.name} 완료`}
                    />
                  </label>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div
                      className={`flex flex-wrap items-center gap-2 ${
                        item.completed ? "opacity-70" : ""
                      }`}
                    >
                      <span
                        className={`shrink-0 rounded-lg px-2.5 py-0.5 text-[11px] font-bold ${
                          item.completed
                            ? "bg-emerald-100 text-emerald-800 line-through decoration-2 decoration-emerald-700"
                            : "bg-emerald-100/90 text-emerald-900"
                        }`}
                      >
                        {item.bodyPart}
                      </span>
                      <span
                        className={`min-w-0 break-words text-base font-bold leading-snug ${
                          item.completed
                            ? "text-slate-400 line-through decoration-2 decoration-slate-400"
                            : "text-slate-900"
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span
                        className={`inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 font-semibold tabular-nums ${
                          item.completed
                            ? "text-slate-400 line-through decoration-2 decoration-slate-400"
                            : "text-slate-800"
                        }`}
                      >
                        {item.sets}세트
                      </span>
                      <span className="text-slate-300" aria-hidden>
                        ·
                      </span>
                      <span
                        className={`inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 font-semibold tabular-nums ${
                          item.completed
                            ? "text-slate-400 line-through decoration-2 decoration-slate-400"
                            : "text-slate-800"
                        }`}
                      >
                        {item.weightKg}kg
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => beginEdit(item)}
                      className={`${btnGhost} min-w-[4.25rem]`}
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(item.id)}
                      className={`${btnDanger} min-w-[4.25rem]`}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
