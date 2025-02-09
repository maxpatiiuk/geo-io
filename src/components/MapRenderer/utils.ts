import Color from '@arcgis/core/Color.js';
import Point from '@arcgis/core/geometry/Point.js';
import Polygon from '@arcgis/core/geometry/Polygon.js';
import { execute } from '@arcgis/core/geometry/operators/containsOperator.js';
import * as projectOperator from '@arcgis/core/geometry/operators/projectOperator.js';
import Extent from '@arcgis/core/geometry/Extent.js';
import {
  landPolygon,
  maxLatitude,
  maxLongitude,
  minLatitude,
  minLongitude,
} from './config';
import SpatialReference from '@arcgis/core/geometry/SpatialReference.js';
import type MapView from '@arcgis/core/views/MapView';

export const defaultSaturation = 100;
export const defaultLuminosity = 50;
export const darkenFactor = 0.8;
export const maxHue = 360;
export const buildColor = (
  hue: number,
  saturation = defaultSaturation,
  luminosity = defaultLuminosity,
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
let viewConstraintExtentMercator: Extent;
export const viewConstraintPolygon = Polygon.fromExtent(viewConstraintExtent);

export const projectOperatorPromise = projectOperator.load().then(() => {
  viewConstraintExtentMercator = projectOperator.execute(
    viewConstraintExtent,
    SpatialReference.WebMercator,
  ) as Extent;
});

export const isInsideMercatorConstraint = (
  longitude: number,
  latitude: number,
): boolean =>
  longitude >= viewConstraintExtentMercator.xmin &&
  longitude <= viewConstraintExtentMercator.xmax &&
  latitude >= viewConstraintExtentMercator.ymin &&
  latitude <= viewConstraintExtentMercator.ymax;

export const isInsideMercatorViewExtent = (
  longitude: number,
  latitude: number,
  view: MapView,
): boolean =>
  longitude >= view.extent.xmin &&
  longitude <= view.extent.xmax &&
  latitude >= view.extent.ymin &&
  latitude <= view.extent.ymax;

export const getRandomPoint = (): Point =>
  new Point({
    spatialReference: SpatialReference.WGS84,
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
