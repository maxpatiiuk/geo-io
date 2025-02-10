import React from 'react';

import type { MenuState } from '../State/types';
import { GameOverOverlay } from './GameOverOverlay';
import { type Mode } from './Components';
import { MapRenderer } from '../MapRenderer';
import { PauseOverlay } from './PauseOverlay';
import { GET, SET } from '../../lib/utils';
import { GameOverlay } from './GameOverlay';
import type { GetSet } from '../../lib/types';

export function Game({ mode }: { mode: GetSet<Mode> }): React.ReactNode {
  const [handleScoreUp, setHandleScoreUp] =
    React.useState<(increment: number) => void>();
  const state = React.useState<MenuState>('main');
  const previousStateRef = React.useRef<MenuState>(state[GET]);
  const [gameCount, setGameCount] = React.useState(0);
  React.useEffect(() => {
    if (state[GET] === 'main' && previousStateRef.current === 'gameOver') {
      setGameCount((count) => count + 1);
    }
    previousStateRef.current = state[GET];
  }, [state[GET]]);

  return (
    <>
      <MapRenderer
        state={state}
        onScoreUp={handleScoreUp}
        key={gameCount}
        mode={mode[GET]}
      />
      <Overlays state={state} setHandleScoreUp={setHandleScoreUp} mode={mode} />
    </>
  );
}

function Overlays({
  state,
  mode,
  setHandleScoreUp,
}: {
  state: GetSet<MenuState>;
  mode: GetSet<Mode>;
  setHandleScoreUp: (
    callback: ((increment: number) => void) | undefined,
  ) => void;
}): React.ReactNode {
  // Trying to avoid Root and MapRenderer re-render on score change so keeping state here
  const [score, setScore] = React.useState(0);
  const handleScoreUpCallback = React.useCallback(
    (increment: number) => setScore((score) => score + increment),
    [],
  );
  React.useEffect(() => {
    setHandleScoreUp(() => handleScoreUpCallback);
  }, []);

  const previousStateRef = React.useRef<MenuState>(state[GET]);
  React.useEffect(() => {
    if (state[GET] === 'main' && previousStateRef.current === 'gameOver') {
      setScore(0);
    }
    previousStateRef.current = state[GET];
  }, [state[GET]]);
  return state[GET] === 'paused' ? (
    <PauseOverlay
      onResume={(): void => state[SET]('main')}
      onSetMode={mode[SET]}
    />
  ) : state[GET] === 'gameOver' ? (
    <GameOverOverlay score={score} mode={mode} />
  ) : (
    <GameOverlay
      score={score}
      onPause={(): void => state[SET]('paused')}
      mode={mode[GET]}
    />
  );
}
