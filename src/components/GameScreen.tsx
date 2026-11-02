'use client';

import { useReducer, useEffect, useRef, useState } from 'react';
import { readMini, postToHub, scoreToPoints, MINI_DROP_INTERVAL, type MiniConfig } from '@/lib/mini';
import { disableStorageWrites } from '@/lib/storage';
import { gameReducer, createTitleState } from '@/lib/reducer';
import { calcGhostPosition } from '@/lib/puyoGame';
import { playMove, playRotate, playHardDrop, playLand, playErase, playGameOver, startBgm, stopBgm, setMuted } from '@/lib/sound';
import { incrementPlayCount } from '@/lib/playCounts';
import { GameBoard } from './GameBoard';
import { NextPiece } from './NextPiece';
import { ScorePanel } from './ScorePanel';
import { ChainPopup } from './ChainPopup';
import { TitleScreen } from './TitleScreen';
import { PauseOverlay } from './PauseOverlay';
import { GameOverScreen } from './GameOverScreen';
import { TouchControls } from './TouchControls';

const INACTIVE_PHASES = new Set(['title', 'paused', 'gameover']);

export function GameScreen() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createTitleState);

  // ---- ミニ版(?mini=1。mini-medley から iframe で呼ばれる。仕様は mini-medley/CLAUDE.md) ----
  const [mini, setMini] = useState<MiniConfig | null>(null);
  const [miniDone, setMiniDone] = useState(false);
  const [remain, setRemain] = useState<number | null>(null);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });
  const miniDoneRef = useRef(false);
  const finishMini = (why: string) => {
    if (miniDoneRef.current) return;
    miniDoneRef.current = true;
    setMiniDone(true);
    const s = stateRef.current;
    postToHub({
      type: 'mini-result',
      score: scoreToPoints(s.totalErased, s.totalLocked, s.totalChains),
      detail: { score: s.score, erased: s.totalErased, locked: s.totalLocked, chains: s.totalChains, why },
    });
  };
  useEffect(() => {
    const cfg = readMini();
    if (!cfg) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMini(cfg);
    setMuted(cfg.mute);
    disableStorageWrites();
    let timer: number | undefined;
    let tick: number | undefined;
    const go = () => {
      if (stateRef.current.phase !== 'title') return;
      dispatch({ type: 'START_GAME', dropInterval: MINI_DROP_INTERVAL });
      const endAt = Date.now() + cfg.sec * 1000;
      setRemain(cfg.sec);
      tick = window.setInterval(() => {
        setRemain(Math.max(0, Math.ceil((endAt - Date.now()) / 1000)));
      }, 250);
      timer = window.setTimeout(() => finishMini('time'), cfg.sec * 1000);
    };
    const onMsg = (e: MessageEvent) => {
      if (e.source !== window.parent || e.data?.type !== 'mini-go') return;
      go();
    };
    window.addEventListener('message', onMsg);
    postToHub({ type: 'mini-ready' });
    // 単独で開いたとき(親が無い)は自動で始める
    const solo = window.parent === window ? window.setTimeout(go, 300) : undefined;
    (window as unknown as { __puyo?: unknown }).__puyo = { state: () => stateRef.current, done: () => miniDoneRef.current };
    return () => {
      window.removeEventListener('message', onMsg);
      if (timer) window.clearTimeout(timer);
      if (tick) window.clearInterval(tick);
      if (solo) window.clearTimeout(solo);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (mini && state.phase === 'gameover') finishMini('gameover');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mini, state.phase]);

  const ghostPiece =
    state.currentPiece && state.phase === 'falling'
      ? calcGhostPosition(state.board, state.currentPiece)
      : null;

  // Single entry point for "start a fresh game" — used by the title screen's
  // start button and the game-over retry button, so the play count fires
  // exactly once per fresh game start either way.
  const startGame = () => {
    incrementPlayCount();
    dispatch({ type: 'START_GAME' });
  };

  // Sound effects: detect phase transitions
  const prevPhaseRef = useRef(state.phase);
  const prevChainRef = useRef(state.chainCount);
  useEffect(() => {
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = state.phase;
    const prevChain = prevChainRef.current;
    prevChainRef.current = state.chainCount;

    if (prev === 'falling' && state.phase === 'locking') playLand();
    if (state.phase === 'erasing' && prev === 'checking') playErase(state.chainCount);
    if (state.phase === 'gameover' && prev !== 'gameover') playGameOver();
    void prevChain;
  }, [state.phase, state.chainCount]);

  // BGM: タイトル/ポーズ/ゲームオーバー以外のプレイ中だけ流す。
  // state.phase 自体(falling/locking/checking/...)は頻繁に変わるので、
  // active/非active の切り替わりだけを見て start/stop する
  // (毎フェーズ遷移で再スタートすると曲が刻まれてしまうため)
  const bgmActive = !INACTIVE_PHASES.has(state.phase) && !miniDone;
  useEffect(() => {
    if (!bgmActive) return;
    startBgm();
    return () => stopBgm();
  }, [bgmActive]);

  // Game tick loop
  useEffect(() => {
    if (INACTIVE_PHASES.has(state.phase) || miniDone) return;
    const interval = state.phase === 'falling' ? state.dropInterval : 50;
    const id = setInterval(() => dispatch({ type: 'TICK' }), interval);
    return () => clearInterval(id);
  }, [state.phase, state.dropInterval, miniDone]);

  // Keyboard input
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault(); playMove(); dispatch({ type: 'MOVE_LEFT' }); break;
        case 'ArrowRight':
          e.preventDefault(); playMove(); dispatch({ type: 'MOVE_RIGHT' }); break;
        case 'ArrowDown':
          e.preventDefault(); dispatch({ type: 'SOFT_DROP' }); break;
        case 'ArrowUp':
        case ' ':
          e.preventDefault(); playHardDrop(); dispatch({ type: 'HARD_DROP' }); break;
        case 'z':
        case 'Z':
          playRotate(); dispatch({ type: 'ROTATE_LEFT' }); break;
        case 'x':
        case 'X':
          playRotate(); dispatch({ type: 'ROTATE_RIGHT' }); break;
        case 'p':
        case 'P':
          if (readMini()) break; // ミニ版は時計が実時間なのでポーズ無し
          dispatch({ type: 'TOGGLE_PAUSE' }); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (mini && (state.phase === 'title' || miniDone)) {
    // 待機中・終了後は静かな暗転だけ(タイトルや結果は出さない)
    return (
      <div
        className="min-h-screen flex items-center justify-center text-white/60 text-sm"
        style={{ background: 'radial-gradient(ellipse at top, #1a0533 0%, #050510 60%)' }}
      >
        {miniDone ? 'おしまい' : ''}
      </div>
    );
  }

  if (state.phase === 'title') {
    return (
      <TitleScreen
        highScore={state.highScore}
        onStart={startGame}
      />
    );
  }

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at top, #1a0533 0%, #050510 60%)' }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-10"
            style={{
              width: `${100 + i * 60}px`,
              height: `${100 + i * 60}px`,
              background: ['#ef4444','#22c55e','#3b82f6','#eab308','#a855f7','#ec4899'][i],
              top: `${10 + i * 15}%`,
              left: `${5 + (i % 3) * 35}%`,
              filter: 'blur(40px)',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-3 w-full max-w-sm">
        {mini && remain !== null && (
          <div
            className="px-4 py-1 rounded-full text-white font-bold tabular-nums"
            style={{
              background: remain <= 10 ? 'rgba(239,68,68,0.85)' : 'rgba(255,255,255,0.15)',
              fontSize: '18px',
            }}
          >
            のこり {remain} 秒
          </div>
        )}
        <ScorePanel
          score={state.score}
          highScore={state.highScore}
          level={state.level}
          chainCount={state.chainCount}
        />

        <div className="flex gap-3 items-start">
          {/* Side panel */}
          <div className="flex flex-col gap-3 pt-1">
            <NextPiece label="NEXT" piece={state.nextPiece} />
            <NextPiece label="2ND" piece={state.nextNextPiece} />
          </div>

          {/* Game board */}
          <div className="relative">
            <GameBoard
              board={state.board}
              currentPiece={state.currentPiece}
              ghostPiece={ghostPiece}
            />

            {state.showChainPopup && state.chainCount >= 1 && (
              <ChainPopup
                key={state.chainCount}
                chainCount={state.chainCount}
                onAnimationEnd={() => dispatch({ type: 'HIDE_CHAIN_POPUP' })}
              />
            )}

            {state.phase === 'paused' && (
              <PauseOverlay
                onResume={() => dispatch({ type: 'TOGGLE_PAUSE' })}
                onTitle={() => dispatch({ type: 'RETURN_TO_TITLE' })}
              />
            )}

            {state.phase === 'gameover' && (
              <GameOverScreen
                score={state.score}
                highScore={state.highScore}
                maxChain={state.totalChains}
                onRetry={startGame}
                onTitle={() => dispatch({ type: 'RETURN_TO_TITLE' })}
              />
            )}
          </div>
        </div>

        <TouchControls
          onMoveLeft={() => { playMove(); dispatch({ type: 'MOVE_LEFT' }); }}
          onMoveRight={() => { playMove(); dispatch({ type: 'MOVE_RIGHT' }); }}
          onSoftDrop={() => dispatch({ type: 'SOFT_DROP' })}
          onHardDrop={() => { playHardDrop(); dispatch({ type: 'HARD_DROP' }); }}
          onRotateLeft={() => { playRotate(); dispatch({ type: 'ROTATE_LEFT' }); }}
          onRotateRight={() => { playRotate(); dispatch({ type: 'ROTATE_RIGHT' }); }}
        />
      </div>
    </div>
  );
}
