import React from 'react';
import { useHighScore } from '../../hooks/useCache';
import { localization } from '../../localization';

export function GameOverlay({ score }: { score: number }): React.ReactNode {
  const [bestScore] = useHighScore();
  return (
    <div className="margin-2 padding-2 absolute bottom-0 rounded-sm bg-white/40 text-4xl">
      {localization.score}
      <span className={score > bestScore ? 'text-red-500' : undefined}>
        {score}
      </span>
    </div>
  );
}
