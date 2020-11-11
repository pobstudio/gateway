import { BigNumber } from 'ethers';
import { PREVIOUS_TOKEN_TYPE_MAX_INDEX, TOKEN_TYPES } from '../constants';
import { TOKEN_SYMBOL } from '../stores/tokens';

export const getEditionFromTokenId = (tokenId: string) => {
  return (
    parseInt(tokenId.slice(34), 16) +
    (TOKEN_TYPES[TOKEN_SYMBOL].slice(0, 34) === tokenId.slice(0, 34)
      ? PREVIOUS_TOKEN_TYPE_MAX_INDEX
      : 0)
  );
};
