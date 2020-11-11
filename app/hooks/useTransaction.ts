import { useEffect } from 'react';
import { useMemo } from 'react';
import { useState } from 'react';
import { useCallback } from 'react';
import { useBlockchainStore } from '../stores/blockchain';
import { useHashesStore } from '../stores/hash';
import { useProvider } from './useProvider';

export const useTransactionResponse = (hash: string | undefined) => {
  const blockNumber = useBlockchainStore((s) => s.blockNumber);
  const provider = useProvider();
  const { hash: hashFromStore, metadata } = useHashesStore(
    useCallback((s) => s.hashMap[hash ?? ''] ?? {}, [hash]),
  );
  const addHash = useHashesStore((s) => s.addHash);
  const updateHashMap = useHashesStore((s) => s.updateHashMap);

  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (!hash) {
      return;
    }
    if (!provider) {
      return;
    }
    if (!!hashFromStore) {
      return;
    }
    if (isFetching) {
      return;
    }
    setIsFetching(true);
    addHash({ hash });
    provider.getTransaction(hash).then((t) => {
      updateHashMap((u) => {
        u[hash].metadata = t;
        u[hash].lastBlockNumChecked = blockNumber; // possibly undefined, not a great solution here
      });
      setIsFetching(false);
    });
  }, [hashFromStore, hash]);

  return useMemo(() => metadata, [metadata]);
};
