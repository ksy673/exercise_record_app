import { useEffect, useMemo, useRef, useState } from "react";
import { DayTabs } from "./components/DayTabs";
import { RestTimerBar } from "./components/RestTimerBar";
import { RoutineList } from "./components/RoutineList";
import type { WeekdayIndex, WorkoutItem, WorkoutsByDate } from "./types";
import { playRestCompleteSound, playRestCountdownTick } from "./utils/restSound";
import { loadWorkouts, saveWorkouts } from "./utils/workoutStorage";
import {
  formatLocalDateKey,
  formatShortDate,
  getWeekDates,
  startOfIsoWeek,
} from "./utils/week";

const REST_DURATION_SEC = 60;

const columnClass =
  "w-full max-w-xl sm:max-w-2xl lg:max-w-3xl px-4 sm:px-6 lg:px-8";

function defaultSelectedForToday(): WeekdayIndex {
  const day = new Date().getDay();
  if (day === 0) return 6;
  return (day - 1) as WeekdayIndex;
}

function newWorkoutId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `w-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function App() {
  const [selectedDay, setSelectedDay] = useState<WeekdayIndex>(defaultSelectedForToday);
  const [workoutsByDate, setWorkoutsByDate] = useState<WorkoutsByDate>(loadWorkouts);
  const [restSecondsLeft, setRestSecondsLeft] = useState<number | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [weekOffset, setWeekOffset] = useState(0);

  const weekAnchor = useMemo(() => {
    const mon = startOfIsoWeek(now);
    mon.setDate(mon.getDate() + weekOffset * 7);
    return mon;
  }, [now, weekOffset]);

  const weekDates = useMemo(() => getWeekDates(weekAnchor), [weekAnchor]);
  const selectedDate = weekDates[selectedDay];
  const dateKey = formatLocalDateKey(selectedDate);
  const dateKeyRef = useRef(dateKey);
  dateKeyRef.current = dateKey;

  useEffect(() => {
    const tick = () => setNow(new Date());
    const id = window.setInterval(tick, 60_000);
    const onVis = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  useEffect(() => {
    saveWorkouts(workoutsByDate);
  }, [workoutsByDate]);

  useEffect(() => {
    if (restSecondsLeft === null || restSecondsLeft <= 0) return;
    if (restSecondsLeft <= 3) {
      playRestCountdownTick(restSecondsLeft);
    }
  }, [restSecondsLeft]);

  useEffect(() => {
    if (restSecondsLeft === null) return;
    if (restSecondsLeft <= 0) {
      playRestCompleteSound();
      setRestSecondsLeft(null);
      return;
    }
    const id = window.setTimeout(() => {
      setRestSecondsLeft((s) => (s === null ? null : s - 1));
    }, 1000);
    return () => window.clearTimeout(id);
  }, [restSecondsLeft]);

  const items = workoutsByDate[dateKey] ?? [];
  const restBarVisible = restSecondsLeft !== null && restSecondsLeft > 0;

  const weekLabel = `${formatShortDate(weekDates[0])} ~ ${formatShortDate(weekDates[6])}`;

  const weekExerciseCount = useMemo(() => {
    let n = 0;
    for (const d of weekDates) {
      const k = formatLocalDateKey(d);
      n += (workoutsByDate[k] ?? []).length;
    }
    return n;
  }, [weekDates, workoutsByDate]);

  function handleAdd(payload: Omit<WorkoutItem, "id" | "completed">) {
    const key = dateKeyRef.current;
    const item: WorkoutItem = { ...payload, id: newWorkoutId(), completed: false };
    setWorkoutsByDate((prev) => ({
      ...prev,
      [key]: [...(prev[key] ?? []), item],
    }));
  }

  function handleAddBatch(payloads: Omit<WorkoutItem, "id" | "completed">[]) {
    if (payloads.length === 0) return;
    const key = dateKeyRef.current;
    setWorkoutsByDate((prev) => ({
      ...prev,
      [key]: [
        ...(prev[key] ?? []),
        ...payloads.map((p) => ({
          ...p,
          id: newWorkoutId(),
          completed: false,
        })),
      ],
    }));
  }

  function handleUpdate(id: string, payload: Omit<WorkoutItem, "id" | "completed">) {
    const key = dateKeyRef.current;
    setWorkoutsByDate((prev) => ({
      ...prev,
      [key]: (prev[key] ?? []).map((x) =>
        x.id === id ? { ...x, ...payload } : x,
      ),
    }));
  }

  function handleDelete(id: string) {
    const key = dateKeyRef.current;
    setWorkoutsByDate((prev) => {
      const list = prev[key] ?? [];
      const filtered = list.filter((x) => x.id !== id);
      const next: WorkoutsByDate = { ...prev };
      if (filtered.length === 0) delete next[key];
      else next[key] = filtered;
      return next;
    });
  }

  function handleToggleComplete(id: string, completed: boolean) {
    const key = dateKeyRef.current;
    setWorkoutsByDate((prev) => ({
      ...prev,
      [key]: (prev[key] ?? []).map((x) =>
        x.id === id ? { ...x, completed } : x,
      ),
    }));
    if (completed) {
      setRestSecondsLeft(REST_DURATION_SEC);
    } else {
      setRestSecondsLeft(null);
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f4f7f5] font-sans text-slate-800">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_-20%,rgb(167_243_208/0.45)_0%,transparent_50%),radial-gradient(ellipse_70%_50%_at_100%_30%,rgb(204_251_241/0.35)_0%,transparent_45%),radial-gradient(ellipse_50%_40%_at_0%_70%,rgb(209_250_229/0.4)_0%,transparent_40%)]"
        aria-hidden
      />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_bottom,rgb(255_255_255/0.5)_0%,rgb(244_247_245/0.95)_100%)]" aria-hidden />

      <div className="relative flex min-h-screen justify-center">
        <div className="relative flex w-full flex-col items-center">
          <header className="relative w-full border-b border-emerald-100/80 bg-white/85 shadow-[0_12px_40px_-12px_rgb(16_185_129/0.12)] backdrop-blur-xl">
            <div
              className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -left-10 top-0 h-32 w-32 rounded-full bg-teal-300/15 blur-3xl"
              aria-hidden
            />
            <div className={`relative py-6 ${columnClass} mx-auto`}>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700/90">
                Fitness diary
              </p>
              <h1 className="mt-1 bg-gradient-to-r from-emerald-800 via-teal-700 to-cyan-700 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent sm:text-3xl">
                오늘의 운동
              </h1>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">
                번핏·플릭처럼 날짜별로 쌓이고, Barbell 앱처럼{" "}
                <span className="font-semibold text-slate-800">한 번에 붙여넣기</span>도
                됩니다. 세트 완료 시 휴식 타이머·3초 알림음을 켤 수 있어요.
              </p>
            </div>
          </header>

          <main
            className={`w-full ${columnClass} mx-auto pb-8 pt-5 ${restBarVisible ? "pb-32" : ""}`}
          >
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-center sm:text-left">
                <p className="text-sm font-semibold text-slate-700">{weekLabel}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  이번 주 항목{" "}
                  <span className="font-bold tabular-nums text-emerald-700">
                    {weekExerciseCount}
                  </span>
                  개
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={() => setWeekOffset((o) => o - 1)}
                  className="rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50/80"
                >
                  ← 지난주
                </button>
                {weekOffset !== 0 ? (
                  <button
                    type="button"
                    onClick={() => setWeekOffset(0)}
                    className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-900 transition hover:bg-emerald-100"
                  >
                    이번 주로
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setWeekOffset((o) => o + 1)}
                  className="rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50/80"
                >
                  다음주 →
                </button>
              </div>
            </div>

            <DayTabs
              weekDates={weekDates}
              selected={selectedDay}
              onSelect={setSelectedDay}
            />
            <RoutineList
              key={dateKey}
              date={selectedDate}
              items={items}
              onAdd={handleAdd}
              onAddBatch={handleAddBatch}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onToggleComplete={handleToggleComplete}
            />
          </main>
        </div>
      </div>

      {restBarVisible && restSecondsLeft !== null ? (
        <RestTimerBar
          secondsLeft={restSecondsLeft}
          urgent={restSecondsLeft <= 3}
        />
      ) : null}
    </div>
  );
}
