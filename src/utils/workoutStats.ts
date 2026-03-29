import type { WorkoutItem } from "../types";

export type SessionStats = {
  volumeKg: number;
  totalReps: number;
  totalSets: number;
};

export function sessionStatsForItems(items: WorkoutItem[]): SessionStats {
  let volumeKg = 0;
  let totalReps = 0;
  let totalSets = 0;
  for (const it of items) {
    for (const s of it.setEntries) {
      volumeKg += s.weightKg * s.reps;
      totalReps += s.reps;
      totalSets += 1;
    }
  }
  return { volumeKg, totalReps, totalSets };
}
