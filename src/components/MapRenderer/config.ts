import Polygon from '@arcgis/core/geometry/Polygon.js';
import SpatialReference from '@arcgis/core/geometry/SpatialReference.js';

// Roughly equal to zoom 22
export const scale = 2_311_162;

/**
 * Much of the planet turns out to be water - exclude it from spawn zones so
 * that the background is more interesting.
 */
export const landPolygon = new Polygon({
  spatialReference: SpatialReference.WGS84,
  rings: [
    [
      [-29, 68],
      [-53, 52],
      [-50, 45],
      [-80, 31],
      [-31, -7],
      [-62, -51],
      [-68, -58],
      [-78, -52],
      [-72, -21],
      [-85, -4],
      [-79, 5],
      [-113, 21],
      [-127, 40],
      [-127, 49],
      [-143, 59],
      [-173, 51],
      [-173, 52],
      [-159, 58],
      [-178, 65],
      [-179, 62],
      [-180, 61],
      [-180, 62],
      [-180, 64],
      [-180, 66],
      [-180, 68],
      [-180, 70],
      [-180, 72],
      [-129, 72],
      [-124, 78],
      [-77, 83],
      [-20, 84],
      [-8, 82],
      [-22, 69],
      [-29, 68],
    ],
    [
      [180, 61],
      [165, 57],
      [144, 34],
      [124, 30],
      [129, 3],
      [163, -6],
      [154, -35],
      [180, -35],
      [174, -48],
      [163, -48],
      [174, -36],
      [152, -36],
      [148, -46],
      [130, -33],
      [112, -37],
      [111, -20],
      [128, -11],
      [104, -9],
      [92, 7],
      [76, 5],
      [62, 24],
      [44, -10],
      [54, -12],
      [50, -26],
      [36, -26],
      [23, -38],
      [14, -38],
      [6, 3],
      [-15, 5],
      [-20, 21],
      [-9, 35],
      [-12, 54],
      [18, 71],
      [43, 69],
      [61, 78],
      [147, 77],
      [151, 72],
      [180, 72],
      [180, 70],
      [180, 68],
      [180, 66],
      [180, 64],
      [180, 62],
      [180, 61],
    ],
  ],
});

export const consumablesCount = 100_000;

// Restrict the poles
export const minLatitude = -65;
export const maxLatitude = 75;
export const minLongitude = -180;
export const maxLongitude = 180;

export const npcCount = 20;
/*
 * Play area is the size of the screen multiplied by this factor.
 * NPCs are spawned within the active area of the player.
 * If player moves, and NPC becomes outside of the active area, it will have
 * strong compulsion to move back into the active area.
 */
export const activeAreaFactor = 8;
