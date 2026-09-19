'use client';

import { useCallback, useEffect, useRef } from 'react';

interface Props {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
}

// 長押しオートリピート。キーボードの keydown リピートと同じ感覚で、
// ◀▶▼ を押しっぱなしにすると DAS_MS 後から REPEAT_MS 間隔で連打扱いにする。
const DAS_MS = 170;
const REPEAT_MS = 50;

export function TouchControls({ onMoveLeft, onMoveRight, onSoftDrop, onHardDrop, onRotateLeft, onRotateRight }: Props) {
  return (
    <div className="mt-4 flex items-center gap-3 touch-none select-none pointer:coarse:flex pointer:fine:hidden">
      <div className="flex gap-2">
        <Btn onPress={onRotateLeft} label="↺" color="#7c3aed" />
        <Btn onPress={onRotateRight} label="↻" color="#2563eb" />
      </div>
      <div className="flex flex-col gap-1 items-center">
        <div className="flex gap-1">
          <Btn onPress={onMoveLeft} label="◀" repeat />
          <Btn onPress={onSoftDrop} label="▼" repeat />
          <Btn onPress={onMoveRight} label="▶" repeat />
        </div>
        <Btn onPress={onHardDrop} label="DROP" wide />
      </div>
    </div>
  );
}

function Btn({ onPress, label, color, wide = false, repeat = false }: { onPress: () => void; label: string; color?: string; wide?: boolean; repeat?: boolean }) {
  const delayRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  // 最新の onPress を参照する(リピート中に親が再レンダーされても古いクロージャを呼ばない)
  const onPressRef = useRef(onPress);
  onPressRef.current = onPress;

  const stop = useCallback(() => {
    if (delayRef.current !== null) { clearTimeout(delayRef.current); delayRef.current = null; }
    if (intervalRef.current !== null) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);
  useEffect(() => stop, [stop]);

  return (
    <button
      onPointerDown={e => {
        e.preventDefault();
        // 指が少しずれてもボタン外に出た扱いにならないよう、このポインタをボタンに固定する
        try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* 非対応でも動作に支障なし */ }
        onPressRef.current();
        if (repeat) {
          stop();
          delayRef.current = window.setTimeout(() => {
            intervalRef.current = window.setInterval(() => onPressRef.current(), REPEAT_MS);
          }, DAS_MS);
        }
      }}
      onPointerUp={stop}
      onPointerCancel={stop}
      onLostPointerCapture={stop}
      onContextMenu={e => e.preventDefault()}
      className={`flex items-center justify-center rounded-xl font-bold text-white active:scale-90 transition-transform select-none touch-none ${wide ? 'px-8 py-3' : 'w-12 h-12'}`}
      style={{ background: color ?? 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', fontSize: wide ? '0.75rem' : '1rem', WebkitTouchCallout: 'none' }}
    >
      {label}
    </button>
  );
}
