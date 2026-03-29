/** 월요일=0 … 일요일=6 (탭 순서) */
export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const BODY_PART_OPTIONS = [
  "가슴",
  "등",
  "어깨",
  "팔",
  "하체",
  "코어",
  "전신",
  "기타",
] as const;

export type BodyPart = (typeof BODY_PART_OPTIONS)[number];

/** 세트 한 줄: 무게(kg) × 횟수, 완료 여부 */
export type SetEntry = {
  weightKg: number;
  reps: number;
  done?: boolean;
};

export type WorkoutItem = {
  id: string;
  bodyPart: BodyPart;
  name: string;
  setEntries: SetEntry[];
  /** 운동 전체 완료(체크) — 세트를 모두 찍었을 때도 true */
  completed: boolean;
};

/** 추가·수정 폼에서 다루는 필드 */
export type WorkoutFields = Omit<WorkoutItem, "id" | "completed">;

export type WorkoutsByDate = Record<string, WorkoutItem[]>;

export type AppTab = "today" | "summary" | "history";

/** 휴식 종료 알림음 프리셋 */
export type RestSoundId = "beep" | "chime" | "bell" | "digital";
