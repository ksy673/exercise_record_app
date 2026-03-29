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

function sineBeep(
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
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function triangleBeep(
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
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.start(start);
  osc.stop(start + duration + 0.03);
}

function squareBeep(
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
  gain.gain.exponentialRampToValueAtTime(volume * 0.45, start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function countdownHz(remainingSeconds: number): number {
  if (remainingSeconds === 3) return 520;
  if (remainingSeconds === 2) return 660;
  return 880;
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
  const vol = 0.1;

  try {
    switch (soundId) {
      case "beep":
        sineBeep(ctx, hz, t0, 0.12, vol);
        break;
      case "chime":
        triangleBeep(ctx, hz, t0, 0.18, vol * 1.1);
        break;
      case "bell":
        sineBeep(ctx, hz * 1.2, t0, 0.25, vol * 0.9);
        sineBeep(ctx, hz * 0.5, t0 + 0.05, 0.2, vol * 0.5);
        break;
      case "digital":
        squareBeep(ctx, hz, t0, 0.08, vol * 0.8);
        break;
      default:
        sineBeep(ctx, hz, t0, 0.12, vol);
    }
    scheduleClose(ctx, 500);
  } catch {
    void ctx.close();
  }
}

/** 휴식 종료 알림 */
export function playRestCompleteSound(soundId: RestSoundId): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const t0 = ctx.currentTime;

  try {
    switch (soundId) {
      case "beep":
        sineBeep(ctx, 880, t0, 0.18, 0.12);
        sineBeep(ctx, 880, t0 + 0.22, 0.18, 0.12);
        sineBeep(ctx, 990, t0 + 0.44, 0.22, 0.13);
        scheduleClose(ctx, 1100);
        break;
      case "chime":
        triangleBeep(ctx, 523, t0, 0.35, 0.14);
        triangleBeep(ctx, 659, t0 + 0.28, 0.35, 0.14);
        triangleBeep(ctx, 784, t0 + 0.56, 0.45, 0.15);
        scheduleClose(ctx, 1300);
        break;
      case "bell":
        sineBeep(ctx, 1046, t0, 0.4, 0.11);
        sineBeep(ctx, 784, t0 + 0.15, 0.35, 0.08);
        sineBeep(ctx, 523, t0 + 0.35, 0.5, 0.06);
        scheduleClose(ctx, 1200);
        break;
      case "digital":
        squareBeep(ctx, 1200, t0, 0.06, 0.1);
        squareBeep(ctx, 1200, t0 + 0.1, 0.06, 0.1);
        squareBeep(ctx, 1600, t0 + 0.2, 0.08, 0.12);
        squareBeep(ctx, 2000, t0 + 0.32, 0.1, 0.12);
        scheduleClose(ctx, 600);
        break;
      default:
        sineBeep(ctx, 880, t0, 0.18, 0.12);
        scheduleClose(ctx, 400);
    }
  } catch {
    void ctx.close();
  }
}
