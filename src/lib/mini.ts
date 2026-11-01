// ミニゲーム・メドレー(mini-medley)から ?mini=1&sec=N&mute=0|1 で呼ばれたときの約束。
// 仕様の正本は mini-medley/CLAUDE.md。mini=1 が無いときは何もしない(従来どおり)。
export const GAME_ID = 'puyo-puyo-next-gen';
// 30秒では4個消し(40点)を1〜2回できる程度。スコアだと数点にしかならないので、
// 「消したぷよの個数」を主役にし、置いたペア数でも少し点が入るようにする(0点続きを防ぐ)。
export const MINI_ERASED_FOR_100 = 20; // 消したぷよ20個(4個消し5回分)で満点
export const MINI_DROP_INTERVAL = 450; // ミニ版は落下を速くして30秒でも動きが出るようにする(通常は800ms)

export interface MiniConfig {
  sec: number;
  mute: boolean;
}

export function readMini(): MiniConfig | null {
  if (typeof window === 'undefined') return null;
  const q = new URLSearchParams(window.location.search);
  if (q.get('mini') !== '1') return null;
  const sec = Number(q.get('sec'));
  return { sec: sec > 0 ? sec : 30, mute: q.get('mute') === '1' };
}

export function postToHub(msg: Record<string, unknown>): void {
  try {
    window.parent.postMessage({ ...msg, game: GAME_ID }, '*');
  } catch {
    /* 親が無いときは何もしない */
  }
}

export function scoreToPoints(erased: number, locked: number, chains: number): number {
  const fromErased = (erased / MINI_ERASED_FOR_100) * 70;
  const fromLocked = Math.min(locked, 10) * 1.5; // 置いただけでも最大15点
  const fromChains = Math.max(0, chains - 1) * 8; // 連鎖ボーナス
  return Math.max(0, Math.min(100, Math.round(fromErased + fromLocked + fromChains)));
}
