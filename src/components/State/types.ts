export type MenuState =
  | {
      readonly type: 'gameOver';
      readonly score: number;
    }
  | {
      readonly type: 'main';
      readonly score: number;
    }
  | { readonly type: 'paused'; readonly score: number };

export const direction = {
  north: 0,
  east: 90,
  south: 180,
  west: -90,
};
