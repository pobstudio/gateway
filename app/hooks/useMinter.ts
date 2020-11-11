import { BigNumber, ethers } from 'ethers';
import { useState } from 'react';
import { useEffect } from 'react';
import { useCallback } from 'react';
import { useMemo } from 'react';
import { useWeb3React } from '@web3-react/core';
import { useBlockchainStore } from '../stores/blockchain';
import {
  PRICE_PER_MINT,
  PRICING_CURVE,
  useTokensStore,
} from '../stores/tokens';
import {
  TransactionObject,
  TransactionStatus,
  useTransactionsStore,
} from '../stores/transaction';
import { usePobContract } from './useContracts';
import { useOwnerByHash } from './useOwner';
import { useProvider } from './useProvider';
import { useTransactionResponse } from './useTransaction';
import { useBalance } from './useBalance';

export const PROUD_OWNER_BLOCK_NUM_AGO = 100;
export const MIN_BLOCK_CONFIRMATIONS = 30;
export const MINTING_SLIPPAGE_COUNT = 0;

export type MintingStatus =
  | 'mintable'
  | 'no-more-editions'
  | 'insufficient-balance'
  | 'proud-owner'
  | 'minted'
  | 'too-recent'
  | TransactionStatus;

export const useMinter = (hash?: string) => {
  const { account } = useWeb3React();
  const balance = useBalance();
  const minter = usePobContract();
  const { maxIndex } = useTokensStore();
  const addTransaction = useTransactionsStore((s) => s.addTransaction);
  const transactionMap = useTransactionsStore((s) => s.transactionMap);
  const blockNumber = useBlockchainStore((s) => s.blockNumber);

  const numInProgressTxs = useMemo(() => {
    return Object.values(transactionMap).reduce(
      (a: number, c: TransactionObject) =>
        c.status === 'in-progress' ? a + 1 : a,
      0,
    );
  }, [transactionMap]);

  const adjustedMaxIndex = useMemo(() => maxIndex + 1 + numInProgressTxs, [
    maxIndex,
    numInProgressTxs,
  ]);

  const adjustedCurrentPriceToMintInWei = useMemo(() => {
    return PRICING_CURVE(adjustedMaxIndex);
  }, [adjustedMaxIndex, numInProgressTxs]);

  const [error, setError] = useState<any | undefined>(undefined);
  const [mintingPriceInWei, setMintingPriceinWei] = useState<
    BigNumber | undefined
  >(undefined);
  const [mintingMaxIndex, setMintingMaxIndex] = useState<number | undefined>(
    undefined,
  );

  const mintArtwork = useCallback(async () => {
    if (!account || !minter || !hash) {
      return;
    }
    try {
      const res = await minter?.mint(account as string, hash, {
        value: adjustedCurrentPriceToMintInWei,
      });
      if (!!res) {
        setMintingPriceinWei(adjustedCurrentPriceToMintInWei);
        setMintingMaxIndex(adjustedMaxIndex);
        addTransaction(res.hash, {
          hash,
          attemptedEdition: adjustedMaxIndex,
        });
        setError(undefined);
      }
    } catch (e) {
      console.error(e);
      setError(e);
    }
  }, [
    hash,
    minter,
    adjustedCurrentPriceToMintInWei,
    adjustedMaxIndex,
    account,
  ]);

  const possibleTxs = useMemo(() => {
    const justAddedTxs = Object.values(transactionMap).filter(
      (tx) => !tx.lastBlockNumChecked && tx.metadata.hash === hash,
    );
    const updatedTxs = Object.values(transactionMap)
      .filter((tx) => !!tx.lastBlockNumChecked && tx.metadata.hash === hash)
      .sort(
        (a, b) =>
          (b.lastBlockNumChecked as number) - (a.lastBlockNumChecked as number),
      );
    return [...justAddedTxs, ...updatedTxs];
  }, [transactionMap, hash]);

  const tx = useMemo(() => {
    return possibleTxs[0];
  }, [possibleTxs]);

  const hashTxMetadata = useTransactionResponse(hash);
  const mainnetBlockNumber = useBlockchainStore((s) => s.mainnetBlockNumber);

  const [blockConfirmations, setBlockConfirmations] = useState(0);

  useEffect(() => {
    if (!mainnetBlockNumber) {
      return;
    }
    if (!hashTxMetadata) {
      return;
    }
    setBlockConfirmations(
      mainnetBlockNumber - (hashTxMetadata.blockNumber ?? mainnetBlockNumber),
    );
  }, [hashTxMetadata, mainnetBlockNumber]);

  const isHashConfirmed = useMemo(
    () => blockConfirmations >= MIN_BLOCK_CONFIRMATIONS,
    [blockConfirmations],
  );

  // const isMoreEditionsLeft = useMemo(() => adjustedMaxIndex > 0, [
  //   adjustedMaxIndex,
  // ]);
  const isBalanceEnoughLeft = useMemo(
    () => BigNumber.from(balance).gte(adjustedCurrentPriceToMintInWei),
    [adjustedCurrentPriceToMintInWei, balance],
  );
  const txStatus: TransactionStatus | undefined = useMemo(() => tx?.status, [
    tx,
  ]);

  const isMintable = useMemo(() => {
    return (
      isBalanceEnoughLeft &&
      isHashConfirmed &&
      (txStatus === 'failed' || !txStatus)
    );
  }, [isHashConfirmed, isBalanceEnoughLeft, txStatus]);

  const owner = useOwnerByHash(hash);

  useEffect(() => {
    if (txStatus === 'failed' || txStatus === 'success') {
      setMintingPriceinWei(undefined);
      setMintingMaxIndex(undefined);
    }
  }, [txStatus]);

  const mintingStatus: MintingStatus = useMemo(() => {
    if (!!txStatus) {
      if (!!blockNumber)
        if (
          txStatus === 'success' &&
          owner === account &&
          !!blockNumber &&
          tx &&
          blockNumber - (tx.lastBlockNumChecked ?? 0) <
            PROUD_OWNER_BLOCK_NUM_AGO
        ) {
          return 'proud-owner';
        }
      return txStatus;
    }
    if (error) {
      return 'failed';
    }
    if (owner !== undefined && owner !== null) {
      return 'minted';
    }
    // if (!isMoreEditionsLeft) {
    //   return 'no-more-editions';
    // }
    if (!isBalanceEnoughLeft) {
      return 'insufficient-balance';
    }
    if (!isHashConfirmed) {
      return 'too-recent';
    }
    return 'mintable';
  }, [
    isBalanceEnoughLeft,
    isHashConfirmed,
    txStatus,
    account,
    owner,
    tx,
    blockNumber,
    error,
  ]);

  return useMemo(
    () => ({
      mintingStatus,
      mintArtwork,
      tx,
      mintingPriceInWei,
      mintingMaxIndex,
      adjustedCurrentPriceToMintInWei,
      isMintable,
      adjustedMaxIndex,
      error,
      owner,
      mintingSlippageCount: MINTING_SLIPPAGE_COUNT,
    }),
    [
      mintingPriceInWei,
      mintingStatus,
      mintArtwork,
      tx,
      adjustedCurrentPriceToMintInWei,
      isMintable,
      adjustedMaxIndex,
      error,
      owner,
      mintingMaxIndex,
    ],
  );
};
