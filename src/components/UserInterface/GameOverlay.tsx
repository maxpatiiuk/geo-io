import React from 'react';
import { useHighScore } from '../../hooks/useCache';
import { localization } from '../../localization';

export function GameOverlay({ score }: { score: number }): React.ReactNode {
  const [bestScore] = useHighScore();
  return (
    <div className="fixed bottom-0 left-0 m-2 rounded bg-white/40 p-2 text-4xl drop-shadow-[0_1px_2px_#000]">
      {localization.score}
      <span className={score > bestScore ? 'text-red-500' : undefined}>
        {score}
      </span>
    </div>
  );
}
