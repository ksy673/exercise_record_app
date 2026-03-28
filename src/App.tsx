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

  function handleAdd(payload: Omit<WorkoutItem, "id" | "completed">) {
    const key = dateKeyRef.current;
    const item: WorkoutItem = { ...payload, id: newWorkoutId(), completed: false };
    setWorkoutsByDate((prev) => ({
      ...prev,
      [key]: [...(prev[key] ?? []), item],
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
    <div className="relative min-h-screen overflow-x-hidden bg-slate-50 font-sans text-slate-800">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_110%_70%_at_50%_-15%,rgb(196_181_253/0.35)_0%,transparent_55%),radial-gradient(ellipse_80%_50%_at_100%_50%,rgb(165_243_252/0.25)_0%,transparent_50%),radial-gradient(ellipse_60%_40%_at_0%_80%,rgb(233_213_255/0.35)_0%,transparent_45%)]"
        aria-hidden
      />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgb(248_250_252/0.9)_100%)]" aria-hidden />

      <div className="relative flex min-h-screen justify-center">
        <div className="relative flex w-full flex-col items-center">
          <header className="relative w-full border-b border-white/50 bg-white/70 shadow-[0_12px_40px_-12px_rgb(15_23_42/0.12)] backdrop-blur-xl">
            <div
              className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-violet-400/25 blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -left-10 top-0 h-32 w-32 rounded-full bg-cyan-300/20 blur-3xl"
              aria-hidden
            />
            <div className={`relative py-6 ${columnClass} mx-auto`}>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-600/90">
                Workout log
              </p>
              <h1 className="mt-1 bg-gradient-to-r from-violet-700 via-indigo-600 to-cyan-600 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent sm:text-3xl">
                운동 기록
              </h1>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">
                주를 넘겨 다른 날 기록도 볼 수 있어요. 완료 체크 시 휴식 타이머가
                돌고, 마지막 3초부터 알림음이 납니다.
              </p>
            </div>
          </header>

          <main
            className={`w-full ${columnClass} mx-auto pb-8 pt-5 ${restBarVisible ? "pb-32" : ""}`}
          >
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-center text-sm font-semibold text-slate-700 sm:text-left">
                {weekLabel}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={() => setWeekOffset((o) => o - 1)}
                  className="rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-violet-300 hover:bg-violet-50"
                >
                  ← 지난주
                </button>
                {weekOffset !== 0 ? (
                  <button
                    type="button"
                    onClick={() => setWeekOffset(0)}
                    className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-800 transition hover:bg-violet-100"
                  >
                    이번 주로
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setWeekOffset((o) => o + 1)}
                  className="rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-violet-300 hover:bg-violet-50"
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
