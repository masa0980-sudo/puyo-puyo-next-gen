const STORAGE_KEY = 'puyo-high-score';

export function loadHighScore(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(STORAGE_KEY) ?? '0', 10);
}

export function saveHighScore(score: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, score.toString());
}
