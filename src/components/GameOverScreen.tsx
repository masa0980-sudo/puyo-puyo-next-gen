interface Props {
  score: number;
  highScore: number;
  maxChain: number;
  onRetry: () => void;
  onTitle: () => void;
}

export function GameOverScreen({ score, highScore, maxChain, onRetry, onTitle }: Props) {
  const isNewRecord = score >= highScore && score > 0;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-30 rounded-2xl"
      style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(12px)' }}>
      <div className="flex flex-col items-center gap-1">
        <p className="text-4xl font-black tracking-widest" style={{ color: '#ef4444' }}>GAME OVER</p>
        {isNewRecord && (
          <p className="text-sm font-bold text-yellow-300 tracking-widest animate-pulse">★ NEW RECORD ★</p>
        )}
      </div>

      <div className="flex flex-col gap-2 text-center px-8 py-4 rounded-2xl w-56"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <ResultRow label="SCORE" value={score.toLocaleString()} highlight={isNewRecord} />
        <ResultRow label="BEST" value={highScore.toLocaleString()} />
        <ResultRow label="MAX CHAIN" value={`${maxChain}×`} />
      </div>

      <div className="flex flex-col gap-3 w-48">
        <GameBtn onClick={onRetry} primary>PLAY AGAIN</GameBtn>
        <GameBtn onClick={onTitle}>TITLE</GameBtn>
      </div>
    </div>
  );
}

function ResultRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-white/40 font-mono tracking-wider">{label}</span>
      <span className={`font-bold font-mono tabular-nums ${highlight ? 'text-yellow-300' : 'text-white'}`}>{value}</span>
    </div>
  );
}

function GameBtn({ children, onClick, primary = false }: { children: React.ReactNode; onClick: () => void; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="w-full py-3 rounded-xl font-bold text-white transition-all active:scale-95"
      style={primary
        ? { background: 'linear-gradient(135deg,#7c3aed,#2563eb)', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }
        : { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
    >
      {children}
    </button>
  );
}
