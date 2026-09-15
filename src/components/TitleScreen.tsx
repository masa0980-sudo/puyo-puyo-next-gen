import { useEffect, useState } from 'react';
import { fetchCount } from '@/lib/playCounts';

interface Props {
  highScore: number;
  onStart: () => void;
}

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function TitleScreen({ highScore, onStart }: Props) {
  const [playCount, setPlayCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchCount().then((count) => {
      if (!cancelled) setPlayCount(count);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-950 flex flex-col items-center justify-center gap-8 p-8">
      {/* キーアート背景。読み込めない環境でも下地の黒背景だけで成立するようにしてある */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute inset-0 bg-cover"
          style={{ backgroundImage: `url(${BASE_PATH}/keyart.jpg)`, backgroundPosition: 'center 85%' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(5,5,16,0.55) 0%, rgba(5,5,16,0.45) 40%, rgba(5,5,16,0.85) 78%, rgba(5,5,16,0.97) 100%)' }}
        />
      </div>

      <div className="relative flex flex-col items-center gap-2">
        <div className="text-7xl sm:text-8xl font-black tracking-tight drop-shadow-[0_0_40px_rgba(168,85,247,0.35)]" style={{ background: 'linear-gradient(135deg, #ef4444, #a855f7, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          PUYO
        </div>
        <div className="text-7xl sm:text-8xl font-black tracking-tight drop-shadow-[0_0_40px_rgba(34,197,94,0.35)]" style={{ background: 'linear-gradient(135deg, #3b82f6, #22c55e, #eab308)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          PUYO
        </div>
        <div className="text-sm text-white/40 font-mono tracking-widest mt-2">NEXT GEN EDITION</div>
      </div>

      {highScore > 0 && (
        <div
          className="relative flex flex-col items-center px-8 py-4 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <span className="text-xs text-white/40 font-mono tracking-widest">BEST SCORE</span>
          <span className="text-3xl font-bold font-mono text-yellow-300 tabular-nums">
            {highScore.toLocaleString()}
          </span>
        </div>
      )}

      {playCount !== null && (
        <p className="relative text-xs text-white/40 font-mono tracking-wide">
          これまでに {playCount.toLocaleString()} 回プレイされています
        </p>
      )}

      <button
        onClick={onStart}
        className="relative px-12 py-4 rounded-2xl text-xl font-bold text-white transition-all duration-200 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
          boxShadow: '0 0 30px rgba(124,58,237,0.5)',
        }}
        onMouseEnter={e => { (e.target as HTMLElement).style.transform = 'scale(1.05)'; }}
        onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'scale(1)'; }}
      >
        PLAY NOW
      </button>

      <div
        className="relative flex flex-col items-center gap-1.5 px-6 py-3 rounded-xl text-xs font-mono text-white/80"
        style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.14)' }}
      >
        <p><span className="font-bold text-white">← →</span> Move　　<span className="font-bold text-white">Z / X</span> Rotate</p>
        <p><span className="font-bold text-white">↓</span> Soft Drop　　<span className="font-bold text-white">Space</span> Hard Drop</p>
        <p><span className="font-bold text-white">P</span> Pause</p>
      </div>
    </div>
  );
}
