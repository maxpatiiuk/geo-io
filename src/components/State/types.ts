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
  north: 0,
  east: 90,
  south: 180,
  west: -90,
};
