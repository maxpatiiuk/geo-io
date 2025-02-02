import Graphic from '@arcgis/core/Graphic.js';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer.js';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol.js';
import type MapView from '@arcgis/core/views/MapView';
import { buildColor } from './utils';

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

function makePlayerSymbol(): SimpleMarkerSymbol {
  const hue = Math.random() * 360;
  return new SimpleMarkerSymbol({
    color: buildColor(hue),
    size: 30,
    outline: {
      color: buildColor(hue, 80, 40),
      width: 2,
    },
  });
}
