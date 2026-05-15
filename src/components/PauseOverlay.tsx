interface Props {
  onResume: () => void;
  onTitle: () => void;
}

export function PauseOverlay({ onResume, onTitle }: Props) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-30 rounded-2xl"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
      <p className="text-4xl font-black text-white tracking-widest">PAUSED</p>
      <div className="flex flex-col gap-3 w-48">
        <OverlayBtn onClick={onResume} primary>RESUME</OverlayBtn>
        <OverlayBtn onClick={onTitle}>TITLE</OverlayBtn>
      </div>
    </div>
  );
}

function OverlayBtn({ children, onClick, primary = false }: { children: React.ReactNode; onClick: () => void; primary?: boolean }) {
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
