import './styles.css';
import '@arcgis/map-components/components/arcgis-map';

import React from 'react';

import { expose, isDebug } from '../../lib/utils';
import type { MenuState } from '../State/types';
import type { GetSet } from '../../lib/types';
import type MapView from '@arcgis/core/views/MapView';
import { useGameLogic } from '../State';
import { getRandomStartPoint, viewConstraintExtent } from './utils';
import { createCharacter } from './character';
import { scale } from './config';
import { makeConsumablesLayer } from './consumables';

export function MapRenderer({
  state,
}: {
  state: GetSet<MenuState>;
}): React.ReactNode {
  const [view, setView] = React.useState<MapView | undefined>(undefined);
  const [interactionContainer, setInteractionContainer] =
    React.useState<HTMLDivElement | null>(null);
  useGameLogic(state, view, interactionContainer);

  const randomCenter = React.useMemo(() => {
    const center = getRandomStartPoint();
    return [center.longitude!, center.latitude!];
  }, []);
  return (
    <div tabIndex={0} ref={setInteractionContainer}>
      <div className="fixed top-[50vh] left-[50vw] z-10 h-1 w-1 bg-red-500"></div>
      <arcgis-map
        itemId="8d91bd39e873417ea21673e0fee87604"
        className="pointer-events-none block h-screen"
        scale={scale}
        center={randomCenter}
        onarcgisViewReadyChange={({ target }): void => {
          expose?.({ map: target });
          const view = target.view;
          const navigation = view.navigation;
          // Remove all components
          view.ui.remove(view.ui.getComponents());
          view.constraints.geometry = viewConstraintExtent;
          if (import.meta.env.MODE === 'production' || !isDebug()) {
            view.constraints.rotationEnabled = false;
            view.constraints.minScale = scale;
            view.constraints.maxScale = scale;
            navigation.momentumEnabled = false;
            navigation.actionMap.dragPrimary = 'none';
            navigation.actionMap.dragSecondary = 'none';
            navigation.actionMap.dragTertiary = 'none';
            navigation.actionMap.mouseWheel = 'none';
            navigation.browserTouchPanEnabled = false;
          }
          setView(view);

          const featureLayer = makeConsumablesLayer();
          const characterLayer = createCharacter(view);
          view.map.addMany([characterLayer, featureLayer]);
        }}
      />
    </div>
  );
}
