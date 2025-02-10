import React from 'react';
import { useHighScore } from '../../hooks/useCache';
import { localization } from '../../localization';
import type { Mode } from './Components';

export function GameOverlay({
  score,
  mode,
  onPause: handlePause,
}: {
  score: number;
  mode: Mode;
  onPause: () => void;
}): React.ReactNode {
  const [bestScore, setBestScore] = useHighScore(mode);
  const previousBestScore = React.useRef(bestScore).current;

  const newBestScore = Math.max(score, previousBestScore);
  React.useEffect(() => setBestScore(newBestScore), [newBestScore]);
  return (
    <button
      type="button"
      className="fixed bottom-0 left-0 m-2 rounded bg-black/40 p-2 text-4xl drop-shadow-[0_1px_2px_#000]"
      onClick={handlePause}
    >
      {localization.score}
      <span className={score >= bestScore ? 'text-red-500' : undefined}>
        {score}
      </span>
    </button>
  );
}
