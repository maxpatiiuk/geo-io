import React from 'react';

export const localization = {
  title: 'geo-io',
  paused: 'Game is paused',
  esc: 'ESC',
  score: 'Score: ',
  highScore: 'High Score: ',
  gameOver: 'Game Over',
  playAgain: 'Play Again',
  sourceCode: 'Source Code',
  pressKeyToResume: (key: React.ReactNode): React.ReactNode => (
    <>Press {key} to resume</>
  ),
};
