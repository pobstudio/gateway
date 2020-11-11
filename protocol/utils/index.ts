import { BigNumber } from 'ethers';

export const NETWORK_NAME_CHAIN_ID: { [name: string]: number } = {
  mainnet: 1,
  rinkeby: 4,
  hardhat: 1337,
};

export const ETH_IN_WEI = BigNumber.from('1000000000000000000');
