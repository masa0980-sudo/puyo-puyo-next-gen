'use client';

import { useReducer, useEffect, useRef } from 'react';
import { gameReducer, createTitleState } from '@/lib/reducer';
import { calcGhostPosition } from '@/lib/puyoGame';
import { playMove, playRotate, playHardDrop, playLand, playErase, playGameOver } from '@/lib/sound';
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

  const ghostPiece =
    state.currentPiece && state.phase === 'falling'
      ? calcGhostPosition(state.board, state.currentPiece)
      : null;

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

  // Game tick loop
  useEffect(() => {
    if (INACTIVE_PHASES.has(state.phase)) return;
    const interval = state.phase === 'falling' ? state.dropInterval : 50;
    const id = setInterval(() => dispatch({ type: 'TICK' }), interval);
    return () => clearInterval(id);
  }, [state.phase, state.dropInterval]);

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
          dispatch({ type: 'TOGGLE_PAUSE' }); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (state.phase === 'title') {
    return (
      <TitleScreen
        highScore={state.highScore}
        onStart={() => dispatch({ type: 'START_GAME' })}
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
                onRetry={() => dispatch({ type: 'START_GAME' })}
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
