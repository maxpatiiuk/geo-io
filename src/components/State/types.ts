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
  east: 0,
  north: 90,
  west: 180,
  south: 270,
  altEast: 360,
};
