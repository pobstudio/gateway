import Seedrandom from 'seedrandom';

import { Cord, Vec2 } from '../types';
import { newArray } from '../utils';
import { randomRangeFactory } from '../utils/random';

const OP_WEIGHTS: { [op: string]: number } = {
  CONSTANT: 0.1,
  SIN: 0.1,
  COS: 0.1,
  IDENTITY: 0.2,
  MUL: 0.05,
  DIV: 0.05,
  ADD: 0.05,
  SUB: 0.05,
  MOD: 0.05,
  MIN: 0.025,
  MAX: 0.025,
  LOG: 0.025,
  EXP: 0.025,
  POW: 0.05,
  ABS: 0.05,
};

const MAX_DEPTH = 2;

export const randomVectorFieldBySeed = (seed: string) => {
  const randSrc = Seedrandom(seed);
  const {
    randomByWeights,
    random,
    randomInArray,
    randomInArrayByWeights,
  } = randomRangeFactory(randSrc);

  const ops = newArray(100).map((_) =>
    randomInArrayByWeights(
      Object.keys(OP_WEIGHTS),
      Object.keys(OP_WEIGHTS).map((k) => OP_WEIGHTS[k]),
    ),
  );

  return (cord: Cord): Vec2 => {
    let index = 0;
    const applyFunc = (c: Cord, depth = 0): number => {
      const op = ops[index] ?? 'IDENTITY';
      index++;
      if (depth > MAX_DEPTH) {
        return randSrc() < 0.5 ? c[0] : c[1];
      }
      if (op === 'CONSTANT') {
        return random(1, 2, 'int');
      }
      if (op === 'SIN') {
        return Math.sin(applyFunc(c, depth + 1));
      }
      if (op === 'COS') {
        return Math.sin(applyFunc(c, depth + 1));
      }
      if (op === 'LOG') {
        const arg = Math.abs(applyFunc(c, depth + 1));
        return Math.log(arg === 0 ? 1 : arg);
      }
      if (op === 'EXP') {
        return Math.exp(Math.min(applyFunc(c, depth + 1), 5));
      }
      if (op === 'ABS') {
        return Math.abs(applyFunc(c, depth + 1));
      }
      if (op === 'POW') {
        return Math.pow(applyFunc(c, depth + 1), 2);
      }
      if (op === 'MIN') {
        return Math.min(applyFunc(c, depth + 1), applyFunc(c, depth + 1));
      }
      if (op === 'MAX') {
        return Math.max(applyFunc(c, depth + 1), applyFunc(c, depth + 1));
      }
      if (op === 'MUL') {
        return applyFunc(c, depth + 1) * applyFunc(c, depth + 1);
      }
      if (op === 'DIV') {
        const divisor = applyFunc(c, depth + 1);
        return applyFunc(c, depth + 1) / divisor === 0 ? 1 : divisor;
      }
      if (op === 'ADD') {
        return applyFunc(c, depth + 1) + applyFunc(c, depth + 1);
      }
      if (op === 'SUB') {
        return applyFunc(c, depth + 1) - applyFunc(c, depth + 1);
      }
      if (op === 'MOD') {
        const divisor = applyFunc(c, depth + 1);
        return applyFunc(c, depth + 1) % divisor === 0 ? 1 : divisor;
      }

      return randSrc() < 0.5 ? c[0] : c[1];
    };

    return [applyFunc(cord), applyFunc(cord)];
  };
};
