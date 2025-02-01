import './styles.css';

import React from 'react';

import { GameOverlay } from '../UserInterface/GameOverlay';
import { expose } from '../../lib/utils';

export function MapRenderer({
  isPaused,
  score,
}: {
  isPaused: boolean;
  score: number;
}): React.ReactNode {
  const [map, setMap] = React.useState<HTMLElement | null>(null);
  // Remove all widgets
  // view.ui.remove(view.ui.getComponents());
  return (
    <>
      <arcgis-map
        itemId="8d91bd39e873417ea21673e0fee87604"
        className="block h-full"
        onarcgisViewReadyChange={({ target }): void => {
          expose?.({ map: target });
          setMap(target);
        }}
      />
      <div className="absolute top-0 right-0 drop-shadow-[0_1px_2px_#000]">
        <GameOverlay score={score} />
      </div>
    </>
  );
}
