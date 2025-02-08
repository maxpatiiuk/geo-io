import Color from '@arcgis/core/Color.js';
import Point from '@arcgis/core/geometry/Point.js';
import Polygon from '@arcgis/core/geometry/Polygon.js';
import { execute } from '@arcgis/core/geometry/operators/containsOperator.js';
import Extent from '@arcgis/core/geometry/Extent.js';
import {
  landPolygon,
  maxLatitude,
  maxLongitude,
  minLatitude,
  minLongitude,
} from './config';

export const buildColor = (
  hue: number,
  saturation = 100,
  luminosity = 50,
): Color =>
  Color.fromRgb(
    ['hsl(', hue, ', ', saturation, '%, ', luminosity, '%)'].join(''),
  )!;

export const viewConstraintExtent = new Extent({
  xmin: minLongitude,
  ymin: minLatitude,
  xmax: maxLongitude,
  ymax: maxLatitude,
});
export const viewConstraintPolygon = Polygon.fromExtent(viewConstraintExtent);
export const getRandomPoint = (): Point =>
  new Point({
    longitude:
      Math.random() * (maxLongitude + Math.abs(minLongitude)) + minLongitude,
    latitude:
      Math.random() * (maxLatitude + Math.abs(minLatitude)) + minLatitude,
  });

export function getRandomStartPoint(): Point {
  const center = getRandomPoint();
  const isContained = execute(landPolygon, center);
  if (isContained) {
    return center;
  } else {
    return getRandomStartPoint();
  }
}
