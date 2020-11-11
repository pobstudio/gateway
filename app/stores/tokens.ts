import { BigNumber, ethers } from 'ethers';
import create from 'zustand';
import { PREVIOUS_TOKEN_TYPE_MAX_INDEX } from '../constants';

type State = {
  // tokensLeft: number;
  maxIndex: number;
  v2MaxIndex: number;
  currentPriceToMintInWei: string;
  setMaxIndex: (maxIndex: number) => void;
};

//Token settings are designed to mimic as if POBMinterV2 is engaged and on top of V1
export const STARTING_PRICE = ethers.utils.parseEther('0.05');
export const FORMATTED_STARTING_PRICE = ethers.utils.formatEther(
  STARTING_PRICE,
);
export const PRICE_PER_MINT = ethers.utils.parseEther('0.001');
export const FORMATTED_PRICE_PER_MINT = ethers.utils.formatEther(
  PRICE_PER_MINT,
);

export const TOKEN_SYMBOL = '$HASH';

export const FLAT_PRICE_UP_TO = 1000;

export const PRICING_CURVE = (index: number) => {
  if (index <= FLAT_PRICE_UP_TO) {
    return STARTING_PRICE;
  } else {
    return PRICE_PER_MINT.mul(index - FLAT_PRICE_UP_TO).add(STARTING_PRICE);
  }
};

export const useTokensStore = create<State>((set, get) => ({
  // tokensLeft: MAX_TOKEN_SUPPLY,
  currentPriceToMintInWei: '0',
  maxIndex: 0,
  v2MaxIndex: 0,
  setMaxIndex: (maxIndex: number) =>
    set({
      v2MaxIndex: maxIndex,
      maxIndex: maxIndex + PREVIOUS_TOKEN_TYPE_MAX_INDEX,
      currentPriceToMintInWei: PRICING_CURVE(maxIndex).toString(),
    }),
}));
