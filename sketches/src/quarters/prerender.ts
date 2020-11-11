import { Bound, Cord, Rect, Vec2 } from '../types';
import seedrandom from 'seedrandom';
import SimplexNoise from 'simplex-noise';

import { randomRangeFactory } from '../utils/random';
import { newArray } from '../utils';

import { chain } from 'lodash';
import findIndex from 'lodash/findIndex';

import { isRectInRect, rectToBounds, rectToCorners } from '../utils/primitives';
import {
  applyVec2,
  addVec2,
  subVec2,
  divVec2,
  mulVec2,
  lenVec2,
  dotMulVec2,
  normVec2,
} from '../utils/vector';
import { randomVectorFieldBySeed } from './vector';
import { getCyclicIndex } from '../utils/cyclic';
import { DEFAULT_GENE, EllipseQuartersProps, Gene, Layer } from './types';

export const prerender = (
  sketchContext: any,
  gene: Gene = DEFAULT_GENE,
): EllipseQuartersProps[][] => {
  const rand = seedrandom(gene.seed);
  const simplex = new SimplexNoise(gene.seed);
  const { random } = randomRangeFactory(rand);
  // set depth

  const {
    foreground,
    generateQuarters,
    vectorFieldFunc: maybeVectorFieldFunc,
  } = gene;

  const vectorFieldFunc =
    maybeVectorFieldFunc ?? randomVectorFieldBySeed(gene.seed);

  const sketchBounds: Bound = [sketchContext.width, sketchContext.height];

  const getCornerAndFluxForRect = (rect: Rect): [number, number] => {
    const dimensions = rectToBounds(rect);
    const corners = rectToCorners(rect);
    const radius = Math.min(...dimensions);
    let accFlux = [0, 0, 0, 0];
    for (let r = 0; r <= Math.PI / 2 + Math.PI / 180; r += Math.PI / 4) {
      const posCandidates = [
        addVec2([radius * Math.cos(r), radius * Math.sin(r)], rect[0]),
        addVec2(
          [dimensions[0] - radius * Math.cos(r), radius * Math.sin(r)],
          rect[0],
        ),
        addVec2(
          [radius * Math.cos(r), dimensions[1] - radius * Math.sin(r)],
          rect[0],
        ),
        addVec2(
          [
            dimensions[0] - radius * Math.cos(r),
            dimensions[1] - radius * Math.sin(r),
          ],
          rect[0],
        ),
      ];
      const normals = posCandidates.map((p: Cord, i: number) => {
        const field = vectorFieldFunc(p);
        return Math.abs(dotMulVec2(normVec2(subVec2(p, corners[i])), field));
      });
      accFlux = accFlux.map((a, i) => a + normals[i]);
    }
    const minFlux = Math.min(...accFlux);
    const cornerIndex = findIndex(accFlux, (a) => a === minFlux);
    return [cornerIndex, minFlux];
  };

  const generateVectorFieldQuarters = (layer: Layer, layerIndex: number) => {
    const simplexCoeff: Vec2 = [rand(), rand()];

    const unitGridBounds = applyVec2(divVec2(sketchBounds, layer.unitSize), [
      Math.floor,
      Math.floor,
    ]);

    const quartersIndexMap = newArray(unitGridBounds[0]).map((_) =>
      newArray(unitGridBounds[1], -1),
    );

    const quarters: EllipseQuartersProps[] = [];
    // fill grid
    for (let i = 0; i < unitGridBounds[0]; ++i) {
      for (let j = 0; j < unitGridBounds[1]; ++j) {
        const topLeft = mulVec2([i, j], layer.unitSize);
        const bottomRight = addVec2(topLeft, layer.unitSize);
        const rect: Rect = [topLeft, bottomRight];
        const [corner] = getCornerAndFluxForRect(rect);
        const quarterIndex =
          quarters.push({
            rect,
            corner,
            colorPallete: foreground.colorPalletes[layer.colorPalleteIndex],
            layer: layerIndex,
          }) - 1;
        quartersIndexMap[i][j] = quarterIndex;
      }
    }

    const replaceQuartersInGrid = (quarter: EllipseQuartersProps) => {
      const quarterIndex = quarters.push({ ...quarter }) - 1;
      const unitRect = [
        divVec2(quarter.rect[0], layer.unitSize),
        divVec2(quarter.rect[1], layer.unitSize),
      ];
      const rectBounds = rectToBounds(quarter.rect);
      const corner = rectToCorners(quarter.rect)[quarter.corner];
      const radius = Math.min(...rectBounds);

      for (let i = unitRect[0][0]; i < unitRect[1][0]; ++i) {
        for (let j = unitRect[0][1]; j < unitRect[1][1]; ++j) {
          const maybeReplacedQuarter = quarters[quartersIndexMap[i][j]];
          if (
            !!maybeReplacedQuarter &&
            !isRectInRect(quarter.rect, maybeReplacedQuarter.rect)
          ) {
            return;
          }
        }
      }

      for (let i = unitRect[0][0]; i < unitRect[1][0]; ++i) {
        for (let j = unitRect[0][1]; j < unitRect[1][1]; ++j) {
          const maybeReplacedQuarter = quarters[quartersIndexMap[i][j]];
          const corners = rectToCorners(maybeReplacedQuarter.rect);
          const checkableCornerIndexes = [
            getCyclicIndex(maybeReplacedQuarter.corner - 1, 4),
            getCyclicIndex(maybeReplacedQuarter.corner + 1, 4),
            getCyclicIndex(maybeReplacedQuarter.corner + 2, 4),
          ].concat(
            maybeReplacedQuarter.corner === quarter.corner
              ? [maybeReplacedQuarter.corner]
              : [],
          );

          const isCheckableCornerInQuarter = chain(checkableCornerIndexes)
            .map((i) => corners[i])
            .some((c) => lenVec2(subVec2(c, corner)) < radius)
            .value();

          if (isCheckableCornerInQuarter) {
            quartersIndexMap[i][j] = quarterIndex;
          }
        }
      }
    };

    const attemptToReplaceQuartersInGrid = (rect: Rect) => {
      const [cornerIndex, flux] = getCornerAndFluxForRect(rect);
      const unitRect: Rect = [
        divVec2(rect[0], layer.unitSize),
        divVec2(rect[1], layer.unitSize),
      ];
      const rectBounds = rectToBounds(rect);

      if (
        (rectBounds[0] === layer.unitSize[0] &&
          rectBounds[1] === layer.unitSize[1]) ||
        (rectBounds[0] === 0 && rectBounds[1] === 0)
      ) {
        return;
      }

      for (let i = unitRect[0][0]; i < unitRect[1][0]; ++i) {
        for (let j = unitRect[0][1]; j < unitRect[1][1]; ++j) {
          const maybeReplacedQuarter = quarters[quartersIndexMap[i][j]];
          if (maybeReplacedQuarter.corner !== cornerIndex) {
            return;
          }
        }
      }
      replaceQuartersInGrid({
        rect,
        corner: cornerIndex,
        colorPallete: foreground.colorPalletes[layer.colorPalleteIndex],
        layer: layerIndex,
      });
    };

    // attempt to replace quarters
    for (let i = 0; i < layer.attemptToReplaceCount; ++i) {
      const topLeft = applyVec2(
        [random(0, sketchBounds[0], 'int'), random(0, sketchBounds[1], 'int')],
        [
          (n) => Math.floor(n / layer.unitSize[0]) * layer.unitSize[0],
          (n) => Math.floor(n / layer.unitSize[1]) * layer.unitSize[1],
        ],
      );
      const rectLength = random(
        0,
        Math.min(
          Math.min(...subVec2(sketchBounds, topLeft)),
          6 * Math.min(...layer.unitSize),
        ),
      );
      const bottomRight = applyVec2(
        addVec2(topLeft, [rectLength, rectLength]),
        [
          (n) => Math.floor(n / layer.unitSize[0]) * layer.unitSize[0],
          (n) => Math.floor(n / layer.unitSize[1]) * layer.unitSize[1],
        ],
      );

      const rect: Rect = [topLeft, bottomRight];

      attemptToReplaceQuartersInGrid(rect);
    }
    return chain(quartersIndexMap)
      .flatten()
      .uniq()
      .map((i) => quarters[i])
      .filter((q) => {
        return (
          !!q &&
          Math.abs(
            simplex.noise2D(
              ...mulVec2(mulVec2(q.rect[0], simplexCoeff), [
                layer.pointilism,
                layer.pointilism,
              ]),
            ),
          ) < layer.minSimplexPruneValue
        );
      })
      .value();
  };

  return generateQuarters.layers.map((l, i) => {
    return generateVectorFieldQuarters(l, i);
  });
};
