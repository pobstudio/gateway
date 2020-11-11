import create from 'zustand';
import produce from 'immer';
import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/providers';
import { useToastsStore } from './toasts';

export interface HashObject {
  hash: string;
  metadata?: TransactionResponse;
  receipt?: TransactionReceipt;
  lastBlockNumChecked?: number;
}

export type HashMap = { [hash: string]: HashObject };

type State = {
  hashMap: HashMap;
  updateHashMap: (updateFn: (update: any) => void) => void;
  addHash: (hashObject: HashObject) => void;
};

export const useHashesStore = create<State>((set, get) => ({
  hashMap: {},
  updateHashMap: (updateFn: (update: any) => void) => {
    set(
      produce((update) => {
        updateFn(update.hashMap);
      }),
    );
  },
  addHash: (hashObject: HashObject) => {
    get().updateHashMap((u) => {
      u[hashObject.hash] = hashObject as HashObject;
    });
  },
}));
