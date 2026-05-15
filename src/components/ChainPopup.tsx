'use client';

interface Props {
  chainCount: number;
  onAnimationEnd: () => void;
}

const CHAIN_COLORS = ['', 'text-yellow-300', 'text-orange-400', 'text-red-400', 'text-pink-400', 'text-purple-400'];

export function ChainPopup({ chainCount, onAnimationEnd }: Props) {
  const colorClass = CHAIN_COLORS[Math.min(chainCount, CHAIN_COLORS.length - 1)] || 'text-yellow-300';

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
    >
      <div
        className={`font-black font-mono text-center animate-chain-popup ${colorClass}`}
        style={{ textShadow: '0 0 20px currentColor, 0 2px 4px rgba(0,0,0,0.8)', fontSize: 'clamp(2rem, 8vw, 4rem)' }}
        onAnimationEnd={onAnimationEnd}
      >
        {chainCount} CHAIN!
      </div>
    </div>
  );
}
