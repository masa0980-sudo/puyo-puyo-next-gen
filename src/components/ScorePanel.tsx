interface Props {
  score: number;
  highScore: number;
  level: number;
  chainCount: number;
}

export function ScorePanel({ score, highScore, level, chainCount }: Props) {
  return (
    <div
      className="w-full flex items-center justify-between px-4 py-2 rounded-xl mb-3"
      style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      <Stat label="SCORE" value={score.toLocaleString()} />
      <Stat label="BEST" value={highScore.toLocaleString()} />
      <Stat label="LEVEL" value={String(level)} />
      <Stat label="CHAIN" value={chainCount > 0 ? `${chainCount}×` : '-'} highlight={chainCount >= 2} />
    </div>
  );
}

function Stat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-white/40 font-mono tracking-widest">{label}</span>
      <span className={`text-lg font-bold font-mono tabular-nums ${highlight ? 'text-yellow-300' : 'text-white'}`}>
        {value}
      </span>
    </div>
  );
}
