import { Bound, Rect, RectByCorner, RectByTriangle } from '../types';
import { subVec2 } from './vector';

export const rectToTriangles = (r: Rect): RectByTriangle => {
  const corners = rectToCorners(r);

  return [
    [corners[0], corners[1], corners[2]],
    [corners[1], corners[2], corners[3]],
  ] as RectByTriangle;
};

export const rectToCorners = (r: Rect): RectByCorner => {
  return [
    r[0], // top left
    [
      // top right
      r[1][0],
      r[0][1],
    ],
    [
      // bottom left
      r[0][0],
      r[1][1],
    ],
    r[1], // bottom right
  ];
};

export const rectToBounds = (r: Rect): Bound => {
  return subVec2(r[1], r[0]);
};

export const isRectInRect = (or: Rect, ir: Rect): Boolean => {
  return (
    or[0][0] <= ir[0][0] &&
    or[1][0] >= ir[1][0] &&
    or[0][1] <= ir[0][1] &&
    or[1][1] >= ir[1][1]
  );
};
