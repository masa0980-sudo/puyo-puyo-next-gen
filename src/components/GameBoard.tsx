import type { Board, Piece, PuyoColor } from '@/lib/types';
import { VISIBLE_ROWS, BOARD_COLS } from '@/lib/constants';
import { PuyoCell } from './PuyoCell';

interface Props {
  board: Board;
  currentPiece: Piece | null;
  ghostPiece: Piece | null;
}

interface DisplayCell {
  color: PuyoColor;
  isGhost: boolean;
  isErasing: boolean;
}

export function GameBoard({ board, currentPiece, ghostPiece }: Props) {
  const grid: DisplayCell[][] = Array.from({ length: VISIBLE_ROWS }, (_, ri) =>
    Array.from({ length: BOARD_COLS }, (_, ci) => {
      const cell = board[ri + 1][ci];
      return { color: cell.color, isGhost: false, isErasing: cell.isMarkedForDelete ?? false };
    })
  );

  if (ghostPiece) {
    const gCells = [
      { row: ghostPiece.axisRow - 1, col: ghostPiece.axisCol, color: ghostPiece.axisColor },
      { row: ghostPiece.childRow - 1, col: ghostPiece.childCol, color: ghostPiece.childColor },
    ];
    for (const { row, col, color } of gCells) {
      if (row >= 0 && row < VISIBLE_ROWS && grid[row][col].color === 'empty') {
        grid[row][col] = { color, isGhost: true, isErasing: false };
      }
    }
  }

  if (currentPiece) {
    const pCells = [
      { row: currentPiece.axisRow - 1, col: currentPiece.axisCol, color: currentPiece.axisColor },
      { row: currentPiece.childRow - 1, col: currentPiece.childCol, color: currentPiece.childColor },
    ];
    for (const { row, col, color } of pCells) {
      if (row >= 0 && row < VISIBLE_ROWS) {
        grid[row][col] = { color, isGhost: false, isErasing: false };
      }
    }
  }

  return (
    <div
      className="rounded-xl overflow-hidden p-1"
      style={{
        background: 'rgba(0,0,20,0.75)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.12)',
        display: 'grid',
        gridTemplateRows: `repeat(${VISIBLE_ROWS}, 1fr)`,
        gridTemplateColumns: `repeat(${BOARD_COLS}, 1fr)`,
        gap: '2px',
        width: 'calc(var(--cell-size) * 6 + 2px * 5 + 8px)',
        height: 'calc(var(--cell-size) * 12 + 2px * 11 + 8px)',
      }}
    >
      {grid.map((row, ri) =>
        row.map((cell, ci) => (
          <div key={`${ri}-${ci}`} style={{ width: 'var(--cell-size)', height: 'var(--cell-size)' }}>
            <PuyoCell color={cell.color} isGhost={cell.isGhost} isErasing={cell.isErasing} />
          </div>
        ))
      )}
    </div>
  );
}
