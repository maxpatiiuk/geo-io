import type MapView from '@arcgis/core/views/MapView';
import type { GetSet, IR } from '../../lib/types';
import { direction, type MenuState } from './types';
import React from 'react';
import { Runtime } from './runtime';

export function useGameLogic(
  [menuState, setMenuState]: GetSet<MenuState>,
  view: MapView | undefined,
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
    if (runtime === undefined) {
      return;
    }

    const pressedAngles = new Set<number>();
    function computeKeyAngle(): void {
      if (pressedAngles.size === 0) {
        moveAngle.current = undefined;
        return;
      }

      const hasLeft = pressedAngles.has(direction.left);
      const angleSum = Array.from(pressedAngles).reduce(
        (sum, angle) =>
          sum + (hasLeft && angle === 0 ? direction.altUp : angle),
        0,
      );
      const averageAngle = Math.round(angleSum / pressedAngles.size);
      moveAngle.current = averageAngle;
    }

    document.addEventListener('keydown', captureKeyDown, { capture: true });
    function captureKeyDown(event: KeyboardEvent): void {
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
    }
    document.addEventListener('keyup', captureKeyUp, { capture: true });
    function captureKeyUp(event: KeyboardEvent): void {
      const angle = keyMapping[event.key];
      if (angle === undefined) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      pressedAngles.delete(angle);
      computeKeyAngle();
    }

    return (): void => {
      document.removeEventListener('keydown', captureKeyDown, {
        capture: true,
      });
      document.removeEventListener('keyup', captureKeyUp, {
        capture: true,
      });
    };
  }, [runtime]);
}

const keyMapping: IR<number> = {
  ArrowUp: direction.up,
  ArrowDown: direction.down,
  ArrowLeft: direction.left,
  ArrowRight: direction.right,
  w: direction.up,
  s: direction.down,
  a: direction.left,
  d: direction.right,
  // For Vim users :)
  k: direction.up,
  j: direction.down,
  h: direction.left,
  l: direction.right,
};
