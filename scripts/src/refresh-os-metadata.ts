import { BigNumber } from 'ethers';
import { deployments } from '@pob/protocol';
import fetch from 'isomorphic-fetch';

const CHAIN_ID = 1;
const CURRENT_MAX_INDEX = 243;
const HASH_V1_MAX_INDEX = 55;

const HASH_V1_TOKEN_TYPE =
  '0x8000000000000000000000000000000100000000000000000000000000000000';
const HASH_V2_TOKEN_TYPE =
  '0x8000000000000000000000000000000200000000000000000000000000000000';

const OPENSEA_URL = (id: string) =>
  `https://api.opensea.io/api/v1/asset/${deployments[CHAIN_ID].erc1155}/${id}?force_update=true`;

const getTokenId = (index: number) => {
  if (index <= HASH_V1_MAX_INDEX) {
    return BigNumber.from(HASH_V1_TOKEN_TYPE).or(index);
  } else {
    return BigNumber.from(HASH_V2_TOKEN_TYPE).or(index - HASH_V1_MAX_INDEX);
  }
};

const refreshOsMetadata = async () => {
  for (let i = CURRENT_MAX_INDEX; i > 0; i--) {
    const tokenId = getTokenId(i);
    const url = OPENSEA_URL(tokenId.toString());
    console.log(`${i} updating metadata for: ${tokenId.toString()}`);
    const res = await fetch(url);
    if (res.ok) {
      console.log('response good');
    }
  }
};

refreshOsMetadata();
