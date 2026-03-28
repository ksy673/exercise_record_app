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

export type WorkoutItem = {
  id: string;
  bodyPart: BodyPart;
  name: string;
  sets: number;
  weightKg: number;
  completed: boolean;
};

/** 추가·수정 폼에서 다루는 필드 (완료 여부 제외) */
export type WorkoutFields = Omit<WorkoutItem, "id" | "completed">;

export type WorkoutsByDate = Record<string, WorkoutItem[]>;
