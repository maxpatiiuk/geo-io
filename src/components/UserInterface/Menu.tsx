import React from 'react';
import { localization } from '../../localization';
import { type Mode } from './Components';
import { MenuLayout } from './Components';
import { Game } from './Game';

export function Menu(): React.ReactNode {
  const [mode, setMode] = React.useState<Mode>('none');
  const [gameCount, setGameCount] = React.useState(0);
  const handleSetMode = React.useCallback((mode: Mode) => {
    setMode(mode);
    setGameCount((count) => count + 1);
  }, []);

  return mode === 'none' ? (
    <MenuLayout title={localization.title} onSetMode={handleSetMode} />
  ) : (
    <Game mode={[mode, handleSetMode]} key={gameCount} />
  );
}
