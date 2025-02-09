import type MapView from '@arcgis/core/views/MapView';
import type { GetSet, IR } from '../../lib/types';
import { direction, type MenuState } from './types';
import React from 'react';
import { Runtime } from './runtime';
import { listen } from '../../lib/utils';

export function useGameLogic(
  [menuState, setMenuState]: GetSet<MenuState>,
  view: MapView | undefined,
  interactionContainer: HTMLDivElement | null,
  handleScoreUp: ((increment: number) => void) | undefined,
): Runtime | undefined {
  const setMenuStateRef = React.useRef(setMenuState);
  setMenuStateRef.current = setMenuState;

  const menuStateRef = React.useRef(menuState);
  menuStateRef.current = menuState;
  const isGameOver = menuState === 'gameOver';

  const [runtime, setRuntime] = React.useState<Runtime | undefined>(undefined);
  React.useEffect(() => {
    if (view === undefined || isGameOver || handleScoreUp === undefined) {
      setRuntime(undefined);
      return;
    }
    const runtime = new Runtime(view, handleScoreUp, setMenuState);
    setRuntime(runtime);
    return (): void => runtime.destroy();
  }, [view, isGameOver, handleScoreUp]);

  const moveAngle = React.useRef<number | undefined>(undefined);

  React.useEffect(() => {
    if (runtime === undefined || interactionContainer === null) {
      return;
    }

    const stopPointerDown = listen(
      document,
      'pointerdown',
      (event) => {
        /**
         * Release implicit pointer capture on touch devices.
         * See https://stackoverflow.com/a/70737325/8584605
         */
        if (interactionContainer.hasPointerCapture(event.pointerId)) {
          interactionContainer.releasePointerCapture(event.pointerId);
        }
        runtime.pointerDown(event);
      },
      { passive: true },
    );

    const pressedAngles = new Set<number>();
    function computeKeyAngle(): void {
      if (pressedAngles.size === 0) {
        moveAngle.current = undefined;
        return;
      }

      const angle =
        pressedAngles.has(direction.south) && pressedAngles.has(direction.west)
          ? (-direction.south + direction.west) / 2
          : Array.from(pressedAngles).reduce(
              (total, angle) => total + angle,
              0,
            ) / pressedAngles.size;
      runtime!.moveOnce(angle);
    }

    // FEATURE: use view's native keyboard handling to support gamepad?
    const stopKeyDown = listen(
      document,
      'keydown',
      (event) => {
        const angle = keyMapping[event.key];
        if (angle !== undefined) {
          pressedAngles.add(angle);
          computeKeyAngle();
        } else if (event.key === 'Escape' || event.key === 'p') {
          setMenuState(menuStateRef.current === 'paused' ? 'main' : 'paused');
        } else {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
      },
      { capture: true },
    );
    const stopKeyUp = listen(
      document,
      'keyup',
      (event) => {
        const angle = keyMapping[event.key];
        if (angle === undefined) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        pressedAngles.delete(angle);
        computeKeyAngle();
      },
      { capture: true },
    );

    return (): void => {
      stopPointerDown();
      stopKeyDown();
      stopKeyUp();
    };
  }, [runtime, interactionContainer]);

  return runtime;
}

const keyMapping: IR<number> = {
  ArrowUp: direction.north,
  ArrowDown: direction.south,
  ArrowLeft: direction.west,
  ArrowRight: direction.east,
  w: direction.north,
  s: direction.south,
  a: direction.west,
  d: direction.east,
  // For Vim users :)
  k: direction.north,
  j: direction.south,
  h: direction.west,
  l: direction.east,
};
