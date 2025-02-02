import './styles.css';
import '@arcgis/map-components/components/arcgis-map';

import React from 'react';

import { expose } from '../../lib/utils';
import type { MenuState } from '../State/types';
import type { GetSet } from '../../lib/types';
import type MapView from '@arcgis/core/views/MapView';
import { useGameLogic } from '../State';

const scale = 2_311_162;

export function MapRenderer({
  state,
}: {
  state: GetSet<MenuState>;
}): React.ReactNode {
  const [view, setView] = React.useState<MapView | undefined>(undefined);
  const [interactionContainer, setInteractionContainer] =
    React.useState<HTMLDivElement | null>(null);
  useGameLogic(state, view, interactionContainer);

  const randomCenter = React.useMemo(
    () => [Math.random() * 360 - 180, Math.random() * 180 - 90],
    [],
  );
  return (
    <div tabIndex={0} ref={setInteractionContainer}>
      <arcgis-map
        itemId="8d91bd39e873417ea21673e0fee87604"
        className="pointer-events-none block h-screen"
        scale={scale}
        center={randomCenter}
        onarcgisViewReadyChange={({ target }): void => {
          expose?.({ map: target });
          // Remove all components
          target.view.ui.remove(target.view.ui.getComponents());
          target.view.constraints.rotationEnabled = false;
          target.view.constraints.minScale = scale;
          target.view.constraints.maxScale = scale;
          setView(target.view);
        }}
      />
    </div>
  );
}
