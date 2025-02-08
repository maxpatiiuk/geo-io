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

export const initialSize = 30;
export const maxInitialSize = 400;
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
