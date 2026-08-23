interface Props {
  highScore: number;
  onStart: () => void;
}

const BLOBS: { color: string; size: number; top: string; left: string; delay: string }[] = [
  { color: '#ef4444', size: 260, top: '4%',  left: '8%',  delay: '0s' },
  { color: '#a855f7', size: 300, top: '55%', left: '-4%', delay: '-3s' },
  { color: '#3b82f6', size: 240, top: '65%', left: '68%', delay: '-7s' },
  { color: '#22c55e', size: 220, top: '2%',  left: '70%', delay: '-10s' },
  { color: '#f59e0b', size: 200, top: '30%', left: '38%', delay: '-5s' },
];

export function TitleScreen({ highScore, onStart }: Props) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-950 flex flex-col items-center justify-center gap-8 p-8">
      {/* 浮遊するぷよ色のブラー背景 */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {BLOBS.map((b, i) => (
          <div
            key={i}
            className="title-blob"
            style={{
              width: b.size, height: b.size, top: b.top, left: b.left,
              background: b.color, opacity: 0.35, animationDelay: b.delay,
            }}
          />
        ))}
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(circle at 50% 45%, rgba(5,5,16,0.15), rgba(5,5,16,0.92) 72%)' }}
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

      <div className="relative flex flex-col items-center gap-1 text-white/20 text-xs font-mono">
        <p>← → : Move　　Z / X : Rotate</p>
        <p>↓ : Soft Drop　　Space : Hard Drop</p>
        <p>P : Pause</p>
      </div>
    </div>
  );
}
