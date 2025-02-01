export type MenuState =
  | {
      type: 'gameOver';
      score: number;
    }
  | {
      type: 'main';
      score: number;
    }
  | { type: 'paused'; score: number };

export const direction = {
  up: 0,
  right: 90,
  down: 180,
  left: 270,
  altUp: 360,
};
