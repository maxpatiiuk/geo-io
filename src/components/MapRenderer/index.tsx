import './styles.css';
import '@arcgis/map-components/components/arcgis-map';

import React from 'react';

import { expose, isDebug } from '../../lib/utils';
import type { MenuState } from '../State/types';
import type { GetSet } from '../../lib/types';
import type MapView from '@arcgis/core/views/MapView';
import { useGameLogic } from '../State';
import {
  getRandomStartPoint,
  projectOperatorPromise,
  viewConstraintExtent,
} from './utils';
import { createCharacter } from './character';
import { scale } from './config';
import { makeConsumablesLayer } from './consumables';
import { createNpcs } from './npc';
import type { Mode } from '../UserInterface/Components';

export function MapRenderer({
  state,
  mode,
  onScoreUp: handleScoreUp,
}: {
  state: GetSet<MenuState>;
  mode: Mode;
  onScoreUp?: (increment: number) => void;
}): React.ReactNode {
  const [view, setView] = React.useState<MapView | undefined>(undefined);
  const [interactionContainer, setInteractionContainer] =
    React.useState<HTMLDivElement | null>(null);
  useGameLogic(state, view, interactionContainer, handleScoreUp, mode);

  const [projectLoaded, setProjectLoaded] = React.useState(false);
  React.useEffect(
    () => void projectOperatorPromise.then(() => setProjectLoaded(true)),
    [],
  );

  const randomCenter = React.useMemo(() => {
    const center = getRandomStartPoint();
    return [center.longitude!, center.latitude!];
  }, []);

  if (!projectLoaded) {
    return;
  }
  return (
    <div tabIndex={0} ref={setInteractionContainer}>
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

          const consumablesLayer = makeConsumablesLayer();
          const charactersLayer = createCharacter(view);
          if (mode !== 'peaceful') {
            charactersLayer.addMany(createNpcs(view));
          }
          view.map.addMany([consumablesLayer, charactersLayer]);
        }}
      />
    </div>
  );
}
