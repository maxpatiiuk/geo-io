import React from 'react';

import type { MenuState } from '../State/types';
import { GameOverOverlay } from './GameOverOverlay';
import { MapRenderer } from '../MapRenderer';
import { pauseOverlay } from './PauseOverlay';
import { GET, SET } from '../../lib/utils';

const defaultState: MenuState = { type: 'main', score: 0 };
export function Root(): React.ReactNode {
  const state = React.useState<MenuState>(defaultState);
  return (
    <>
      <div className="flex h-screen w-screen items-center justify-center bg-black text-white">
        <MapRenderer state={state} />
        {state[GET].type === 'paused' && pauseOverlay}
      </div>
      {state[GET].type === 'gameOver' && (
        <GameOverOverlay
          score={state[GET].score}
          onRestart={(): void => state[SET](defaultState)}
        />
      )}
    </>
  );
}
