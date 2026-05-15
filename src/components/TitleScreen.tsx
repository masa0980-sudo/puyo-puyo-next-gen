interface Props {
  highScore: number;
  onStart: () => void;
}

export function TitleScreen({ highScore, onStart }: Props) {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-8 p-8">
      <div className="flex flex-col items-center gap-2">
        <div className="text-6xl font-black tracking-tight" style={{ background: 'linear-gradient(135deg, #ef4444, #a855f7, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          PUYO
        </div>
        <div className="text-6xl font-black tracking-tight" style={{ background: 'linear-gradient(135deg, #3b82f6, #22c55e, #eab308)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          PUYO
        </div>
        <div className="text-sm text-white/40 font-mono tracking-widest mt-2">NEXT GEN EDITION</div>
      </div>

      {highScore > 0 && (
        <div
          className="flex flex-col items-center px-8 py-4 rounded-2xl"
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
        className="px-12 py-4 rounded-2xl text-xl font-bold text-white transition-all duration-200 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
          boxShadow: '0 0 30px rgba(124,58,237,0.5)',
        }}
        onMouseEnter={e => { (e.target as HTMLElement).style.transform = 'scale(1.05)'; }}
        onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'scale(1)'; }}
      >
        PLAY NOW
      </button>

      <div className="flex flex-col items-center gap-1 text-white/20 text-xs font-mono">
        <p>← → : Move　　Z / X : Rotate</p>
        <p>↓ : Soft Drop　　Space : Hard Drop</p>
        <p>P : Pause</p>
      </div>
    </div>
  );
}
