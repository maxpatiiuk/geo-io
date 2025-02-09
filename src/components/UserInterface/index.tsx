import React from 'react';

import type { MenuState } from '../State/types';
import { GameOverOverlay } from './GameOverOverlay';
import { MapRenderer } from '../MapRenderer';
import { pauseOverlay } from './PauseOverlay';
import { GET, SET } from '../../lib/utils';
import { GameOverlay } from './GameOverlay';
import type { GetSet } from '../../lib/types';

export function Root(): React.ReactNode {
  const [handleScoreUp, setHandleScoreUp] =
    React.useState<(increment: number) => void>();
  const state = React.useState<MenuState>('main');
  return (
    <>
      <MapRenderer state={state} onScoreUp={handleScoreUp} />
      <AsideContent state={state} setHandleScoreUp={setHandleScoreUp} />
    </>
  );
}

function AsideContent({
  state,
  setHandleScoreUp,
}: {
  state: GetSet<MenuState>;
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
  return (
    <>
      <GameOverlay score={score} onPause={(): void => state[SET]('paused')} />
      {state[GET] === 'paused' && pauseOverlay}
      {state[GET] === 'gameOver' && (
        <GameOverOverlay
          score={score}
          onRestart={(): void => state[SET]('main')}
        />
      )}
    </>
  );
}
