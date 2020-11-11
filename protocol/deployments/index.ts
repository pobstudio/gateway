import { Deployments, TokenType, TokenTypeMaps } from './types';

export const deployments: Deployments = {
  1: {
    erc1155: '0xE18a32192ED95b0FE9D70D19e5025f103475d7BA',
    whitelistProxy: '0xaeb18fB50e9fb01c79e40fB4D3f3633c7339d2E0',
    pobMinter: '0x31732da9A5e498dAc53Df670db9aa9e7aeb2C3ec',
    pobMinterV2: '0xCe0684441bDB6c9B3E27Fa4b5947393cD547fD67',
    rejectingTreasury: '0xd390CbD3208d375ae36E3596fAdDf2f2343D41C6',
    process:
      '0x47285cae75d706408f13e9c4491c3a8cc6e684d4790514c72a4209095522df51',
  },
  4: {
    erc1155: '0x06ae4A4D1ec3E5e560688b2C2eEff8F91Ab96D3C',
    whitelistProxy: '0x7d6bA0dca62bF7F8aA8B6fd76eDae67256C1f067',
    pobMinter: '0xD3fFf665c04398F9f291812B3C1A28c835E10841',
    pobMinterV2: '0x10f3345be9FCe68BF047A9ECb24a45bdDfD64661',
    rejectingTreasury: '0x0',
    process:
      '0x3dfe08d27c680ebcc7d1137d9daf0839d1a883a09f9be4f426aea5d2c5bc93a7',
  },
};

export const tokenTypeMaps: TokenTypeMaps = {
  1: {
    '0x8000000000000000000000000000000100000000000000000000000000000000': {
      isNf: true,
    }, // V1 $HASH
    '0x8000000000000000000000000000000200000000000000000000000000000000': {
      isNf: true,
    }, // V2 $HASH
  },
  4: {
    '0x8000000000000000000000000000000100000000000000000000000000000000': {
      isNf: true,
    },
    '0x8000000000000000000000000000000600000000000000000000000000000000': {
      isNf: true,
    }, // V2 $HASH
  },
};
