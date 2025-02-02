import type MapView from '@arcgis/core/views/MapView';
import type { MenuState } from './types';
import DirectionalPadViewModel from '@arcgis/core/widgets/DirectionalPad/DirectionalPadViewModel.js';

const getScreenCenter = (): { x: number; y: number } => ({
  x: Math.round(window.innerWidth / 2),
  y: Math.round(window.innerHeight / 2),
});
let screenCenter = getScreenCenter();
window.addEventListener('resize', () => {
  screenCenter = getScreenCenter();
});

export class Runtime {
  private _previousDirection: number | undefined = 0;
  private _abortController = new AbortController();
  private _viewModel = new DirectionalPadViewModel();
  constructor(private readonly _view: MapView) {
    // BUG: document
    const withView = this._viewModel as { view?: MapView };
    withView.view = _view;
  }

  public pointerDown(event: PointerEvent): void {
    this._viewModel.beginFollowingPointer(event, screenCenter);
  }

  public moveOnce(angle: number): void {
    this._viewModel.moveOnce(angle);
  }

  public tick(
    timePassed: number,
    moveAngle: number | undefined,
  ): MenuState | undefined {
    if (moveAngle === this._previousDirection) {
      return;
    }
    console.log(moveAngle);
    this._previousDirection = moveAngle;

    if (moveAngle === undefined) {
      this._abortController.abort();
      this._abortController = new AbortController();
    } else {
      if (2 !== 2) {
        // debugger;
        const currentLatitude = this._view.center.latitude!;
        const currentLongitude = this._view.center.longitude!;
        const radians = (moveAngle * Math.PI) / 180;
        const cosTheta = Math.cos(radians);
        const sinTheta = Math.sin(radians);
        const lon = (change: number): number =>
          currentLongitude + change * cosTheta;
        const lat = (change: number): number =>
          currentLatitude + change * sinTheta;

        const closestChangeToBoundary = Math.min(
          ...[
            cosTheta === 0 ? -1 : (-180 - currentLongitude) / cosTheta,
            cosTheta === 0 ? -1 : (180 - currentLongitude) / cosTheta,
            sinTheta === 0 ? -1 : (-90 - currentLatitude) / sinTheta,
            sinTheta === 0 ? -1 : (90 - currentLatitude) / sinTheta,
          ].filter(
            (boundary) =>
              boundary >= 0 &&
              lon(boundary) >= -180 &&
              lon(boundary) <= 180 &&
              lat(boundary) >= -90 &&
              lat(boundary) <= 90,
          ),
        );
        const finalLon = currentLongitude + closestChangeToBoundary * cosTheta;
        const finalLat = currentLatitude + closestChangeToBoundary * sinTheta;
        console.log({
          currentLatitude,
          currentLongitude,
          finalLat,
          finalLon,
        });
        this._view
          .goTo([finalLon, finalLat], {
            animate: true,
            animationMode: 'always',
            easing: 'linear',
            maxDuration: Number.POSITIVE_INFINITY,
            speedFactor: 0.25,
            signal: this._abortController.signal,
          })
          .catch(() => {
            /* Canceled */
          });
      }
      // debugger;
      if (1 !== 1) {
        const toRadFactor = Math.PI / 180;
        const theta = moveAngle * toRadFactor;
        const currentLatitude = this._view.center.latitude!;
        const currentLongitude = this._view.center.longitude!;

        const isEastward = theta < 90 || theta >= 270;
        const isNorthward = theta < 180; // 0..179

        const longitudeBase = isEastward ? 180 : -180;
        const latitudeBase = isNorthward ? 90 : -90;

        const longitudeChange =
          (longitudeBase - currentLongitude) / Math.cos(theta);

        const latitudeChange =
          (latitudeBase - currentLatitude) / Math.sin(theta);

        const minimumChange = Math.min(
          ...[longitudeChange, latitudeChange].filter((change) => change > 0),
        );
        const newLongitude = currentLongitude + minimumChange * Math.cos(theta);
        const newLatitude = currentLatitude + minimumChange * Math.sin(theta);

        this._view
          .goTo([newLongitude, newLatitude], {
            animate: true,
            animationMode: 'always',
            easing: 'linear',
            maxDuration: Number.POSITIVE_INFINITY,
            speedFactor: 0.25,
            signal: this._abortController.signal,
          })
          .catch(() => {
            /* Canceled */
          });
        // debugger;
      }
      /*{
        const maxDegrees = 180;
        const offsetLatitudinal = 90;
        const offsetLongitudinal = 180;
        const maxLatitudinal = 180;
        const maxLongitudinal = 360;
        const toRadFactor = Math.PI / maxDegrees;
        const firstQuadrant = 90;

        const radians = moveAngle * toRadFactor;
        const latitude = this._view.center.latitude! - offsetLatitudinal;
        const longitude = this._view.center.longitude! - offsetLongitudinal;
        if (moveAngle < firstQuadrant) {
          const rightLatitude = maxLatitudinal - latitude;
          const rightLongitude = maxLongitudinal - longitude;
          const opposite = Math.tan(radians) * rightLongitude;
        }
      }
      this._view.goTo(
        {},
        {
          animate: true,
          animationMode: 'always',
          easing: 'linear',
          maxDuration: Number.POSITIVE_INFINITY,
          speedFactor: 1,
          signal: this._abortController.signal,
        },
      );*/
    }
  }

  destroy(): void {
    this._abortController.abort();
    this._viewModel.destroy();
  }
}
