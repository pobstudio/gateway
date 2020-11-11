import { Bound, Cord, Rect, Vec2 } from '../types';

export const PPI = 300;
export const DIMENSIONS = [PPI * 5, PPI * 8];

export interface ColorPallete {
  color: string;
  tintColors: [string, string, string, string];
}

export interface Layer {
  unitSize: Bound;
  attemptToReplaceCount: number;
  colorPalleteIndex: number;
  pointilism: number;
  minSimplexPruneValue: number;
}

export interface EllipseQuartersProps {
  rect: Rect;
  corner: number;
  colorPallete: ColorPallete;
  layer: number;
}

//Gene type all visual elements are in pixels unless specified
export interface Gene {
  seed: string;
  vectorFieldFunc?: (cord: Cord) => Vec2;
  foreground: {
    colorPalletes: ColorPallete[];
    gapSize: number;
    pointilism: number;
    dotBounds: Bound;
  };
  background: {
    color: string;
  };
  generateQuarters: {
    vectorFieldPointilism: number;
    layers: Layer[];
  };
}

export interface GeneWithTxData extends Gene {
  blockNumber: number;
  leadingZeros: number;
  addresses: string[];
  gasPriceInGwei: number;
  gasUsed: number;
  gasLimit: number;
  valueInEth: number;
  nonce: number;
}

export const DEFAULT_GENE: Gene = {
  seed: '1',
  // vectorFieldFunc: (cord) => [Math.sin(cord[0]), Math.cos(cord[1])],
  background: {
    color: '#232323',
  },
  foreground: {
    gapSize: 8,
    pointilism: 0.002,
    dotBounds: [0, 8],
    colorPalletes: [
      {
        color: '#515070',
        tintColors: ['#515070', '#ff8e6e', '#ffbb91', '#f6f6f6'],
      },
      {
        color: '#7579e7',
        tintColors: ['#7579e7', '#9ab3f5', '#a3d8f4', '#b9fffc'],
      },
      {
        color: '#3797a4',
        tintColors: ['#3797a4', '#8bcdcd', '#cee397', '#fcf876'],
      },
      {
        color: '#f9f7cf',
        tintColors: ['#f9f7cf', '#f2dcbb', '#bbbbbb', '#aaaaaa'],
      },
    ],
  },
  generateQuarters: {
    vectorFieldPointilism: 0.02,
    layers: [
      {
        unitSize: [100, 100],
        attemptToReplaceCount: 200,
        colorPalleteIndex: 0,
        pointilism: 0.001,
        minSimplexPruneValue: 0.7,
      },
      {
        unitSize: [200, 200],
        attemptToReplaceCount: 200,
        colorPalleteIndex: 1,
        pointilism: 0.001,
        minSimplexPruneValue: 0.6,
      },
      // {
      //   unitSize: [30, 30],
      //   attemptToReplaceCount: 5000,
      //   colorPalleteIndex: 3,
      //   pointilism: 0.001,
      //   minSimplexPruneValue: 0.05,
      // },
    ],
  },
};
