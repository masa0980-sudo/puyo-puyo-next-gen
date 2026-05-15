import type { GameState, GameAction } from './types';
import {
  createEmptyBoard,
  createPiece,
  canMovePiece,
  movePiece,
  rotatePiece,
  lockPiece,
  calcGhostPosition,
  findErasableGroups,
  markCellsForDeletion,
  eraseMarkedCells,
  applyGravity,
  checkGameOver,
  calcScore,
} from './puyoGame';
import {
  INITIAL_DROP_INTERVAL,
  MIN_DROP_INTERVAL,
  INTERVAL_DECREASE,
  LEVEL_UP_ERASURES,
  ERASE_ANIM_TICKS,
} from './constants';
import { loadHighScore, saveHighScore } from './storage';

export function createTitleState(): GameState {
  return {
    phase: 'title',
    board: createEmptyBoard(),
    currentPiece: null,
    nextPiece: createPiece(),
    nextNextPiece: createPiece(),
    score: 0,
    highScore: loadHighScore(),
    level: 1,
    chainCount: 0,
    totalChains: 0,
    totalErasureRounds: 0,
    dropInterval: INITIAL_DROP_INTERVAL,
    showChainPopup: false,
    erasingTickCount: 0,
  };
}

function createGameState(highScore: number): GameState {
  return {
    phase: 'falling',
    board: createEmptyBoard(),
    currentPiece: createPiece(),
    nextPiece: createPiece(),
    nextNextPiece: createPiece(),
    score: 0,
    highScore,
    level: 1,
    chainCount: 0,
    totalChains: 0,
    totalErasureRounds: 0,
    dropInterval: INITIAL_DROP_INTERVAL,
    showChainPopup: false,
    erasingTickCount: 0,
  };
}

function tickFalling(state: GameState): GameState {
  if (!state.currentPiece) return state;
  if (canMovePiece(state.board, state.currentPiece, 1, 0)) {
    return { ...state, currentPiece: movePiece(state.currentPiece, 1, 0) };
  }
  return { ...state, phase: 'locking' };
}

function tickLocking(state: GameState): GameState {
  if (!state.currentPiece) return { ...state, phase: 'checking' };
  const newBoard = applyGravity(lockPiece(state.board, state.currentPiece));
  return {
    ...state,
    board: newBoard,
    currentPiece: null,
    phase: 'checking',
    chainCount: 0,
  };
}

function tickChecking(state: GameState): GameState {
  const groups = findErasableGroups(state.board);

  if (groups.length === 0) {
    if (checkGameOver(state.board)) {
      const newHighScore = Math.max(state.score, state.highScore);
      if (newHighScore > state.highScore) saveHighScore(newHighScore);
      return { ...state, phase: 'gameover', highScore: newHighScore };
    }
    return {
      ...state,
      phase: 'falling',
      currentPiece: state.nextPiece,
      nextPiece: state.nextNextPiece,
      nextNextPiece: createPiece(),
      chainCount: 0,
      showChainPopup: false,
    };
  }

  const erasedCount = groups.reduce((sum, g) => sum + g.cells.length, 0);
  const newChainCount = state.chainCount + 1;
  const scoreGain = calcScore(erasedCount, newChainCount);
  const newScore = state.score + scoreGain;
  const newHighScore = Math.max(newScore, state.highScore);
  const newTotalChains = Math.max(state.totalChains, newChainCount);
  const newTotalErasureRounds = state.totalErasureRounds + 1;

  const newLevel =
    newTotalErasureRounds % LEVEL_UP_ERASURES === 0
      ? state.level + 1
      : state.level;
  const newDropInterval =
    newTotalErasureRounds % LEVEL_UP_ERASURES === 0
      ? Math.max(MIN_DROP_INTERVAL, state.dropInterval - INTERVAL_DECREASE)
      : state.dropInterval;

  const markedBoard = markCellsForDeletion(state.board, groups);

  return {
    ...state,
    board: markedBoard,
    score: newScore,
    highScore: newHighScore,
    level: newLevel,
    dropInterval: newDropInterval,
    chainCount: newChainCount,
    totalChains: newTotalChains,
    totalErasureRounds: newTotalErasureRounds,
    phase: 'erasing',
    erasingTickCount: 0,
    showChainPopup: true,
  };
}

function tickErasing(state: GameState): GameState {
  const newTickCount = state.erasingTickCount + 1;
  if (newTickCount < ERASE_ANIM_TICKS) {
    return { ...state, erasingTickCount: newTickCount };
  }
  const newBoard = eraseMarkedCells(state.board);
  return { ...state, board: newBoard, phase: 'dropping', erasingTickCount: 0 };
}

function tickDropping(state: GameState): GameState {
  const newBoard = applyGravity(state.board);
  return { ...state, board: newBoard, phase: 'checking' };
}

function handleTick(state: GameState): GameState {
  switch (state.phase) {
    case 'falling':  return tickFalling(state);
    case 'locking':  return tickLocking(state);
    case 'checking': return tickChecking(state);
    case 'erasing':  return tickErasing(state);
    case 'dropping': return tickDropping(state);
    default:         return state;
  }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return createGameState(state.highScore);

    case 'RETURN_TO_TITLE':
      return { ...state, phase: 'title' };

    case 'TICK':
      return handleTick(state);

    case 'MOVE_LEFT':
      if (state.phase !== 'falling' || !state.currentPiece) return state;
      if (!canMovePiece(state.board, state.currentPiece, 0, -1)) return state;
      return { ...state, currentPiece: movePiece(state.currentPiece, 0, -1) };

    case 'MOVE_RIGHT':
      if (state.phase !== 'falling' || !state.currentPiece) return state;
      if (!canMovePiece(state.board, state.currentPiece, 0, 1)) return state;
      return { ...state, currentPiece: movePiece(state.currentPiece, 0, 1) };

    case 'SOFT_DROP':
      if (state.phase !== 'falling' || !state.currentPiece) return state;
      if (!canMovePiece(state.board, state.currentPiece, 1, 0)) return state;
      return { ...state, currentPiece: movePiece(state.currentPiece, 1, 0) };

    case 'HARD_DROP': {
      if (state.phase !== 'falling' || !state.currentPiece) return state;
      const ghost = calcGhostPosition(state.board, state.currentPiece);
      const lockedBoard = applyGravity(lockPiece(state.board, ghost));
      return {
        ...state,
        board: lockedBoard,
        currentPiece: null,
        phase: 'checking',
        chainCount: 0,
      };
    }

    case 'ROTATE_LEFT':
      if (state.phase !== 'falling' || !state.currentPiece) return state;
      return { ...state, currentPiece: rotatePiece(state.board, state.currentPiece, -1) };

    case 'ROTATE_RIGHT':
      if (state.phase !== 'falling' || !state.currentPiece) return state;
      return { ...state, currentPiece: rotatePiece(state.board, state.currentPiece, 1) };

    case 'TOGGLE_PAUSE':
      if (state.phase === 'falling') return { ...state, phase: 'paused' };
      if (state.phase === 'paused') return { ...state, phase: 'falling' };
      return state;

    case 'HIDE_CHAIN_POPUP':
      return { ...state, showChainPopup: false };

    default:
      return state;
  }
}
