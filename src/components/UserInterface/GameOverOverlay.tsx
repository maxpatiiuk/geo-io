import React from 'react';

import { useHighScore } from '../../hooks/useCache';
import { localization } from '../../localization';
import { MenuLayout, type Mode } from './Components';
import type { GetSet } from '../../lib/types';
import { GET, SET } from '../../lib/utils';

export function GameOverOverlay({
  score,
  mode,
}: {
  score: number;
  mode: GetSet<Mode>;
}): React.ReactNode {
  const [bestScore] = useHighScore(mode[GET]);

  return (
    <MenuLayout title={localization.gameOver} onSetMode={mode[SET]}>
      <h2>
        {localization.score} {score}
      </h2>
      <h2>
        {localization.highScore} {bestScore}
      </h2>
    </MenuLayout>
  );
}
