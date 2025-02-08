import Graphic from '@arcgis/core/Graphic.js';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer.js';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol.js';
import Field from '@arcgis/core/layers/support/Field.js';
import ClassBreaksRenderer from '@arcgis/core/renderers/ClassBreaksRenderer.js';
import { buildColor, getRandomPoint } from './utils';
import { consumablesCount } from './config';

export function makeConsumablesLayer(): FeatureLayer {
  const layer = new FeatureLayer({
    source: Array.from(
      { length: consumablesCount },
      () =>
        new Graphic({
          geometry: getRandomPoint(),
          attributes: {
            COLOR: Math.floor(Math.random() * colors.length),
          },
        }),
    ),
    fields: [
      new Field({
        name: 'COLOR',
        type: 'integer',
      }),
    ],
    objectIdField: 'OBJECTID',
    geometryType: 'point',
    legendEnabled: false,
    popupEnabled: false,
    renderer,
  });
  return layer;
}

const colors = [
  // Red
  buildColor(0),
  // Yellow
  buildColor(60),
  // Green
  buildColor(120),
  // Blue
  buildColor(219),
  // Purple
  buildColor(270),
];
const markerSymbols = colors.map(
  (color) =>
    new SimpleMarkerSymbol({
      color,
      outline: undefined,
    }),
);

const renderer = new ClassBreaksRenderer({
  field: 'COLOR',
});
markerSymbols.forEach((symbol, index) => {
  renderer.addClassBreakInfo(index, index, symbol);
});
