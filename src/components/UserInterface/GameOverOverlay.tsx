import React from 'react';

import { useHighScore } from '../../hooks/useCache';
import { localization } from '../../localization';
import { buttonClassName } from './Components';

export function GameOverOverlay({
  score,
  onRestart: handleRestart,
}: {
  readonly score: number;
  readonly onRestart: () => void;
}): React.ReactNode {
  const [bestScore, setBestScore] = useHighScore();
  const previousBestScore = React.useRef(bestScore).current;

  React.useEffect(
    () => setBestScore(Math.max(bestScore, score)),
    [score, bestScore],
  );

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-center text-3xl">
      <span className="flex flex-col gap-4">
        <h1 className="pb-4 text-6xl">{localization.gameOver}</h1>
        <h2>
          {localization.score} {score}
        </h2>
        <h2>
          {localization.highScore} {previousBestScore}
        </h2>
        <div className="flex gap-4">
          <button
            className={buttonClassName}
            type="button"
            onClick={handleRestart}
          >
            {localization.playAgain}
          </button>
        </div>
      </span>
    </div>
  );
}
