let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return ctx;
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.25,
  startOffset = 0,
  freqEnd?: number,
) {
  const ac = getCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.type = type;
  const t = ac.currentTime + startOffset;
  osc.frequency.setValueAtTime(freq, t);
  if (freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(freqEnd, t + duration);
  }
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.start(t);
  osc.stop(t + duration);
}

export function playMove() {
  tone(220, 0.04, 'square', 0.06);
}

export function playRotate() {
  tone(440, 0.05, 'square', 0.08);
  tone(550, 0.05, 'square', 0.06, 0.04);
}

export function playLand() {
  tone(140, 0.12, 'sine', 0.35, 0, 70);
}

export function playHardDrop() {
  tone(220, 0.14, 'sawtooth', 0.45, 0, 55);
  tone(120, 0.1, 'sine', 0.3, 0.04, 50);
}

export function playErase(chainCount: number) {
  const base = 500 + chainCount * 120;
  const pops = Math.min(chainCount + 1, 5);
  for (let i = 0; i < pops; i++) {
    tone(base + i * 80, 0.1, 'sine', 0.3, i * 0.055);
  }
}

export function playGameOver() {
  const melody = [440, 370, 330, 220];
  melody.forEach((f, i) => tone(f, 0.28, 'sine', 0.35, i * 0.22));
}
