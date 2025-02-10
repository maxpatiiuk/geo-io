import Graphic from '@arcgis/core/Graphic.js';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer.js';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol.js';
import type MapView from '@arcgis/core/views/MapView';
import {
  buildColor,
  darkenFactor,
  defaultLuminosity,
  defaultSaturation,
  maxHue,
} from './utils';
import { initialSize } from './config';

const outlineSize = 4;

export function createCharacter(view: MapView): GraphicsLayer {
  const graphic = new Graphic({
    symbol: makePlayerSymbol(),
    geometry: view.center.clone(),
  });

  const layer = new GraphicsLayer({
    graphics: [graphic],
  });
  return layer;
}

export function makePlayerSymbol(size = initialSize): SimpleMarkerSymbol {
  const hue = Math.random() * maxHue;
  return new SimpleMarkerSymbol({
    color: buildColor(hue),
    size,
    outline: {
      color: buildColor(
        hue,
        defaultSaturation * darkenFactor,
        defaultLuminosity * darkenFactor,
      ),
      width: outlineSize,
    },
  });
}

/*
 * Symbol size is in px, but query distance is in meters - doing a
 * rough conversion here.
 * TEST: does this depend on screen size or zoom?
 */
export const pxToDistance = (pxSize: number): number => 8_600 + pxSize * 254;

/**
 * Increase area at a constant rate per particle - which means radios
 * will increase at an ever decreasing rate.
 */
export function increaseRadius(
  oldRadius: number,
  increase: number,
  growthFactor: number,
): number {
  const oldArea = Math.PI * (oldRadius * oldRadius);
  const newArea = oldArea + increase * growthFactor;
  return Math.sqrt(newArea / Math.PI);
}
