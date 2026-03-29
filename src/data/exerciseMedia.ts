/**
 * 운동 이름 키워드 → 대표 이미지 (Unsplash 고정 링크).
 * 브라우저에서 바로 로드되도록 이미지를 우선 사용합니다.
 */
const Q = "auto=format&fit=crop&w=480&h=360&q=80";

const FALLBACK = `https://images.unsplash.com/photo-1534438327276-14e3350c14ce?${Q}`;

const IMG = {
  gym: `https://images.unsplash.com/photo-1534438327276-14e3350c14ce?${Q}`,
  bench: `https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?${Q}`,
  cable: `https://images.unsplash.com/photo-1517963879466-e1b54ebd0642?${Q}`,
  squat: `https://images.unsplash.com/photo-1517836357463-d25dfeac3438?${Q}`,
  pushup: `https://images.unsplash.com/photo-1598971639058-fab3c3109a00?${Q}`,
  dumbbell: `https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?${Q}`,
  shoulder: `https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?${Q}`,
  leg: `https://images.unsplash.com/photo-1434608519344-49d77a82e877?${Q}`,
  plank: `https://images.unsplash.com/photo-1518611012118-696072aa579a?${Q}`,
} as const;

const BY_KEYWORD: { keys: string[]; image: string }[] = [
  { keys: ["랫풀", "lat", "pulldown", "풀다운", "풀 다운", "케이블"], image: IMG.cable },
  { keys: ["벤치", "bench", "인클라인", "덤벨 프레스", "체스트 프레스"], image: IMG.bench },
  { keys: ["푸시", "push", "팔굽"], image: IMG.pushup },
  { keys: ["스쿼트", "squat", "점프"], image: IMG.squat },
  { keys: ["데드", "deadlift"], image: IMG.squat },
  { keys: ["풀업", "pull", "턱걸이"], image: IMG.pushup },
  { keys: ["런지", "lunge"], image: IMG.leg },
  { keys: ["플랭크", "plank"], image: IMG.plank },
  { keys: ["로우", "row", "바벨로우", "시티드"], image: IMG.bench },
  { keys: ["숄더", "어깨", "프레스", "press", "오버헤드"], image: IMG.shoulder },
  { keys: ["하체", "leg", "레그", "레그프레스"], image: IMG.leg },
  { keys: ["컬", "curl", "이두", "삼두"], image: IMG.dumbbell },
  { keys: ["크로스", "플라이", "fly"], image: IMG.cable },
];

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

export function getExerciseImageUrl(exerciseName: string): string {
  const n = normalize(exerciseName);
  if (!n) return FALLBACK;
  for (const row of BY_KEYWORD) {
    if (row.keys.some((k) => n.includes(k.toLowerCase()))) return row.image;
  }
  return IMG.gym;
}
