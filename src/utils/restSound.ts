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

function shortBeep(
  ctx: AudioContext,
  frequency: number,
  start: number,
  duration = 0.14,
  volume = 0.11,
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

/** 남은 초가 3·2·1일 때 짧은 카운트다운 비프 (높아질수록 긴박) */
export function playRestCountdownTick(remainingSeconds: number): void {
  if (remainingSeconds < 1 || remainingSeconds > 3) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const t0 = ctx.currentTime;
  const hz = remainingSeconds === 3 ? 520 : remainingSeconds === 2 ? 660 : 880;
  shortBeep(ctx, hz, t0, 0.12, 0.1);
  const closeAt = Math.ceil((t0 + 0.35) * 1000);
  window.setTimeout(() => {
    void ctx.close();
  }, closeAt);
}

/** 휴식 종료 알림 (3연 비프) */
export function playRestCompleteSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const t0 = ctx.currentTime;
    shortBeep(ctx, 880, t0, 0.18, 0.12);
    shortBeep(ctx, 880, t0 + 0.22, 0.18, 0.12);
    shortBeep(ctx, 990, t0 + 0.44, 0.22, 0.13);
    window.setTimeout(() => {
      void ctx.close();
    }, 1100);
  } catch {
    void ctx.close();
  }
}
