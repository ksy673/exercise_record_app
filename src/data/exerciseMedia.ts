/**
 * 운동 이름 → 대표 이미지 URL.
 * 키워드 순서가 중요합니다(구체적인 것부터 매칭).
 */
import { ALL_SUGGESTED_EXERCISE_NAMES } from "./exerciseSuggestions";

const Q = "auto=format&fit=crop&w=480&h=360&q=80";

/** 바벨 벤치 / 가슴 프레스 계열 (푸시업 제외) */
const BENCH = `https://images.unsplash.com/photo-1538805060514-97d01cc4922a?${Q}`;
/** 케이블 랫풀 / 풀다운 / 시티드 로우 등 */
const LAT_PULL = `https://images.unsplash.com/photo-1540497077202-7c8a3999166f?${Q}`;
/** 맨몸 푸시업 */
const PUSHUP = `https://images.unsplash.com/photo-1598971639058-fab3c3109a00?${Q}`;
/** 스쿼트 랙 */
const SQUAT = `https://images.unsplash.com/photo-1517836357463-d25dfeac3438?${Q}`;
/** 데드리프트 */
const DEAD = `https://images.unsplash.com/photo-1517963879466-e1b54ebd0642?${Q}`;
/** 바벨 로우 */
const ROW = `https://images.unsplash.com/photo-1605296867304-46d5465a13f1?${Q}`;
/** 어깨 / 오버헤드 */
const SHOULDER = `https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?${Q}`;
/** 레그 프레스 / 하체 머신 */
const LEG = `https://images.unsplash.com/photo-1434608519344-49d77a82e877?${Q}`;
/** 덤벨 컬 등 팔 */
const ARM = `https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?${Q}`;
/** 플랭크 / 코어 */
const CORE = `https://images.unsplash.com/photo-1518611012118-696072aa579a?${Q}`;
/** 전신 / 케틀벨 */
const FULL = `https://images.unsplash.com/photo-1517963879466-e1b54ebd0642?${Q}`;
/** 유산소 */
const CARDIO = `https://images.unsplash.com/photo-1576678927484-cc907957088c?${Q}`;
const GYM = `https://images.unsplash.com/photo-1534438327276-14e3350c14ce?${Q}`;

const FALLBACK = GYM;

function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/**
 * 긴 키워드부터 검사 (오매칭 방지)
 */
function inferImageUrl(n: string): string {
  // 1) 맨몸 푸시업 계열 (벤치·프레스와 혼동 방지)
  if (
    /푸시업|push[\s-]?up|pushup|팔굽/.test(n) ||
    (n.includes("클로즈") && n.includes("그립") && !n.includes("랫"))
  ) {
    return PUSHUP;
  }

  // 2) 랫풀다운 / 풀다운 / 케이블 등 상단·페이스풀
  if (
    /랫풀|랫\s*풀|풀다운|앞넓이|lat\s*pull|pull\s*down|pulldown|페이스\s*풀|face\s*pull/.test(n) ||
    (n.includes("풀업") && !n.includes("랫")) ||
    /어시스티드\s*풀업|친업/.test(n)
  ) {
    return LAT_PULL;
  }

  // 3) 팔 — 삼두 딥스 등 (가슴 딥스와 구분)
  if (
    /트라이셉스|바벨\s*컬|덤벨\s*컬|ez바|해머|프리처|스컬|케이블\s*컬|오버헤드\s*트라이셉스|리스트/.test(n) ||
    (n.includes("딥스") && n.includes("삼두"))
  ) {
    return ARM;
  }

  // 4) 가슴 벤치·프레스·플라이·크로스오버 (가슴 딥스)
  if (
    /벤치|bench|인클라인|인클|덤벨\s*프레스|바벨\s*프레스|스미스|체스트\s*프레스|펙덱|크로스오버|케이블\s*크로스|덤벨\s*플라이|풀오버/.test(n) ||
    n.includes("딥스")
  ) {
    return BENCH;
  }

  // 5) 등 바벨 로우 / T바
  if (/바벨\s*로우|t\s*바|T바|시티드\s*로우|원암|하이퍼/.test(n)) {
    return ROW;
  }

  // 6) 데드리프트
  if (/데드|dead\s*lift|rdl|루마니안/.test(n)) {
    return DEAD;
  }

  // 7) 스쿼트·런지·레그
  if (/스쿼트|squat/.test(n)) {
    return SQUAT;
  }
  if (
    /런지|lunge|레그\s*프레스|레그\s*익스텐션|레그\s*컬|카프|힙\s*어덕션|힙\s*어브|글루트|스플릿/.test(n)
  ) {
    return LEG;
  }

  // 8) 어깨
  if (
    /숄더|어깨|오버헤드|레터럴|프론트\s*레이즈|리어\s*델트|업라이트|아놀드|비하인드\s*넥|슈러그/.test(n)
  ) {
    return SHOULDER;
  }

  // 9) 팔 (남은 컬 등)
  if (/컬|curl|이두|삼두/.test(n)) {
    return ARM;
  }

  // 10) 코어
  if (/플랭크|크런치|데드\s*버그|러시안|니\s*레이즈|레그\s*레이즈|팔로우|ab\s*롤|바이시클|슈퍼맨/.test(n)) {
    return CORE;
  }

  // 11) 전신
  if (/버피|케틀벨|스래스터|마운틴|점프|박스|파워\s*클린|스러스트|burpee|swing/.test(n)) {
    return FULL;
  }

  // 12) 유산소·기타
  if (/트레드밀|조깅|걷기|싸이클|일립|스트레칭|폼롤/.test(n)) {
    return CARDIO;
  }

  return FALLBACK;
}

/** 추천 목록의 정확한 이름 → 이미지 (초기화 시 계산) */
const EXACT_FOR_SUGGESTIONS: Record<string, string> = (() => {
  const m: Record<string, string> = {};
  for (const name of ALL_SUGGESTED_EXERCISE_NAMES) {
    m[normalize(name)] = inferImageUrl(normalize(name));
  }
  return m;
})();

export function getExerciseImageUrl(exerciseName: string): string {
  const n = normalize(exerciseName);
  if (!n) return FALLBACK;
  if (EXACT_FOR_SUGGESTIONS[n]) return EXACT_FOR_SUGGESTIONS[n];
  return inferImageUrl(n);
}
