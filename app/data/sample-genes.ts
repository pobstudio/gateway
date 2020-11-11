import { GeneWithTxData } from '@pob/sketches';

export const SAMPLE_GENE_1: GeneWithTxData = {
  seed: '0x1b6d3cc31110ec6dc949319d3db8dfecd6328d1a16ea9a14eee093d813b9837c',
  background: {
    color: '#232323',
  },
  foreground: {
    gapSize: 6,
    dotBounds: [0, 6],
    pointilism: 0.0005,
    colorPalletes: [
      {
        color: '#000000',
        tintColors: ['#000000', '#A2F5EB', '#00AE99', '#003831'],
      },
      {
        color: '#f2fc9f',
        tintColors: ['#f2fc9f', '#edbb91', '#da6969', '#b05977'],
      },
    ],
  },
  generateQuarters: {
    vectorFieldPointilism: 1,
    layers: [
      {
        unitSize: [76, 76],
        colorPalleteIndex: 0,
        attemptToReplaceCount: 300,
        pointilism: 0.001,
        minSimplexPruneValue: 0.6,
      },
      {
        unitSize: [152, 152],
        colorPalleteIndex: 1,
        attemptToReplaceCount: 600,
        pointilism: 0.002,
        minSimplexPruneValue: 0.5986,
      },
    ],
  },
  blockNumber: 11467400,
  leadingZeros: 0,
  addresses: [
    '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
    '0xcc5ddc8ccd5b1e90bc42f998ec864ead0090a12b',
    '0xba100000625a3754423978a60c9317c58a424e3d',
    '0x59a19d8c652fa0284f44113d0ff9aba70bd46fb4',
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    '0x22f9dcf4647084d6c31b2765f6910cd85c178c18',
    '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
  ],
  gasPriceInGwei: 100,
  gasUsed: 300028,
  gasLimit: 300028,
  valueInEth: 0,
  nonce: 140,
};
