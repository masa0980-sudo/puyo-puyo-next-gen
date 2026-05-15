'use client';

interface Props {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
}

export function TouchControls({ onMoveLeft, onMoveRight, onSoftDrop, onHardDrop, onRotateLeft, onRotateRight }: Props) {
  return (
    <div className="mt-4 flex items-center gap-3 touch-none select-none pointer:coarse:flex pointer:fine:hidden">
      <div className="flex gap-2">
        <Btn onPress={onRotateLeft} label="↺" color="#7c3aed" />
        <Btn onPress={onRotateRight} label="↻" color="#2563eb" />
      </div>
      <div className="flex flex-col gap-1 items-center">
        <div className="flex gap-1">
          <Btn onPress={onMoveLeft} label="◀" />
          <Btn onPress={onSoftDrop} label="▼" />
          <Btn onPress={onMoveRight} label="▶" />
        </div>
        <Btn onPress={onHardDrop} label="DROP" wide />
      </div>
    </div>
  );
}

function Btn({ onPress, label, color, wide = false }: { onPress: () => void; label: string; color?: string; wide?: boolean }) {
  return (
    <button
      onPointerDown={e => { e.preventDefault(); onPress(); }}
      className={`flex items-center justify-center rounded-xl font-bold text-white active:scale-90 transition-transform select-none ${wide ? 'px-8 py-3' : 'w-12 h-12'}`}
      style={{ background: color ?? 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', fontSize: wide ? '0.75rem' : '1rem' }}
    >
      {label}
    </button>
  );
}
