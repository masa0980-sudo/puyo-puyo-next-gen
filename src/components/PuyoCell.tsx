import type { PuyoColor } from '@/lib/types';

interface Props {
  color: PuyoColor;
  isGhost?: boolean;
  isErasing?: boolean;
}

const GRADIENT: Record<PuyoColor, string> = {
  red:    'radial-gradient(circle at 35% 30%, #fca5a5, #ef4444 55%, #991b1b)',
  green:  'radial-gradient(circle at 35% 30%, #86efac, #22c55e 55%, #14532d)',
  blue:   'radial-gradient(circle at 35% 30%, #93c5fd, #3b82f6 55%, #1e3a8a)',
  yellow: 'radial-gradient(circle at 35% 30%, #fde68a, #f59e0b 55%, #78350f)',
  purple: 'radial-gradient(circle at 35% 30%, #e9d5ff, #a855f7 55%, #4c1d95)',
  empty:  'none',
};

const GLOW: Record<PuyoColor, string> = {
  red:    '0 0 8px rgba(239,68,68,0.6), inset 0 1px 0 rgba(255,255,255,0.3)',
  green:  '0 0 8px rgba(34,197,94,0.6), inset 0 1px 0 rgba(255,255,255,0.3)',
  blue:   '0 0 8px rgba(59,130,246,0.6), inset 0 1px 0 rgba(255,255,255,0.3)',
  yellow: '0 0 8px rgba(245,158,11,0.6), inset 0 1px 0 rgba(255,255,255,0.3)',
  purple: '0 0 8px rgba(168,85,247,0.6), inset 0 1px 0 rgba(255,255,255,0.3)',
  empty:  'none',
};

export function PuyoCell({ color, isGhost = false, isErasing = false }: Props) {
  if (color === 'empty') {
    return (
      <div className="w-full h-full rounded-sm" style={{ background: 'rgba(255,255,255,0.03)' }} />
    );
  }

  return (
    <div
      className={`w-full h-full rounded-full relative overflow-hidden ${isErasing ? 'animate-puyo-erase' : ''}`}
      style={{
        background: GRADIENT[color],
        boxShadow: isGhost ? 'none' : GLOW[color],
        opacity: isGhost ? 0.35 : 1,
        border: isGhost ? '1px dashed rgba(255,255,255,0.4)' : 'none',
      }}
    >
      {!isGhost && (
        <div
          className="absolute top-1 left-1.5 rounded-full bg-white/50"
          style={{ width: '35%', height: '25%', filter: 'blur(1px)' }}
        />
      )}
    </div>
  );
}
