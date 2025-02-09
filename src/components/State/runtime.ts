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
import {
  attackAreaFactor,
  attackChance,
  attackPlanExpiration,
  escapeAreaFactor,
  escapeChance,
  escapePlanExpiration,
  npcMoveSpeed,
  reSpawnAreaFactor,
  similarSizeAlternativeThreshold,
  similarSizeThreshold,
  wonderingPlanExpiration,
} from '../MapRenderer/config';
import {
  degToRad,
  getActiveAreaHeading,
  getNpcSize,
  getNpcSpawnPoint,
  isInActiveArea,
  maxAngle,
  radToDeg,
} from '../MapRenderer/npc';
import {
  increaseRadius,
  pxToDistance,
  makePlayerSymbol,
} from '../MapRenderer/character';

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
  direction: number;
  planExpiration: number;
};

export class Runtime {
  private readonly _viewModel = new DirectionalPadViewModel();
  private readonly _handles: IHandle[] = [];
  private readonly _character: Graphic;
  private readonly _characterSymbol: SimpleMarkerSymbol;
  private readonly _npcs: Npc[];
  private readonly _entities: Graphic[] = [];
  private readonly _entitiesLayer: GraphicsLayer;
  private readonly _consumablesLayer: FeatureLayer;
  private _layerView: __esri.FeatureLayerView | undefined;
  constructor(
    public readonly view: MapView,
    private readonly _handleScoreUp: (increment: number) => void,
    private readonly _setMenuState: (state: MenuState) => void,
  ) {
    // BUG: document
    const withView = this._viewModel as { view?: MapView };
    withView.view = this.view;

    this._entitiesLayer = this.view.map.layers.at(1) as GraphicsLayer;
    const [character, ...npcs] = this._entitiesLayer.graphics.toArray();
    this._sortEntities();

    this._character = character!;
    this._characterSymbol = character!.symbol as SimpleMarkerSymbol;
    this._npcs = npcs.map((graphic) => ({
      graphic,
      direction: 0,
      planExpiration: 0,
    }));
    this._entities = [character!, ...npcs];
    const featureLayer = this.view.map.layers.at(0) as FeatureLayer;
    this._consumablesLayer = featureLayer;

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

    const query = layerView.createQuery();
    query.geometry = character.geometry;
    query.distance = pxToDistance(this._characterSymbol.size);
    query.units = 'meters';
    const { features } = await layerView.queryFeatures(query);
    if (features.length === 0) {
      return;
    }

    features.forEach((feature) => {
      feature.geometry = getRandomPoint();
    });
    void this._consumablesLayer.applyEdits({
      updateFeatures: features,
    });

    this._characterSymbol.size = increaseRadius(
      this._characterSymbol.size,
      features.length,
    );
    this._handleScoreUp(features.length);
    this._sortEntities();
  }, featureQueryThrottleRate);

  private _makeNpcsAct(): void {
    const now = Date.now();
    this._npcs.forEach((npc) => {
      const point = npc.graphic.geometry as Point;
      const isPlanExpired = npc.planExpiration < now;
      const newPlan = this._computeNeighborInteractions(
        npc.graphic,
        isPlanExpired,
      );
      if (newPlan === false) {
        return;
      }

      if (isPlanExpired) {
        const [newDirection, expiration] = newPlan ?? [
          npc.direction + (Math.random() * maxAngle - maxAngle / 2),
          wonderingPlanExpiration,
        ];
        npc.planExpiration = now + Math.random() * expiration;
        npc.direction = newDirection;
      }

      const { x, y, spatialReference } = point;
      const radiansAngle = degToRad(npc.direction);
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
    });
  }

  /**
   * Find enemies/prey and decide to move to them or away.
   */
  private _computeNeighborInteractions(
    npc: Graphic,
    isPlanExpired: boolean,
  ): false | [direction: number, expiration: number] | undefined {
    let enemyX = 0;
    let enemyY = 0;
    let preyX = 0;
    let preyY = 0;
    let preyDistance = Number.POSITIVE_INFINITY;
    let wasConsumed = false as boolean;
    const npcPoint = npc.geometry as Point;
    const npcSymbol = npc.symbol as SimpleMarkerSymbol;
    const npcSize = npcSymbol.size;
    this._entities.forEach((entity) => {
      if (npc === entity) {
        return;
      }

      const entitySymbol = entity.symbol as SimpleMarkerSymbol;
      const entitySize = entitySymbol.size;
      const isSimilarSize =
        Math.abs(npcSize - entitySize) <
        Math.min(
          similarSizeAlternativeThreshold,
          npcSize * similarSizeThreshold,
        );
      if (isSimilarSize) {
        return;
      }

      const entityPoint = entity.geometry as Point;
      const dx = entityPoint.x - npcPoint.x;
      const dy = entityPoint.y - npcPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const isPrey = npcSize > entitySize;
      if (
        !isInActiveArea(
          this.view,
          distance,
          isPrey ? escapeAreaFactor : attackAreaFactor,
        )
      ) {
        return;
      }

      const isPlayer = entity === this._character;
      if (isPrey) {
        if (isPlayer) {
          const entityReach = pxToDistance(npcSize);
          const isInside = distance < entityReach;
          if (isInside) {
            this._setMenuState('gameOver');
          }
        }

        if (distance < preyDistance) {
          // Only consider the closest prey
          preyX = dx;
          preyY = dy;
          preyDistance = distance;
        }
      } else {
        const enemyReach = pxToDistance(entitySize);
        const isInside = distance < enemyReach;
        if (isInside) {
          entitySymbol.size = increaseRadius(entitySize, npcSize);
          if (isPlayer) {
            this._handleScoreUp(Math.round(npcSize));
          }
          npc.geometry = getNpcSpawnPoint(this.view, reSpawnAreaFactor);
          npc.symbol = makePlayerSymbol(getNpcSize(this._characterSymbol.size));
          this._sortEntities();
          wasConsumed = true;
          return;
        }
        // Compute vector away from all enemies
        enemyX -= dx;
        enemyY -= dy;
      }
    });
    if (wasConsumed) {
      return false;
    }

    if ((enemyX !== 0 || enemyY !== 0) && Math.random() < escapeChance) {
      const direction = radToDeg(Math.atan2(enemyY, enemyX));
      // Escape
      return [direction, escapePlanExpiration];
    } else if (!isPlanExpired) {
      return;
    }

    const activeAreaHeading = getActiveAreaHeading(this.view, npcPoint);
    if (activeAreaHeading !== undefined) {
      // Return to active area
      return [activeAreaHeading, wonderingPlanExpiration];
    } else if ((preyX !== 0 || preyY !== 0) && Math.random() < attackChance) {
      const direction = radToDeg(Math.atan2(preyY, preyX));
      // Attack
      return [direction, attackPlanExpiration];
    } else {
      // Wander
      return;
    }
  }

  /**
   * Ensure larger entities are drawn on top of smaller entities.
   */
  private _sortEntities(): void {
    this._entitiesLayer.graphics.sort((left, right) => {
      const aSize = (left.symbol as SimpleMarkerSymbol).size;
      const bSize = (right.symbol as SimpleMarkerSymbol).size;
      return aSize - bSize;
    });
  }
}
