import Graphic from '@arcgis/core/Graphic.js';
import type MapView from '@arcgis/core/views/MapView';
import { initialSize, makePlayerSymbol, maxInitialSize } from './character';
import { activeAreaFactor, npcCount } from './config';
import Point from '@arcgis/core/geometry/Point.js';
import {
  isInsideMercatorConstraint,
  isInsideMercatorViewExtent,
} from './utils';

export function createNpcs(view: MapView): Graphic[] {
  return Array.from({ length: npcCount }, () => {
    const size = Math.random() * (maxInitialSize - initialSize) + initialSize;
    return new Graphic({
      symbol: makePlayerSymbol(size),
      geometry: getNpcSpawnPoint(view),
    });
  });
}

function getNpcSpawnPoint(view: MapView): Point {
  // debugger;
  const activeAreaWidth = view.extent.width * activeAreaFactor;
  const activeAreaHeight = view.extent.height * activeAreaFactor;

  const x =
    view.center.x + Math.random() * activeAreaWidth - activeAreaWidth / 2;
  const y =
    view.center.y + Math.random() * activeAreaHeight - activeAreaHeight / 2;

  // Make sure NPM is close but not too close
  if (
    isInsideMercatorConstraint(x, y) &&
    !isInsideMercatorViewExtent(x, y, view)
  ) {
    return new Point({
      spatialReference: view.spatialReference,
      x,
      y,
    });
  } else {
    return getNpcSpawnPoint(view);
  }
}
