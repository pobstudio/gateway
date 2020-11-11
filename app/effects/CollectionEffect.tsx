import { ApolloClient, gql, HttpLink, InMemoryCache } from '@apollo/client';
import { AlchemyProvider, JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { useMemo } from 'react';
import { useCallback } from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { FC } from 'react';
import { useMountedState, usePrevious } from 'react-use';
import useSWR from 'swr';
import { useWeb3React } from '@web3-react/core';
import { TOKEN_TYPES, UNISWAP_GRAPH_QL } from '../constants';
import { useAccountCollection } from '../hooks/useAccountCollection';
import { MIN_BLOCK_CONFIRMATIONS } from '../hooks/useMinter';
import { useBlockchainStore } from '../stores/blockchain';
import { useCollectionsStore } from '../stores/collections';
import { TOKEN_SYMBOL, useTokensStore } from '../stores/tokens';
import { fetcher } from '../utils/fetcher';

export const client = new ApolloClient({
  link: new HttpLink({
    uri: UNISWAP_GRAPH_QL,
  }),
  cache: new InMemoryCache(),
});

export const UNISWAP_FRAGMENT = (blockNumber: number, numTx: number) => gql`
  {
    transactions(where: { blockNumber: ${blockNumber} }, first: ${numTx}) {
      id
      blockNumber
      swaps {
        amount0In
        amount1In
        amount0Out
        amount1Out
        pair {
        token0 {
          symbol
        }
        token1 {
          symbol
        }
      }
      }
    }
  }
`;

export const fetchUniswap = async (blockNumber: number, numTx: number) => {
  const data = await client.query({
    query: UNISWAP_FRAGMENT(blockNumber, numTx),
    fetchPolicy: 'cache-first',
  });
  return data;
};

export const CollectionEffect: FC = () => {
  // value scaled back for min block confirmations needed
  const mainnetBlockNumber = useBlockchainStore((s) =>
    !!s.mainnetBlockNumber
      ? s.mainnetBlockNumber - MIN_BLOCK_CONFIRMATIONS
      : undefined,
  );

  const isMounted = useMountedState();
  const updateCollectionHashOrIdMap = useCollectionsStore(
    (s) => s.updateCollectionHashOrIdMap,
  );

  const maxIndex = useTokensStore((s) => s.v2MaxIndex);
  const previousMaxIndex = usePrevious(maxIndex);
  // latest-minted
  useEffect(() => {
    if (!isMounted()) {
      return;
    }
    updateCollectionHashOrIdMap((update) => {
      let tokenIds = [];
      for (let i = previousMaxIndex ?? 0; i < maxIndex; ++i) {
        tokenIds.push(
          BigNumber.from(TOKEN_TYPES[TOKEN_SYMBOL])
            .or(i + 1)
            .toHexString(),
        );
      }
      update['latest-minted'] = tokenIds
        .reverse()
        .concat(update['latest-minted'] ?? []);
    });
  }, [previousMaxIndex, maxIndex]);

  // gas-station
  const gasStationHashOrIds = useCollectionsStore(
    useCallback(
      (state) => state.collectionHashOrIdMap['gas-station'] ?? [],
      [],
    ),
  );
  const gasStationNumTx = useMemo(() => {
    if (gasStationHashOrIds.length > 25) {
      return 2;
    }
    if (gasStationHashOrIds.length > 50) {
      return 1;
    }
    return 4;
  }, [gasStationHashOrIds]);
  const { data: gasStationData } = useSWR(
    useMemo(
      () =>
        `/api/collections?id=gas-station&blockNum=${mainnetBlockNumber}&numTx=${gasStationNumTx}`,
      [mainnetBlockNumber],
    ),
    fetcher,
  );

  useEffect(() => {
    if (!gasStationData) {
      return;
    }
    updateCollectionHashOrIdMap((update) => {
      update['gas-station'] = (update['gas-station'] ?? []).concat(
        gasStationData.hashOrIds,
      );
    });
  }, [gasStationData, updateCollectionHashOrIdMap]);

  // personal
  const { account } = useWeb3React();
  useAccountCollection(account ?? undefined);

  // uniswap
  const uniswapHashOrIds = useCollectionsStore(
    useCallback((state) => state.collectionHashOrIdMap['uniswap'] ?? [], []),
  );
  const uniswapNumTx = useMemo(() => {
    if (uniswapHashOrIds.length > 25) {
      return 2;
    }
    if (uniswapHashOrIds.length > 50) {
      return 1;
    }
    return 4;
  }, [uniswapHashOrIds]);
  const { data: uniswapData } = useSWR(
    useMemo(() => [(mainnetBlockNumber ?? 2) - 2, uniswapNumTx], [
      mainnetBlockNumber,
    ]),
    fetchUniswap,
  );

  useEffect(() => {
    if (!uniswapData) {
      return;
    }
    updateCollectionHashOrIdMap((update) => {
      update['uniswap'] = (update['uniswap'] ?? []).concat(
        uniswapData.data.transactions.map((t: any) => t.id),
      );
    });
  }, [uniswapData, updateCollectionHashOrIdMap]);

  return <></>;
};
