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
    // During testing, this factor is sometimes set to 0.25 or etc
    ((activeAreaFactor as number) < 2 ||
      !isInsideMercatorViewExtent(x, y, view))
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

/**
 * If point is outside the active area, get the angle in which the point should
 * move to get back to the active area.
 */
export function getActiveAreaHeading(
  view: MapView,
  point: Point,
): number | undefined {
  const center = view.center;
  const dx = center.x - point.x;
  const dy = center.y - point.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const screenSize = (view.extent.width + view.extent.height) / 2;
  const activeAreaSize = screenSize * activeAreaFactor;
  const isOutsideActiveArea = distance > activeAreaSize;
  if (!isOutsideActiveArea) {
    return undefined;
  }

  const radiansAngle = Math.atan2(dy, dx);
  const angle = (radiansAngle * 180) / Math.PI;

  return angle;
}
