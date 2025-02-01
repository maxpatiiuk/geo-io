import React from 'react';

import type { IR } from '../../lib/types';
import { Direction } from '../State/types';
import { GameOverOverlay } from './GameOverOverlay';
import { MapRenderer } from '../MapRenderer';
import { pauseOverlay } from './PauseOverlay';

export function Game(): React.ReactNode {
  const [gameOverScore, setGameOverScore] = React.useState<
    number | undefined
  >();
  return (
    <>
      <DisplayRenderer
        isGameOver={typeof gameOverScore === 'number'}
        onGameOver={setGameOverScore}
      />
      {typeof gameOverScore === 'number' && (
        <GameOverOverlay
          score={gameOverScore}
          onRestart={(): void => setGameOverScore(undefined)}
        />
      )}
    </>
  );
}

function DisplayRenderer({
  isGameOver,
  onGameOver: handleGameOver,
}: {
  readonly isGameOver: boolean;
  readonly onGameOver: (score: number) => void;
}): React.ReactNode {
  const [isPaused, setIsPaused] = React.useState(false);
  const isPausedRef = React.useRef(isPaused);
  isPausedRef.current = isPaused;

  React.useEffect(() => {
    if (isGameOver) {
      return undefined;
    }
    function gameLoop(): void {
      const { isGameOver = false, ...newState } = reducers.gravity(
        stateRef.current,
      );
      if (isGameOver) {
        handleGameOver(stateRef.current.score);
      }
      setState(newState);
    }
    gameLoop();

    const interval = setInterval(
      gameLoop,
      // Speed grows logarithmically
      initialSpeed / Math.log(3 + state.score / scoreMultiplier),
    );
    return (): void => clearInterval(interval);
  }, [isGameOver]);

  React.useEffect(() => {
    if (isGameOver) {
      return undefined;
    }
    setState(reducers.initial(Array.from({ length: 5 }, shapeRandomizer)));

    document.addEventListener('keydown', captureKeyDown, { capture: true });
    function captureKeyDown(event: KeyboardEvent): void {
      if (event.key !== activeKey) {
        clearTimeout(timeout);
      }

      if (event.key in keyMapping) {
        pressedKeys.add(event.key);
        if (activeKey !== event.key) {
          activeKey = event.key;
          move();
        }
        event.preventDefault();
        event.stopPropagation();
      } else {
        activeKey = undefined;
        if (event.key === 'Escape' || event.key === 'p') {
          setIsPaused(!isPausedRef.current);
        }
      }
    }

    let activeKey: string | undefined = undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined = undefined;
    const pressedKeys = new Set<string>();
    const keyRepeatSpeed = 100;

    function move(): void {
      if (activeKey === undefined) {
        return;
      }

      setState(reducers.move(stateRef.current, keyMapping[activeKey]));
      if (activeKey !== 'ArrowUp') {
        timeout = setTimeout(move, keyRepeatSpeed);
      }
    }

    document.addEventListener('keyup', captureKeyUp, { capture: true });
    function captureKeyUp(event: KeyboardEvent): void {
      pressedKeys.delete(event.key);
      if (event.key !== activeKey) {
        return;
      }
      activeKey = Array.from(pressedKeys)[0];
      clearTimeout(timeout);
      move();
    }

    return (): void => {
      activeKey = undefined;
      document.removeEventListener('keydown', captureKeyDown, {
        capture: true,
      });
      document.removeEventListener('keyup', captureKeyUp, {
        capture: true,
      });
    };
  }, [isGameOver]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-black text-white">
      <MapRenderer score={state.score} isPaused={isPaused || isGameOver} />
      {isPaused && pauseOverlay}
    </div>
  );
}

const keyMapping: IR<Direction> = {
  ArrowUp: Direction.UP,
  ArrowDown: Direction.DOWN,
  ArrowLeft: Direction.LEFT,
  ArrowRight: Direction.RIGHT,
  w: Direction.UP,
  s: Direction.DOWN,
  a: Direction.LEFT,
  d: Direction.RIGHT,
  // For Vim users :)
  k: Direction.UP,
  j: Direction.DOWN,
  h: Direction.LEFT,
  l: Direction.RIGHT,
};
