import type MapView from '@arcgis/core/views/MapView';
import type { MenuState } from './types';
import DirectionalPadViewModel from '@arcgis/core/widgets/DirectionalPad/DirectionalPadViewModel.js';
import type Graphic from '@arcgis/core/Graphic';
import { watch } from '@arcgis/core/core/reactiveUtils.js';
import type GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import type FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import type FeatureLayerView from '@arcgis/core/views/layers/FeatureLayerView';
import { isDebug, throttle } from '../../lib/utils';
import { getRandomPoint } from '../MapRenderer/utils';
import type SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';

const getScreenCenter = (): { x: number; y: number } => ({
  x: Math.round(window.innerWidth / 2),
  y: Math.round(window.innerHeight / 2),
});
let screenCenter = getScreenCenter();
window.addEventListener('resize', () => {
  screenCenter = getScreenCenter();
});

export class Runtime {
  private _viewModel = new DirectionalPadViewModel();
  private _handles: IHandle[] = [];
  private readonly _character: Graphic | undefined;
  private _layerView: __esri.FeatureLayerView | undefined;
  constructor(
    public readonly view: MapView,
    private readonly _handleScoreUp: (increment: number) => void,
  ) {
    // BUG: document
    const withView = this._viewModel as { view?: MapView };
    withView.view = this.view;

    const character = (this.view.map.layers.at(1) as GraphicsLayer).graphics.at(
      0,
    )!;
    this._character = character;
    const featureLayer = this.view.map.layers.at(0) as FeatureLayer;

    const characterSymbol = character.symbol as SimpleMarkerSymbol;

    void view
      .whenLayerView(featureLayer)
      .then((layerView: FeatureLayerView) => {
        this._layerView = layerView;

        const featureQueryThrottleRate = 100;
        const consumeConsumables = throttle(async () => {
          const query = layerView.createQuery();
          query.geometry = character.geometry;
          // Symbol size is in px, but query distance is in meters - doing a
          // rough conversion here.
          query.distance = 8_600 + characterSymbol.size * 255;
          query.units = 'meters';
          // query.distance
          const { features } = await layerView.queryFeatures(query);
          if (features.length === 0) {
            return;
          }

          features.forEach((feature) => {
            feature.geometry = getRandomPoint();
          });
          void featureLayer.applyEdits({
            updateFeatures: features,
          });

          // Increase area at a constant rate per particle - which means radios
          // will increase at an ever decreasing rate.
          const growthFactor = 45;
          const oldRadius = characterSymbol.size;
          const oldArea = Math.PI * (oldRadius * oldRadius);
          const newArea = oldArea + (features.length + growthFactor);
          const newRadius = Math.sqrt(newArea / Math.PI);

          characterSymbol.size = newRadius;
          _handleScoreUp(features.length);
          if (import.meta.env.MODE !== 'production' && isDebug()) {
            console.log(characterSymbol.size);
          }
        }, featureQueryThrottleRate);

        // Sync the graphic with the view
        this._handles.push(
          watch(
            () => this.view.center,
            (center) => {
              character.geometry = center.clone();
              consumeConsumables();
            },
          ),
        );
      });
  }

  public pointerDown(event: PointerEvent): void {
    // FEATURE: on touch devices, track around pointer start location rather than screen center? (so that fingers don't obscure the screen)
    this._viewModel.beginFollowingPointer(event, screenCenter);
  }

  public moveOnce(angle: number): void {
    this._viewModel.moveOnce(angle);
  }

  public tick(timePassed: number): MenuState | undefined {
    // FEATURE: make NPCs move to active area if outside
    // FEATURE: make NPCs run away if larger entity is close
    // FEATURE: make NPCs attack if smaller entity is close
    // FEATURE: else, make NPCs move in a random direction for a random amount of time (and change direction based on +- from previous rather than completely)
    // FEATURE: make NPCs re-span if it is consumed (and re-size to ~player size)
    // FEATURE: trigger game over if player is consumed
  }

  destroy(): void {
    this._handles.forEach((handle) => handle.remove());
    this._viewModel.destroy();
  }
}
