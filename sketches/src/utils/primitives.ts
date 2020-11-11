import {Rect, RectByTriangle} from '../types';

export const rectToTriangles = (r: Rect): RectByTriangle => {
  const corners = [
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

  return [
    [corners[0], corners[1], corners[2]],
    [corners[1], corners[2], corners[3]],
  ] as RectByTriangle;
};
