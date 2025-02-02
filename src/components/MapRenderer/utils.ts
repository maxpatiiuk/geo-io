import Color from '@arcgis/core/Color.js';
import Graphic from '@arcgis/core/Graphic.js';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer.js';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol.js';
import Point from '@arcgis/core/geometry/Point.js';
import Field from '@arcgis/core/layers/support/Field.js';
import ClassBreaksRenderer from '@arcgis/core/renderers/ClassBreaksRenderer.js';

const pointCount = 100_000;

export const buildColor = (
  hue: number,
  saturation = 100,
  luminosity = 50,
): Color =>
  Color.fromRgb(
    ['hsl(', hue, ', ', saturation, '%, ', luminosity, '%)'].join(''),
  )!;

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

export const getRandomPoint = (): Point =>
  new Point({
    latitude: Math.random() * 360 - 180,
    longitude: Math.random() * 180 - 90,
  });

export function makeConsumablesLayer(): FeatureLayer {
  const layer = new FeatureLayer({
    source: Array.from(
      { length: pointCount },
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
  // layer.applyEdits({updateFeatures:[]});
  // https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-FeatureLayer.html#orderBy
  return layer;
}
