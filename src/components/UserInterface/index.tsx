import React from 'react';

import type { MenuState } from '../State/types';
import { GameOverOverlay } from './GameOverOverlay';
import { MapRenderer } from '../MapRenderer';
import { pauseOverlay } from './PauseOverlay';
import { GET, SET } from '../../lib/utils';
import { GameOverlay } from './GameOverlay';

const defaultState: MenuState = { type: 'main', score: 0 };
export function Root(): React.ReactNode {
  const state = React.useState<MenuState>(defaultState);
  return (
    <>
      <MapRenderer state={state} />
      <GameOverlay
        score={state[GET].score}
        onPause={(): void =>
          state[SET]({ type: 'paused', score: state[GET].score })
        }
      />
      {state[GET].type === 'paused' && pauseOverlay}
      {state[GET].type === 'gameOver' && (
        <GameOverOverlay
          score={state[GET].score}
          onRestart={(): void => state[SET](defaultState)}
        />
      )}
    </>
  );
}
