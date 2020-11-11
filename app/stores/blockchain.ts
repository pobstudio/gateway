import create from 'zustand';
import produce from 'immer';

interface KeyToIsClutterMap {
  [key: string]: boolean;
}

type State = {
  balanceMap: { [address: string]: string };
  blockNumber: number | undefined;
  mainnetBlockNumber: number | undefined;
  setBalance: (address: string, balance: string) => void;
  setBlockNumber: (blockNumber?: number) => void;
  setMainnetBlockNumber: (mainnetBlockNumber?: number) => void;
};

export const useBlockchainStore = create<State>((set) => ({
  balanceMap: {},
  blockNumber: undefined,
  mainnetBlockNumber: undefined,
  setBalance: (address: string, balance: string) => {
    set(
      produce((update) => {
        update.balanceMap[address] = balance;
      }),
    );
  },
  setBlockNumber: (blockNumber?: number) => set({ blockNumber }),
  setMainnetBlockNumber: (mainnetBlockNumber?: number) =>
    set({ mainnetBlockNumber }),
}));
