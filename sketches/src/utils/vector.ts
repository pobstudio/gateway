import { Vec2 } from '../types';

export const addVec2 = (v1: Vec2, v2: Vec2): Vec2 => [
  v1[0] + v2[0],
  v1[1] + v2[1],
];

export const subVec2 = (v1: Vec2, v2: Vec2): Vec2 => [
  v1[0] - v2[0],
  v1[1] - v2[1],
];

export const mulVec2 = (v1: Vec2, v2: Vec2): Vec2 => [
  v1[0] * v2[0],
  v1[1] * v2[1],
];

export const divVec2 = (v1: Vec2, v2: Vec2): Vec2 => [
  v1[0] / v2[0],
  v1[1] / v2[1],
];

export const modVec2 = (v1: Vec2, v2: Vec2): Vec2 => [
  v1[0] % v2[0],
  v1[1] % v2[1],
];

export const divVec2ByVal = (v1: Vec2, n: number): Vec2 => [
  v1[0] / n,
  v1[1] / n,
];

export const dotMulVec2 = (v1: Vec2, v2: Vec2) => v1[0] * v2[0] + v1[1] * v2[1];

export const lenVec2 = (v: Vec2) => (v[0] ** 2 + v[1] ** 2) ** 0.5;

export const normVec2 = (v: Vec2) => divVec2ByVal(v, lenVec2(v));

export const applyVec2 = (
  v: Vec2,
  t: [(n: number) => number, (n: number) => number],
): Vec2 => [t[0](v[0]), t[1](v[1])];
