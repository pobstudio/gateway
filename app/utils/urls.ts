import { deployments } from '@pob/protocol';
import { BigNumber } from 'ethers';
import { CHAIN_ID } from '../constants';
import qs from 'query-string';

export const getOpenSeaUrl = (tokenId: string) => {
  return `https://${CHAIN_ID === 1 ? '' : 'testnets.'}opensea.io/assets/${
    deployments[CHAIN_ID].erc1155
  }/${BigNumber.from(tokenId).toString()}`;
};

export const getEtherscanTxUrl = (txhash: string) => {
  return `https://${CHAIN_ID === 1 ? '' : 'rinkeby.'}etherscan.io/tx/${txhash}`;
};
