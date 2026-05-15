export type PuyoColor = 'red' | 'green' | 'blue' | 'yellow' | 'purple' | 'empty';

export interface Cell {
  color: PuyoColor;
  isMarkedForDelete?: boolean;
}

export type Board = Cell[][];

export interface Piece {
  axisRow: number;
  axisCol: number;
  childRow: number;
  childCol: number;
  axisColor: PuyoColor;
  childColor: PuyoColor;
}

export type GamePhase =
  | 'title'
  | 'falling'
  | 'locking'
  | 'checking'
  | 'erasing'
  | 'dropping'
  | 'paused'
  | 'gameover';

export interface GameState {
  phase: GamePhase;
  board: Board;
  currentPiece: Piece | null;
  nextPiece: Piece;
  nextNextPiece: Piece;
  score: number;
  highScore: number;
  level: number;
  chainCount: number;
  totalChains: number;
  totalErasureRounds: number;
  dropInterval: number;
  showChainPopup: boolean;
  erasingTickCount: number;
}

export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'MOVE_LEFT' }
  | { type: 'MOVE_RIGHT' }
  | { type: 'SOFT_DROP' }
  | { type: 'HARD_DROP' }
  | { type: 'ROTATE_LEFT' }
  | { type: 'ROTATE_RIGHT' }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'TICK' }
  | { type: 'HIDE_CHAIN_POPUP' }
  | { type: 'RETURN_TO_TITLE' };

export interface ConnectionGroup {
  color: PuyoColor;
  cells: Array<{ row: number; col: number }>;
}
