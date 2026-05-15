import type { Piece } from '@/lib/types';
import { PuyoCell } from './PuyoCell';

interface Props {
  label: string;
  piece: Piece;
}

export function NextPiece({ label, piece }: Props) {
  return (
    <div
      className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      <span className="text-xs text-white/40 font-mono tracking-widest">{label}</span>
      <div className="flex flex-col gap-1">
        <div style={{ width: 'calc(var(--cell-size) * 0.75)', height: 'calc(var(--cell-size) * 0.75)' }}>
          <PuyoCell color={piece.childColor} />
        </div>
        <div style={{ width: 'calc(var(--cell-size) * 0.75)', height: 'calc(var(--cell-size) * 0.75)' }}>
          <PuyoCell color={piece.axisColor} />
        </div>
      </div>
    </div>
  );
}
