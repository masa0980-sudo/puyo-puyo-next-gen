const STORAGE_KEY = 'puyo-high-score';

export function loadHighScore(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(STORAGE_KEY) ?? '0', 10);
}

let writeDisabled = false;
/** ミニ版(メドレー)ではハイスコアを書かない */
export function disableStorageWrites() {
  writeDisabled = true;
}

export function saveHighScore(score: number): void {
  if (typeof window === 'undefined' || writeDisabled) return;
  localStorage.setItem(STORAGE_KEY, score.toString());
}
