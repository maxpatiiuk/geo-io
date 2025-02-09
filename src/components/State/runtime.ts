import type MapView from '@arcgis/core/views/MapView';
import type { MenuState } from './types';
import DirectionalPadViewModel from '@arcgis/core/widgets/DirectionalPad/DirectionalPadViewModel.js';
import type Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point.js';
import { watch } from '@arcgis/core/core/reactiveUtils.js';
import type GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import type FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import type FeatureLayerView from '@arcgis/core/views/layers/FeatureLayerView';
import { throttle } from '../../lib/utils';
import {
  getRandomPoint,
  isInsideMercatorConstraint,
} from '../MapRenderer/utils';
import type SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import { npcMoveSpeed } from '../MapRenderer/config';
import { getActiveAreaHeading } from '../MapRenderer/npc';

const getScreenCenter = (): { x: number; y: number } => ({
  x: Math.round(window.innerWidth / 2),
  y: Math.round(window.innerHeight / 2),
});
let screenCenter = getScreenCenter();
window.addEventListener('resize', () => {
  screenCenter = getScreenCenter();
});
const featureQueryThrottleRate = 100;

type Npc = {
  graphic: Graphic;
  plan: NpcPlan;
  planExpiration: number;
};
type NpcPlan =
  | {
      // This may mean run away, return to active area or wander around
      type: 'direction';
      direction: number;
    }
  | {
      type: 'attack';
      target: Graphic;
    };

export class Runtime {
  private readonly _viewModel = new DirectionalPadViewModel();
  private readonly _handles: IHandle[] = [];
  private readonly _character: Graphic;
  private readonly _npcs: Npc[];
  private readonly _featureLayer: FeatureLayer;
  private _layerView: __esri.FeatureLayerView | undefined;
  constructor(
    public readonly view: MapView,
    private readonly _handleScoreUp: (increment: number) => void,
    private readonly _setMenuState: (state: MenuState) => void,
  ) {
    // BUG: document
    const withView = this._viewModel as { view?: MapView };
    withView.view = this.view;

    const [character, ...npcs] = (
      this.view.map.layers.at(1) as GraphicsLayer
    ).graphics.toArray();

    this._character = character!;
    // FEATURE: make NPCs run away if larger entity is close
    // FEATURE: make NPCs attack if smaller entity is close (with some chance to give up)
    // FEATURE: make NPCs re-span if it is consumed (and re-size to ~player size)
    // FEATURE: trigger game over if player is consumed
    this._npcs = npcs.map((graphic) => ({
      graphic,
      plan: { type: 'direction', direction: 0 },
      planExpiration: 0,
    }));
    const featureLayer = this.view.map.layers.at(0) as FeatureLayer;
    this._featureLayer = featureLayer;

    void view
      .whenLayerView(featureLayer)
      .then((layerView: FeatureLayerView) => {
        if (this._viewModel.destroyed) {
          return;
        }
        this._layerView = layerView;

        // Sync the graphic with the view
        this._handles.push(
          watch(
            () => this.view.center,
            (center) => {
              character!.geometry = center.clone();
              // Since this is a single-player game, we have the luxury of
              // stopping NPC movement when player is stopped - kind of like
              // Super Hot. In exchange, the movement speed of player and NPC is
              // higher.
              this._makeNpcsAct();
              this._consumeConsumables();
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

  public destroy(): void {
    this._handles.forEach((handle) => handle.remove());
    this._viewModel.destroy();
  }

  private _consumeConsumables = throttle(async () => {
    const character = this._character;
    const layerView = this._layerView!;

    const characterSymbol = character.symbol as SimpleMarkerSymbol;
    const query = layerView.createQuery();
    query.geometry = character.geometry;
    // Symbol size is in px, but query distance is in meters - doing a
    // rough conversion here.
    query.distance = 8_600 + characterSymbol.size * 255;
    query.units = 'meters';
    const { features } = await layerView.queryFeatures(query);
    if (features.length === 0) {
      return;
    }

    features.forEach((feature) => {
      feature.geometry = getRandomPoint();
    });
    void this._featureLayer.applyEdits({
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
    this._handleScoreUp(features.length);
  }, featureQueryThrottleRate);

  private _makeNpcsAct(): void {
    const now = Date.now();
    this._npcs.forEach((npc) => {
      const point = npc.graphic.geometry as Point;
      if (npc.planExpiration < now) {
        /*npc.planExpiration = now + Math.random() * 2_000;
        let previousDirection =
          npc.plan.type === 'direction' ? npc.plan.direction : 0;
        if (previousDirection > 180) {
          previousDirection = previousDirection - 360;
        }
        npc.plan = {
          type: 'direction',
          direction: previousDirection + 20,
        };
        const radiansAngle = (npc.plan.direction * Math.PI) / 180;
        console.log(npc.plan.direction);*/
        npc.planExpiration = now + Math.random() * 2_000;
        const activeAreaHeading = getActiveAreaHeading(this.view, point);
        if (activeAreaHeading !== undefined) {
          npc.plan = { type: 'direction', direction: activeAreaHeading };
        } else {
          const previousDirection =
            npc.plan.type === 'direction' ? npc.plan.direction : 0;
          npc.plan = {
            type: 'direction',
            direction: previousDirection + (Math.random() * 180 - 90),
          };
        }
        const radiansAngle = (npc.plan.direction * Math.PI) / 180;
        console.log(npc.plan.direction);
      }
      if (npc.plan.type === 'direction') {
        const { x, y, spatialReference } = point;
        const radiansAngle = (npc.plan.direction * Math.PI) / 180;
        const newX = x + Math.cos(radiansAngle) * npcMoveSpeed;
        const newY = y + Math.sin(radiansAngle) * npcMoveSpeed;
        if (isInsideMercatorConstraint(newX, newY)) {
          npc.graphic.geometry = new Point({
            x: newX,
            y: newY,
            spatialReference,
          });
        } else {
          npc.planExpiration = 0;
        }
      }
    });
  }
}
