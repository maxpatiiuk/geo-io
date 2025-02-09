import Graphic from '@arcgis/core/Graphic.js';
import type MapView from '@arcgis/core/views/MapView';
import { makePlayerSymbol } from './character';
import {
  activeAreaFactor,
  initialSize,
  npcCount,
  npcSizeMaxFactor,
  npcSizeMinFactor,
} from './config';
import Point from '@arcgis/core/geometry/Point.js';
import {
  isInsideMercatorConstraint,
  isInsideMercatorViewExtent,
} from './utils';

export function createNpcs(view: MapView): Graphic[] {
  return Array.from({ length: npcCount }, () => {
    const size = getNpcSize();
    return new Graphic({
      symbol: makePlayerSymbol(size),
      geometry: getNpcSpawnPoint(view),
    });
  });
}

export const getNpcSize = (playerSize = initialSize): number =>
  playerSize *
  (Math.random() * (npcSizeMaxFactor * npcSizeMinFactor) + npcSizeMinFactor);

export function getNpcSpawnPoint(
  view: MapView,
  area = activeAreaFactor,
): Point {
  const activeAreaWidth = view.extent.width * activeAreaFactor;
  const activeAreaHeight = view.extent.height * activeAreaFactor;

  const x =
    view.center.x + Math.random() * activeAreaWidth - activeAreaWidth / 2;
  const y =
    view.center.y + Math.random() * activeAreaHeight - activeAreaHeight / 2;

  // Make sure NPC is close but not too close
  if (
    isInsideMercatorConstraint(x, y) &&
    // During testing, this factor is sometimes set to 0.25 or etc
    (area < 2 || !isInsideMercatorViewExtent(x, y, view))
  ) {
    return new Point({
      spatialReference: view.spatialReference,
      x,
      y,
    });
  } else {
    return getNpcSpawnPoint(view, area);
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
  const angle = radToDeg(radiansAngle);

  return angle;
}

export function isInActiveArea(
  view: MapView,
  distance: number,
  factor = activeAreaFactor,
): boolean {
  const screenSize = (view.extent.width + view.extent.height) / 2;
  const activeAreaSize = screenSize * factor;
  return distance < activeAreaSize;
}

export const maxAngle = 180;
export const radToDeg = (radians: number): number =>
  (radians * maxAngle) / Math.PI;
export const degToRad = (degrees: number): number =>
  (degrees * Math.PI) / maxAngle;
