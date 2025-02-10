import React from 'react';

import { localization } from '../../localization';
import { buttonClassName, MenuLayout } from './Components';
import type { Mode } from './Components';

export function PauseOverlay({
  onSetMode: handleSetMode,
  onResume: handleResume,
}: {
  onSetMode: (mode: Mode) => void;
  onResume: () => void;
}): React.ReactNode {
  return (
    <MenuLayout title={localization.paused} onSetMode={handleSetMode}>
      <button className={buttonClassName} type="button" onClick={handleResume}>
        {localization.resume}
      </button>
    </MenuLayout>
  );
}
