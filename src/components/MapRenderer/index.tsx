import './styles.css';
import '@arcgis/map-components/components/arcgis-map';

import React from 'react';

import { GameOverlay } from '../UserInterface/GameOverlay';
import { expose, GET } from '../../lib/utils';
import type { MenuState } from '../State/types';
import type { GetSet } from '../../lib/types';
import type MapView from '@arcgis/core/views/MapView';
import { useGameLogic } from '../State';

export function MapRenderer({
  state,
}: {
  state: GetSet<MenuState>;
}): React.ReactNode {
  const [view, setView] = React.useState<MapView | undefined>(undefined);
  useGameLogic(state, view);
  return (
    <>
      <arcgis-map
        itemId="8d91bd39e873417ea21673e0fee87604"
        className="h-full w-full"
        onarcgisViewReadyChange={({ target }): void => {
          expose?.({ map: target });
          // Remove all components
          target.view.ui.remove(target.view.ui.getComponents());
          setView(target.view);
        }}
      />
      <GameOverlay score={state[GET].score} />
    </>
  );
}
