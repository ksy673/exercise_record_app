import type { RestSoundId } from "../types";

type WinAudio = typeof AudioContext;

function getAudioContext(): AudioContext | null {
  try {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: WinAudio }).webkitAudioContext;
    return AC ? new AC() : null;
  } catch {
    return null;
  }
}

function scheduleClose(ctx: AudioContext, ms: number): void {
  window.setTimeout(() => {
    void ctx.close();
  }, ms);
}

/** 밝고 짧은 톤 (경쾌한 느낌) */
function brightBeep(
  ctx: AudioContext,
  frequency: number,
  start: number,
  duration: number,
  volume: number,
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function triangleBright(
  ctx: AudioContext,
  frequency: number,
  start: number,
  duration: number,
  volume: number,
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "triangle";
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.start(start);
  osc.stop(start + duration + 0.03);
}

function squareBright(
  ctx: AudioContext,
  frequency: number,
  start: number,
  duration: number,
  volume: number,
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "square";
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume * 0.35, start + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

/** 3·2·1 — 높은 쪽으로 갈수록 더 밝게 */
function countdownHz(remainingSeconds: number): number {
  if (remainingSeconds === 3) return 740;
  if (remainingSeconds === 2) return 990;
  return 1318;
}

/** 남은 초가 3·2·1일 때 카운트다운 틱 */
export function playRestCountdownTick(
  remainingSeconds: number,
  soundId: RestSoundId,
): void {
  if (remainingSeconds < 1 || remainingSeconds > 3) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const t0 = ctx.currentTime;
  const hz = countdownHz(remainingSeconds);
  const vol = 0.11;

  try {
    switch (soundId) {
      case "beep":
        brightBeep(ctx, hz, t0, 0.1, vol);
        break;
      case "chime":
        triangleBright(ctx, hz, t0, 0.14, vol * 1.15);
        break;
      case "bell":
        brightBeep(ctx, hz * 1.05, t0, 0.16, vol);
        brightBeep(ctx, hz * 0.62, t0 + 0.04, 0.12, vol * 0.55);
        break;
      case "digital":
        squareBright(ctx, hz, t0, 0.06, vol * 0.85);
        break;
      default:
        brightBeep(ctx, hz, t0, 0.1, vol);
    }
    scheduleClose(ctx, 450);
  } catch {
    void ctx.close();
  }
}

/** 휴식 종료 — 메이저 느낌의 짧은 상승 알림 */
export function playRestCompleteSound(soundId: RestSoundId): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const t0 = ctx.currentTime;

  try {
    switch (soundId) {
      case "beep":
        brightBeep(ctx, 1046, t0, 0.12, 0.13);
        brightBeep(ctx, 1318, t0 + 0.14, 0.12, 0.13);
        brightBeep(ctx, 1568, t0 + 0.28, 0.16, 0.14);
        scheduleClose(ctx, 700);
        break;
      case "chime":
        triangleBright(ctx, 784, t0, 0.2, 0.14);
        triangleBright(ctx, 988, t0 + 0.18, 0.2, 0.14);
        triangleBright(ctx, 1175, t0 + 0.38, 0.28, 0.15);
        scheduleClose(ctx, 900);
        break;
      case "bell":
        brightBeep(ctx, 1175, t0, 0.22, 0.12);
        brightBeep(ctx, 880, t0 + 0.12, 0.18, 0.1);
        brightBeep(ctx, 1318, t0 + 0.28, 0.24, 0.11);
        scheduleClose(ctx, 800);
        break;
      case "digital":
        squareBright(ctx, 1400, t0, 0.05, 0.1);
        squareBright(ctx, 1760, t0 + 0.08, 0.05, 0.1);
        squareBright(ctx, 2093, t0 + 0.16, 0.06, 0.11);
        squareBright(ctx, 2637, t0 + 0.26, 0.07, 0.12);
        scheduleClose(ctx, 500);
        break;
      default:
        brightBeep(ctx, 1046, t0, 0.12, 0.13);
        scheduleClose(ctx, 400);
    }
  } catch {
    void ctx.close();
  }
}
