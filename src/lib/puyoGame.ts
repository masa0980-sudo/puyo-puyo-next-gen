import type { Board, Cell, Piece, PuyoColor, ConnectionGroup } from './types';
import {
  BOARD_ROWS,
  BOARD_COLS,
  MIN_CONNECT,
  CHAIN_BONUS,
  PUYO_COLORS,
  GAMEOVER_ROW,
  GAMEOVER_COL,
} from './constants';

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_ROWS }, () =>
    Array.from({ length: BOARD_COLS }, (): Cell => ({ color: 'empty' }))
  );
}

export function randomColor(): PuyoColor {
  return PUYO_COLORS[Math.floor(Math.random() * PUYO_COLORS.length)];
}

export function createPiece(): Piece {
  return {
    axisRow: 1,
    axisCol: 2,
    childRow: 0,
    childCol: 2,
    axisColor: randomColor(),
    childColor: randomColor(),
  };
}

function isValidPos(board: Board, row: number, col: number): boolean {
  return (
    row >= 0 &&
    row < BOARD_ROWS &&
    col >= 0 &&
    col < BOARD_COLS &&
    board[row][col].color === 'empty'
  );
}

export function canMovePiece(board: Board, piece: Piece, dRow: number, dCol: number): boolean {
  return (
    isValidPos(board, piece.axisRow + dRow, piece.axisCol + dCol) &&
    isValidPos(board, piece.childRow + dRow, piece.childCol + dCol)
  );
}

export function movePiece(piece: Piece, dRow: number, dCol: number): Piece {
  return {
    ...piece,
    axisRow: piece.axisRow + dRow,
    axisCol: piece.axisCol + dCol,
    childRow: piece.childRow + dRow,
    childCol: piece.childCol + dCol,
  };
}

// Rotation offsets for child relative to axis:
// 0=above, 1=right, 2=below, 3=left
const ROTATION_OFFSETS: Array<[number, number]> = [
  [-1, 0],
  [0, 1],
  [1, 0],
  [0, -1],
];

function getRotation(piece: Piece): number {
  const dRow = piece.childRow - piece.axisRow;
  const dCol = piece.childCol - piece.axisCol;
  if (dRow === -1) return 0;
  if (dCol === 1) return 1;
  if (dRow === 1) return 2;
  return 3;
}

export function rotatePiece(board: Board, piece: Piece, direction: 1 | -1): Piece {
  const currentRot = getRotation(piece);
  const newRot = (currentRot + (direction === 1 ? 1 : 3)) % 4;
  const [dRow, dCol] = ROTATION_OFFSETS[newRot];

  // Try rotation without kick
  const c1Row = piece.axisRow + dRow;
  const c1Col = piece.axisCol + dCol;
  if (isValidPos(board, c1Row, c1Col)) {
    return { ...piece, childRow: c1Row, childCol: c1Col };
  }

  // Wall kick left
  const a2Col = piece.axisCol - 1;
  const c2Col = a2Col + dCol;
  if (isValidPos(board, piece.axisRow, a2Col) && isValidPos(board, c1Row, c2Col)) {
    return { ...piece, axisCol: a2Col, childRow: c1Row, childCol: c2Col };
  }

  // Wall kick right
  const a3Col = piece.axisCol + 1;
  const c3Col = a3Col + dCol;
  if (isValidPos(board, piece.axisRow, a3Col) && isValidPos(board, c1Row, c3Col)) {
    return { ...piece, axisCol: a3Col, childRow: c1Row, childCol: c3Col };
  }

  return piece;
}

export function lockPiece(board: Board, piece: Piece): Board {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  newBoard[piece.axisRow][piece.axisCol] = { color: piece.axisColor };
  newBoard[piece.childRow][piece.childCol] = { color: piece.childColor };
  return newBoard;
}

export function calcGhostPosition(board: Board, piece: Piece): Piece {
  let ghost = { ...piece };
  while (canMovePiece(board, ghost, 1, 0)) {
    ghost = movePiece(ghost, 1, 0);
  }
  return ghost;
}

export function findErasableGroups(board: Board): ConnectionGroup[] {
  const visited = Array.from({ length: BOARD_ROWS }, () =>
    Array<boolean>(BOARD_COLS).fill(false)
  );
  const erasable: ConnectionGroup[] = [];
  const dirs: Array<[number, number]> = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  for (let row = 0; row < BOARD_ROWS; row++) {
    for (let col = 0; col < BOARD_COLS; col++) {
      if (visited[row][col] || board[row][col].color === 'empty') continue;

      const color = board[row][col].color;
      const cells: Array<{ row: number; col: number }> = [];
      const queue: Array<{ row: number; col: number }> = [{ row, col }];
      visited[row][col] = true;

      while (queue.length > 0) {
        const cur = queue.shift()!;
        cells.push(cur);
        for (const [dr, dc] of dirs) {
          const nr = cur.row + dr;
          const nc = cur.col + dc;
          if (
            nr >= 0 && nr < BOARD_ROWS &&
            nc >= 0 && nc < BOARD_COLS &&
            !visited[nr][nc] &&
            board[nr][nc].color === color
          ) {
            visited[nr][nc] = true;
            queue.push({ row: nr, col: nc });
          }
        }
      }

      if (cells.length >= MIN_CONNECT) {
        erasable.push({ color, cells });
      }
    }
  }

  return erasable;
}

export function markCellsForDeletion(board: Board, groups: ConnectionGroup[]): Board {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  for (const group of groups) {
    for (const { row, col } of group.cells) {
      newBoard[row][col] = { ...newBoard[row][col], isMarkedForDelete: true };
    }
  }
  return newBoard;
}

export function eraseMarkedCells(board: Board): Board {
  return board.map(row =>
    row.map(cell => (cell.isMarkedForDelete ? { color: 'empty' as PuyoColor } : { ...cell }))
  );
}

export function applyGravity(board: Board): Board {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  for (let col = 0; col < BOARD_COLS; col++) {
    const stack: Cell[] = [];
    for (let row = BOARD_ROWS - 1; row >= 0; row--) {
      if (newBoard[row][col].color !== 'empty') {
        stack.push({ ...newBoard[row][col] });
      }
    }
    for (let row = BOARD_ROWS - 1; row >= 0; row--) {
      const idx = BOARD_ROWS - 1 - row;
      newBoard[row][col] = idx < stack.length ? stack[idx] : { color: 'empty' };
    }
  }
  return newBoard;
}

export function checkGameOver(board: Board): boolean {
  return board[GAMEOVER_ROW][GAMEOVER_COL].color !== 'empty';
}

export function calcScore(erasedCount: number, chainCount: number): number {
  const base = erasedCount * 10;
  const bonusIdx = Math.min(chainCount - 1, CHAIN_BONUS.length - 1);
  const bonus = bonusIdx >= 0 ? CHAIN_BONUS[bonusIdx] : 0;
  return base * Math.max(1, bonus);
}
