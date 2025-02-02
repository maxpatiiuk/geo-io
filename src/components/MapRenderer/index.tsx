import './styles.css';
import '@arcgis/map-components/components/arcgis-map';

import React from 'react';

import { expose, isDebug } from '../../lib/utils';
import type { MenuState } from '../State/types';
import type { GetSet } from '../../lib/types';
import Graphic from '@arcgis/core/Graphic.js';
import { execute } from '@arcgis/core/geometry/operators/containsOperator.js';
import type MapView from '@arcgis/core/views/MapView';
import { useGameLogic } from '../State';
import { watch } from '@arcgis/core/core/reactiveUtils.js';
import { makeConsumablesLayer } from './utils';
import { createCharacter } from './character';

const scale = 2_311_162;

/**
 * Much of the planet turns out to be water - exclude it from spawn zones so
 * that the background is more interesting.
 */
const excludedSpawnZones: [
  fromLongitude: number,
  fromLatitude: number,
  toLongitude: number,
  toLatitude: number,
][] = [
  // North pole
  [-180, 90, 180, 69],
  // South pole
  [-180, -48, 180, 90],
  // Pacific ocean
  [145, 56, 180, 90],
  [-180, -90, -122, 0],
];

const minLatitude = -60;
const maxLatitude = 60;
const minLongitude = -150;
const maxLongitude = 150;

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
    () => [
      Math.random() * (maxLongitude * 2) + minLongitude,
      Math.random() * (maxLatitude * 2) + minLatitude,
    ],
    [],
  );
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

          // TODO: re-spawn if spawned in excluded zone
          /*
          excludedSpawnZones.forEach(
            ([fromLongitude, fromLatitude, toLongitude, toLatitude]) => {
              view.graphics.add(
                new Graphic({
                  geometry: {
                    type: 'polygon',
                    spatialReference: {
                      latestWkid: 3857,
                      wkid: 102100,
                    },
                    rings: [
                      [
                        [16210937.012204327, 8086015.336367818],
                        [24360926.403455194, 7222735.538915258],
                        [27164864.373772122, 2781553.102976959],
                        [30987555.057073615, 368856.5236701481],
                        [30785454.016020194, -1474460.6319405325],
                        [31921001.739090744, -2447637.7668100707],
                        [30310625.658045337, -8925198.182550285],
                        [15743908.060468126, -9858991.138595894],
                        [16978558.698111586, -2307050.962536581],
                        [15027659.501724478, 251678.5593090281],
                        [16210937.012204327, 8086015.336367818],
                      ],
                    ],
                  },
                  symbol: {
                    type: 'simple-fill', // autocasts as new SimpleFillSymbol()
                    color: [227, 139, 79, 0.8],
                    outline: {
                      // autocasts as new SimpleLineSymbol()
                      color: [255, 255, 255],
                      width: 1,
                    },
                  },
                }),
              );
            },
          );

          console.log(() =>
            execute(view.graphics.at(0)!.geometry!, view.center),
          );
          */
        }}
      />
    </div>
  );
}
