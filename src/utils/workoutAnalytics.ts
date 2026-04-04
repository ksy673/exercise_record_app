import type { WorkoutsByDate, SetEntry } from "../types";

export function getLastWorkoutSets(name: string, workoutsByDate: WorkoutsByDate): SetEntry[] | null {
  const dates = Object.keys(workoutsByDate).sort((a, b) => b.localeCompare(a));
  for (const d of dates) {
    const items = workoutsByDate[d];
    const found = items.find(it => it.name.trim() === name.trim());
    if (found && found.setEntries.length > 0) {
      return found.setEntries.map(s => ({ weightKg: s.weightKg, reps: s.reps }));
    }
  }
  return null;
}

export function calculate1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

export function getChartDataForExercise(name: string, workoutsByDate: WorkoutsByDate) {
  const dates = Object.keys(workoutsByDate).sort((a, b) => a.localeCompare(b));
  const data: { date: string; fullDate: string; max1RM: number; totalVolume: number }[] = [];
  for (const d of dates) {
    const items = workoutsByDate[d];
    const found = items.find(it => it.name.trim() === name.trim());
    if (found && found.setEntries.length > 0) {
      let max1RM = 0;
      let totalVolume = 0;
      for (const set of found.setEntries) {
        const rm = calculate1RM(set.weightKg, set.reps);
        if (rm > max1RM) max1RM = rm;
        totalVolume += set.weightKg * set.reps;
      }
      data.push({
        date: d.substring(5),
        fullDate: d,
        max1RM: Math.round(max1RM * 10) / 10,
        totalVolume,
      });
    }
  }
  return data.slice(-20);
}
