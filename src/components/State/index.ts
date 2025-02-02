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
): void {
  const setMenuStateRef = React.useRef(setMenuState);
  setMenuStateRef.current = setMenuState;

  const menuStateRef = React.useRef(menuState);
  menuStateRef.current = menuState;
  const isGameOver = menuState.type === 'gameOver';

  const runtime = React.useMemo(
    () => (view === undefined || isGameOver ? undefined : new Runtime(view)),
    [view, isGameOver],
  );
  React.useEffect(() => (): void => runtime?.destroy(), []);

  const moveAngle = React.useRef<number | undefined>(undefined);

  React.useEffect(() => {
    if (runtime === undefined) {
      return;
    }

    let destructorCalled = false;
    function gameLoop(timePassed: number): void {
      if (destructorCalled) {
        return;
      }

      const newMenuState = runtime!.tick(timePassed, moveAngle.current);
      if (newMenuState !== undefined) {
        setMenuState(newMenuState);
      }

      requestAnimationFrame(gameLoop);
    }
    gameLoop(0);

    return (): void => {
      destructorCalled = true;
    };
  }, [runtime, setMenuState]);

  React.useEffect(() => {
    if (runtime === undefined || interactionContainer === null) {
      return;
    }

    const stopPointerDown = listen(
      interactionContainer,
      'pointerdown',
      (event: PointerEvent): void => {
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

      const angle = pressedAngles.has(direction.north)
        ? pressedAngles.has(direction.east)
          ? 45
          : pressedAngles.has(direction.west)
            ? -45
            : 0
        : pressedAngles.has(direction.south)
          ? pressedAngles.has(direction.east)
            ? 135
            : pressedAngles.has(direction.west)
              ? -135
              : 180
          : pressedAngles.has(direction.east)
            ? 90
            : -90;
      runtime?.moveOnce(angle);
    }

    const stopKeyDown = listen(
      interactionContainer,
      'keydown',
      (event: KeyboardEvent): void => {
        const angle = keyMapping[event.key];
        if (angle !== undefined) {
          pressedAngles.add(angle);
          computeKeyAngle();
        } else if (event.key === 'Escape' || event.key === 'p') {
          setMenuState({ type: 'paused', score: menuStateRef.current.score });
        } else {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
      },
      { capture: true },
    );
    const stopKeyUp = listen(
      interactionContainer,
      'keyup',
      (event: KeyboardEvent): void => {
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
