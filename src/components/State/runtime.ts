import type MapView from '@arcgis/core/views/MapView';
import type { MenuState } from './types';

export class Runtime {
  private _previousDirection: number | undefined = 0;
  constructor(private _view: MapView) {}

  public tick(
    timePassed: number,
    moveDirection: number | undefined,
  ): MenuState | undefined {
    if (moveDirection !== this._previousDirection) {
      console.log(moveDirection);
      this._previousDirection = moveDirection;
    }
    return;
  }
}
