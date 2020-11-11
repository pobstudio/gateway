import { Provider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import countBy from 'lodash/countBy';
import seedrandom from 'seedrandom';
import { Bound } from '../types';
import { lerp, newArray } from '../utils';
import { randomRangeFactory } from '../utils/random';
import { ColorPallete, Gene, GeneWithTxData, Layer } from './types';
import colors from '../data/colors.json';
import theme from '../data/theme.json';

import { labelValueWithRanges } from '../utils/labeler';

const getNumLeadingZeros = (str: string): number => {
  if (str.length === 0) {
    return 0;
  }
  return str[0] === '0' ? 1 + getNumLeadingZeros(str.slice(1)) : 0;
};

const GWEI = BigNumber.from('1000000000');
const ETH = BigNumber.from('1000000000000000000');
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

// contains the min and max of each parameter
const GENE_BOUNDS = {
  gapSize: [10, 6],
  dotBounds: [8, 6],
  pointilism: [0.0005, 0.05],
  unitSizeCoeff: [60, 220],
  maxValueInEth: 100,
  maxGasPriceInGwei: 1000,
  maxNonce: 40000,
  maxAttemptToReplaceCount: 10000,
  valueInEthCoeff: 300,
  layersPointilismCoeff: 0.001,
};

export const generateGeneFromTxData = async (
  txData: any,
  offset: number = 0,
): Promise<GeneWithTxData> => {
  // gas used / gas limit
  const gasUsed = txData.gasUsed.toNumber();
  const gasLimit = txData.gasLimit.toNumber();
  const gapSize = Math.round(
    lerp(GENE_BOUNDS.gapSize[0], GENE_BOUNDS.gapSize[1], gasUsed / gasLimit),
  );

  const dotBounds: Bound = [
    0,
    Math.round(
      lerp(
        GENE_BOUNDS.dotBounds[0],
        GENE_BOUNDS.dotBounds[1],
        gasUsed / gasLimit,
      ),
    ),
  ];

  // value / constant
  const valueInEth = txData.value.div(ETH).toNumber();
  const pointilism = lerp(
    GENE_BOUNDS.pointilism[0],
    GENE_BOUNDS.pointilism[1],
    Math.min(valueInEth / GENE_BOUNDS.maxValueInEth, 1),
  );

  // gas price / constant
  const gasPriceInGwei = txData.gasPrice.div(GWEI).toNumber();
  const unitSizeCoeff = Math.floor(
    lerp(
      GENE_BOUNDS.unitSizeCoeff[0],
      GENE_BOUNDS.unitSizeCoeff[1],
      Math.min(gasPriceInGwei / GENE_BOUNDS.maxGasPriceInGwei, 1),
    ),
  );

  // nonce * constant
  const nonce = txData.nonce;
  const addressHistoMap = countBy(txData.logs, (l) => l.address.toLowerCase());
  let histo = [
    txData.to ?? txData.contractAddress ?? NULL_ADDRESS,
    txData.from,
    ...Object.keys(addressHistoMap).sort(
      (a, b) => addressHistoMap[b] - addressHistoMap[a],
    ),
  ].map((a) => a.toLowerCase());

  const leadingZeros = getNumLeadingZeros(txData.hash.slice(2));
  // num leading zeros
  const layersCount = Math.min(leadingZeros + 2, histo.length);

  const colorPalletes: ColorPallete[] = histo
    .slice(0, layersCount)
    .map((address) => {
      const rand = seedrandom(address);
      const { randomInArray } = randomRangeFactory(rand);
      const tintColorsIndex = randomInArray(Object.keys(colors));
      const tintColors = !!(theme as any)[address as string]
        ? (theme as any)[address as string].colors
        : (colors[tintColorsIndex] as [string, string, string, string]);
      return {
        color: tintColors[0],
        tintColors,
      };
    });

  const layers: Layer[] = newArray(layersCount).map((_: any, i: number) => {
    return {
      unitSize: [unitSizeCoeff * (1 + i), unitSizeCoeff * (1 + i)],
      colorPalleteIndex: i,
      attemptToReplaceCount: Math.min(
        (i + 1) * (valueInEth + 1) * GENE_BOUNDS.valueInEthCoeff,
        GENE_BOUNDS.maxAttemptToReplaceCount,
      ),
      pointilism: GENE_BOUNDS.layersPointilismCoeff * (i + 1),
      minSimplexPruneValue: lerp(
        0.6,
        0.2,
        Math.min(i * Math.min(nonce / GENE_BOUNDS.maxNonce, 1), 1),
      ),
    };
  });

  return {
    seed: txData.hash,
    background: {
      color: '#232323',
    },
    foreground: {
      gapSize,
      dotBounds,
      pointilism,
      colorPalletes,
    },
    generateQuarters: {
      vectorFieldPointilism: 1,
      layers,
    },
    // txData,
    blockNumber: txData.blockNumber,
    leadingZeros,
    addresses: histo,
    gasPriceInGwei,
    gasUsed,
    gasLimit,
    valueInEth,
    nonce: txData.nonce,
  };
};

export const getTxDataFromProvider = async (
  provider: Provider,
  txHash: string,
) => {
  const response = await provider.getTransaction(txHash);
  const receipt = await provider.getTransactionReceipt(txHash);

  if (!response || !receipt) {
    throw new Error('txHash is not found on Ethereum mainnet');
  }

  return {
    ...response,
    ...receipt,
  };
};

export const generateGeneFromTxHash = async (
  provider: Provider,
  txHash: string,
  offset: number = 0,
): Promise<GeneWithTxData> => {
  const txData = await getTxDataFromProvider(provider, txHash);
  return generateGeneFromTxData(txData, offset);
};

export const generateColorPalleteFromAddress = (address: string) => {
  const lowerCasedAddress = address.toLowerCase();
  const rand = seedrandom(lowerCasedAddress);
  const { randomInArray } = randomRangeFactory(rand);
  const tintColorsIndex = randomInArray(Object.keys(colors));
  const tintColors = !!(theme as any)[lowerCasedAddress as string]
    ? (theme as any)[lowerCasedAddress as string].colors
    : (colors[tintColorsIndex] as [string, string, string, string]);
  return {
    colors: tintColors,
    palleteIndex: !!(theme as any)[lowerCasedAddress as string]
      ? -1
      : tintColorsIndex,
  };
};

export const generateTokenAttributesFromGene = (gene: GeneWithTxData) => {
  const textureValue =
    (gene.foreground.gapSize - GENE_BOUNDS.gapSize[1]) /
    (GENE_BOUNDS.gapSize[0] - GENE_BOUNDS.gapSize[1]);
  const textureAttribute = {
    name: 'Texture',
    value: textureValue,
    display_value: labelValueWithRanges(
      [0.25, 0.5, 0.75, 1],
      ['smooth', 'coarse', 'comic', 'fine'],
      textureValue,
    ),
  };

  const unitSizeCoeff = gene.generateQuarters.layers[0].unitSize[0];

  const quartersGridValue =
    (unitSizeCoeff - GENE_BOUNDS.unitSizeCoeff[0]) /
    (GENE_BOUNDS.unitSizeCoeff[1] - GENE_BOUNDS.unitSizeCoeff[0]);

  const quartersGridAttribute = {
    name: 'Quarters Grid',
    value: unitSizeCoeff,
    display_value: labelValueWithRanges(
      [0.33, 0.66, 1],
      ['small', 'medium', 'large'],
      quartersGridValue,
    ),
  };

  const ethValue =
    (gene.foreground.pointilism - GENE_BOUNDS.pointilism[0]) /
    (GENE_BOUNDS.pointilism[1] - GENE_BOUNDS.pointilism[0]);

  const sizeAttribute = {
    name: 'Size Diversity',
    value: ethValue,
    display_value: labelValueWithRanges(
      [0.1, 0.4, 0.8, 1],
      ['low', 'medium', 'high', 'unique'],
      ethValue,
    ),
  };

  const palletesAttribute = {
    name: 'Colorways',
    value: gene.foreground.colorPalletes.length,
    display_value: gene.foreground.colorPalletes.length,
  };

  const complexityAttribute = {
    name: 'Complexity',
    value: gene.nonce,
    display_value: labelValueWithRanges(
      [10, 50, 250, 500],
      ['low', 'medium', 'high', 'unique'],
      gene.nonce,
    ),
  };

  return {
    texture: textureAttribute,
    complexity: complexityAttribute,
    quarters: quartersGridAttribute,
    colorways: palletesAttribute,
    size: sizeAttribute,
  };
};
