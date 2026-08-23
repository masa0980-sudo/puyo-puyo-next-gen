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

/* =========================================================
   BGM — プレイ中だけ鳴らすループ曲。外部音源は使わず、
   look-ahead スケジューラでベース+リードの16分音符パターンを
   ループ再生する(効果音と同じ Web Audio API の合成のみ)。
   ========================================================= */
const NOTE: Record<string, number> = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25,
};

const BGM_BPM = 132;
const SIXTEENTH = 60 / BGM_BPM / 4;
const BGM_STEPS = 16;
// 4分音符ごと(拍)のベースライン。C-G-Am-G の軽快な進行
const BGM_BASS = ['C3', null, null, null, 'G3', null, null, null, 'A3', null, null, null, 'G3', null, null, null];
// 8分音符ごとのリード。跳ねるアルペジオ
const BGM_LEAD = ['E4', null, 'G4', null, 'E4', null, 'D4', null, 'G4', null, 'E4', null, 'A4', null, 'G4', null];

let bgmTimerId: number | null = null;
let bgmNextTime = 0;
let bgmStep = 0;

function scheduleBgmStep(step: number, offset: number) {
  const bassNote = BGM_BASS[step];
  if (bassNote) tone(NOTE[bassNote], SIXTEENTH * 3.6, 'triangle', 0.14, offset);
  const leadNote = BGM_LEAD[step];
  if (leadNote) tone(NOTE[leadNote], SIXTEENTH * 1.6, 'sine', 0.08, offset);
}

function bgmTick() {
  const ac = getCtx();
  if (!ac) return;
  while (bgmNextTime < ac.currentTime + 0.15) {
    scheduleBgmStep(bgmStep, bgmNextTime - ac.currentTime);
    bgmNextTime += SIXTEENTH;
    bgmStep = (bgmStep + 1) % BGM_STEPS;
  }
}

export function startBgm() {
  const ac = getCtx();
  if (!ac || bgmTimerId !== null) return;
  if (ac.state === 'suspended') ac.resume();
  bgmStep = 0;
  bgmNextTime = ac.currentTime + 0.05;
  bgmTimerId = window.setInterval(bgmTick, 50);
}

export function stopBgm() {
  if (bgmTimerId !== null) {
    window.clearInterval(bgmTimerId);
    bgmTimerId = null;
  }
}
