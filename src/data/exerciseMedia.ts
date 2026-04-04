/**
 * 운동 이름 → 대표 이미지 URL.
 * 키워드 순서가 중요합니다(구체적인 것부터 매칭).
 */
import { ALL_SUGGESTED_EXERCISE_NAMES } from "./exerciseSuggestions";


/** 바벨 벤치 / 가슴 프레스 계열 (푸시업 제외) */
const BENCH = `/images/bench_press_anatomy_1775279390936.png`;
/** 케이블 랫풀 / 풀다운 / 시티드 로우 등 */
const LAT_PULL = `/images/lat_pull_anatomy_1775279406604.png`;
/** 맨몸 푸시업 */
const PUSHUP = `/images/bench_press_anatomy_1775279390936.png`; // Reusing chest image
/** 스쿼트 랙 */
const SQUAT = `/images/squat_anatomy_1775279420141.png`;
/** 데드리프트 */
const DEAD = `/images/deadlift_anatomy_1775279456538.png`;
/** 바벨 로우 */
const ROW = `/images/lat_pull_anatomy_1775279406604.png`; // Reusing back image
/** 어깨 / 오버헤드 */
const SHOULDER = `/images/shoulder_press_anatomy_1775279434450.png`;
/** 레그 프레스 / 하체 머신 */
const LEG = `/images/squat_anatomy_1775279420141.png`; // Reusing leg image
/** 덤벨 컬 등 팔 */
const ARM = `/images/arms_curl_anatomy_1775279471360.png`;
/** 플랭크 / 코어 */
const CORE = `/images/core_abs_anatomy_1775279491248.png`;
/** 전신 / 케틀벨 */
const FULL = `/images/full_body_1775279070656.png`;
/** 유산소 */
const CARDIO = `/images/cardio_run_1775279092572.png`;
const GYM = `/images/gym_generic_1775279109770.png`;

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
