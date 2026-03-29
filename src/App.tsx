import { useEffect, useMemo, useRef, useState } from "react";
import { BottomNav } from "./components/BottomNav";
import { DayTabs } from "./components/DayTabs";
import { HistoryCalendar } from "./components/HistoryCalendar";
import type { CalendarMonth } from "./components/HistoryCalendar";
import { RestSettingsPanel } from "./components/RestSettingsPanel";
import { RestTimerBar } from "./components/RestTimerBar";
import { RoutineList } from "./components/RoutineList";
import { WorkoutSummaryPanel } from "./components/WorkoutSummaryPanel";
import type { AppSettings } from "./utils/appSettings";
import { loadAppSettings, saveAppSettings } from "./utils/appSettings";
import type { AppTab, WeekdayIndex, WorkoutFields, WorkoutItem, WorkoutsByDate } from "./types";
import { playRestCompleteSound, playRestCountdownTick } from "./utils/restSound";
import {
  createRoutine,
  loadSavedRoutines,
  type SavedRoutine,
  saveSavedRoutines,
} from "./utils/savedRoutinesStorage";
import {
  ensureSessionStart,
  formatSessionStartLabel,
  loadSessionStarts,
  saveSessionStarts,
  type SessionStartByDate,
} from "./utils/sessionStartStorage";
import { loadWorkouts, saveWorkouts } from "./utils/workoutStorage";
import {
  formatLocalDateKey,
  formatShortDate,
  getWeekDates,
  startOfIsoWeek,
  weekdayIndexFromDate,
  weekOffsetBetween,
} from "./utils/week";

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
  const [activeTab, setActiveTab] = useState<AppTab>("today");
  const [selectedDay, setSelectedDay] = useState<WeekdayIndex>(defaultSelectedForToday);
  const [workoutsByDate, setWorkoutsByDate] = useState<WorkoutsByDate>(loadWorkouts);
  const [settings, setSettings] = useState<AppSettings>(() => loadAppSettings());
  const [restSecondsLeft, setRestSecondsLeft] = useState<number | null>(null);
  const [restTimerTotal, setRestTimerTotal] = useState(settings.restDurationSec);
  const [now, setNow] = useState(() => new Date());
  const [weekOffset, setWeekOffset] = useState(0);

  const [calendarMonth, setCalendarMonth] = useState<CalendarMonth>(() => ({
    year: new Date().getFullYear(),
    monthIndex: new Date().getMonth(),
  }));

  const [sessionStarts, setSessionStarts] = useState<SessionStartByDate>(() =>
    loadSessionStarts(),
  );
  const [savedRoutines, setSavedRoutines] = useState<SavedRoutine[]>(() =>
    loadSavedRoutines(),
  );

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

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
    saveAppSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (activeTab !== "history") return;
    const d = new Date(`${dateKey}T12:00:00`);
    setCalendarMonth({
      year: d.getFullYear(),
      monthIndex: d.getMonth(),
    });
  }, [activeTab, dateKey]);

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
    saveSessionStarts(sessionStarts);
  }, [sessionStarts]);

  useEffect(() => {
    saveSavedRoutines(savedRoutines);
  }, [savedRoutines]);

  useEffect(() => {
    if (restSecondsLeft === null || restSecondsLeft <= 0) return;
    if (restSecondsLeft <= 3) {
      playRestCountdownTick(restSecondsLeft, settingsRef.current.restSoundId);
    }
  }, [restSecondsLeft]);

  useEffect(() => {
    if (restSecondsLeft === null) return;
    if (restSecondsLeft <= 0) {
      playRestCompleteSound(settingsRef.current.restSoundId);
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

  const sessionStartLabel = useMemo(() => {
    const iso = sessionStarts[dateKey];
    return iso ? formatSessionStartLabel(iso) : null;
  }, [sessionStarts, dateKey]);

  function workoutToFields(w: WorkoutItem): WorkoutFields {
    return {
      bodyPart: w.bodyPart,
      name: w.name,
      setEntries: w.setEntries.map((s) => ({ weightKg: s.weightKg, reps: s.reps })),
    };
  }

  function startRestTimer() {
    const sec = settings.restDurationSec;
    setRestTimerTotal(sec);
    setRestSecondsLeft(sec);
  }

  function handleAdd(payload: Omit<WorkoutItem, "id" | "completed">) {
    const key = dateKeyRef.current;
    const item: WorkoutItem = { ...payload, id: newWorkoutId(), completed: false };
    setSessionStarts((s) => ensureSessionStart(s, key));
    setWorkoutsByDate((prev) => ({
      ...prev,
      [key]: [...(prev[key] ?? []), item],
    }));
  }

  function handleAddBatch(payloads: Omit<WorkoutItem, "id" | "completed">[]) {
    if (payloads.length === 0) return;
    const key = dateKeyRef.current;
    setSessionStarts((s) => ensureSessionStart(s, key));
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

  function handleToggleSet(itemId: string, setIndex: number) {
    const key = dateKeyRef.current;
    let shouldRest = false;
    setWorkoutsByDate((prev) => {
      const list = prev[key] ?? [];
      const next = list.map((item) => {
        if (item.id !== itemId) return item;
        const wasDone = item.setEntries[setIndex]?.done === true;
        const setEntries = item.setEntries.map((s, i) =>
          i === setIndex ? { ...s, done: !wasDone } : s,
        );
        const toggledNow = setEntries[setIndex].done === true;
        if (toggledNow && !wasDone) shouldRest = true;
        const completed = setEntries.every((s) => s.done);
        return { ...item, setEntries, completed };
      });
      return { ...prev, [key]: next };
    });
    if (shouldRest) {
      setSessionStarts((s) => ensureSessionStart(s, key));
      startRestTimer();
    } else {
      setRestSecondsLeft(null);
    }
  }

  function handleToggleComplete(id: string, completed: boolean) {
    const key = dateKeyRef.current;
    setWorkoutsByDate((prev) => ({
      ...prev,
      [key]: (prev[key] ?? []).map((x) => {
        if (x.id !== id) return x;
        const setEntries = x.setEntries.map((s) => ({ ...s, done: completed }));
        return { ...x, setEntries, completed };
      }),
    }));
    if (!completed) {
      setRestSecondsLeft(null);
    }
  }

  function handleSaveRoutine(name: string) {
    const key = dateKeyRef.current;
    const list = workoutsByDate[key] ?? [];
    if (list.length === 0) return;
    const items = list.map(workoutToFields);
    const r = createRoutine(name, items);
    setSavedRoutines((prev) => [...prev, r]);
  }

  function handleLoadRoutine(r: SavedRoutine, mode: "append" | "replace") {
    const key = dateKeyRef.current;
    setSessionStarts((s) => ensureSessionStart(s, key));
    setWorkoutsByDate((prev) => {
      const newItems: WorkoutItem[] = r.items.map((f) => ({
        ...f,
        id: newWorkoutId(),
        completed: false,
        setEntries: f.setEntries.map((s) => ({
          weightKg: s.weightKg,
          reps: s.reps,
          done: false,
        })),
      }));
      const prevList = prev[key] ?? [];
      const merged = mode === "replace" ? newItems : [...prevList, ...newItems];
      const next: WorkoutsByDate = { ...prev };
      if (merged.length === 0) delete next[key];
      else next[key] = merged;
      return next;
    });
  }

  function handleDeleteRoutine(id: string) {
    setSavedRoutines((prev) => prev.filter((x) => x.id !== id));
  }

  function goToDate(d: Date) {
    const ref = new Date();
    setWeekOffset(weekOffsetBetween(d, ref));
    setSelectedDay(weekdayIndexFromDate(d));
    setCalendarMonth({ year: d.getFullYear(), monthIndex: d.getMonth() });
  }

  const bottomPad = restBarVisible ? "pb-40" : "pb-24";

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0b0f14] font-sans text-slate-100">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-15%,rgb(251_191_36/0.08)_0%,transparent_55%),radial-gradient(ellipse_70%_50%_at_100%_20%,rgb(34_211_238/0.06)_0%,transparent_45%)]"
        aria-hidden
      />

      <div className="relative flex min-h-screen justify-center">
        <div className="relative flex w-full flex-col items-center">
          <header className="relative w-full border-b border-slate-800/90 bg-slate-950/70 backdrop-blur-xl">
            <div className={`relative py-5 ${columnClass} mx-auto`}>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400/90">
                로컬 운동 일지
              </p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                오늘의 운동
              </h1>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-400">
                세트별로 무게·횟수를 기록하고, 각 세트 옆 체크박스로 완료하면 휴식 타이머가
                돌아갑니다. 아래에서 시간과 알림음을 바꿀 수 있어요.
              </p>
              <details className="mt-4 group">
                <summary className="cursor-pointer list-none rounded-xl border border-slate-700/80 bg-slate-900/40 px-4 py-3 text-sm font-semibold text-amber-200/90 transition hover:bg-slate-900/70 [&::-webkit-details-marker]:hidden">
                  <span className="inline-flex items-center gap-2">
                    <span aria-hidden>⚙</span>
                    휴식 시간·알림음 설정
                    <span className="text-xs font-normal text-slate-500 group-open:hidden">
                      (열기)
                    </span>
                    <span className="hidden text-xs font-normal text-slate-500 group-open:inline">
                      (접기)
                    </span>
                  </span>
                </summary>
                <div className="mt-3">
                  <RestSettingsPanel settings={settings} onChange={setSettings} />
                </div>
              </details>
            </div>
          </header>

          <main className={`w-full ${columnClass} mx-auto pt-4 ${bottomPad}`}>
            {activeTab === "today" ? (
              <>
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-center sm:text-left">
                    <p className="text-sm font-semibold text-slate-300">{weekLabel}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      이번 주 항목{" "}
                      <span className="font-bold tabular-nums text-amber-400">
                        {weekExerciseCount}
                      </span>
                      개
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setWeekOffset((o) => o - 1)}
                      className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-200 transition hover:border-slate-500"
                    >
                      ← 지난주
                    </button>
                    {weekOffset !== 0 ? (
                      <button
                        type="button"
                        onClick={() => setWeekOffset(0)}
                        className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-200 transition hover:bg-amber-500/20"
                      >
                        이번 주로
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setWeekOffset((o) => o + 1)}
                      className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-200 transition hover:border-slate-500"
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
                  sessionStartLabel={sessionStartLabel}
                  savedRoutines={savedRoutines}
                  onSaveRoutine={handleSaveRoutine}
                  onLoadRoutine={handleLoadRoutine}
                  onDeleteRoutine={handleDeleteRoutine}
                  onAdd={handleAdd}
                  onAddBatch={handleAddBatch}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  onToggleComplete={handleToggleComplete}
                  onToggleSet={handleToggleSet}
                />
              </>
            ) : null}

            {activeTab === "summary" ? (
              <section className="space-y-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    한눈에 요약
                  </p>
                  <p className="mt-1 text-lg font-bold text-white">
                    {formatShortDate(selectedDate)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    오늘 탭에서 주·요일을 바꾸면 이 요약 날짜도 같이 바뀝니다.
                  </p>
                </div>
                <WorkoutSummaryPanel
                  dateLabel={formatShortDate(selectedDate)}
                  items={items}
                />
              </section>
            ) : null}

            {activeTab === "history" ? (
              <section className="space-y-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    기록으로 운동을 의미있게
                  </p>
                  <p className="mt-1 text-lg font-bold text-white">운동 캘린더</p>
                  <p className="mt-1 text-xs text-slate-500">
                    날짜를 누르면 아래에 그날의 운동이 표시됩니다. (선택 날짜는 오늘 탭과
                    연동됩니다)
                  </p>
                </div>
                <HistoryCalendar
                  month={calendarMonth}
                  onPrevMonth={() =>
                    setCalendarMonth((m) =>
                      m.monthIndex === 0
                        ? { year: m.year - 1, monthIndex: 11 }
                        : { year: m.year, monthIndex: m.monthIndex - 1 },
                    )
                  }
                  onNextMonth={() =>
                    setCalendarMonth((m) =>
                      m.monthIndex === 11
                        ? { year: m.year + 1, monthIndex: 0 }
                        : { year: m.year, monthIndex: m.monthIndex + 1 },
                    )
                  }
                  onPickDate={(d) => {
                    goToDate(d);
                  }}
                  selectedDate={selectedDate}
                  workoutsByDate={workoutsByDate}
                />
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 px-4 py-4">
                  <p className="text-sm font-bold text-white">
                    {formatShortDate(selectedDate)}의 운동
                  </p>
                  <ul className="mt-3 space-y-2">
                    {items.length === 0 ? (
                      <li className="text-sm text-slate-500">기록이 없습니다.</li>
                    ) : (
                      items.map((it) => (
                        <li
                          key={it.id}
                          className="flex flex-wrap items-center gap-2 text-sm text-slate-300"
                        >
                          <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                            {it.bodyPart}
                          </span>
                          <span className="font-semibold text-white">{it.name}</span>
                          <span className="text-slate-500">
                            · {it.setEntries.length}세트
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </section>
            ) : null}
          </main>
        </div>
      </div>

      <BottomNav active={activeTab} onChange={setActiveTab} />

      {restBarVisible && restSecondsLeft !== null ? (
        <RestTimerBar
          secondsLeft={restSecondsLeft}
          totalSeconds={restTimerTotal}
          urgent={restSecondsLeft <= 3}
        />
      ) : null}
    </div>
  );
}
