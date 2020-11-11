import { useEffect } from 'react';
import { useState } from 'react';
import { useBlockchainStore } from '../stores/blockchain';
import { NULL_ADDRESS, ZERO } from '../constants';

import { useErc1155Contract, usePobContract } from './useContracts';
import { useTokenId } from './useTokenId';
import { useTransactionsStore } from '../stores/transaction';

export const useOwnerByTokenId = (tokenId: string | undefined) => {
  const transactionMap = useTransactionsStore((s) => s.transactionMap);
  const blockNumber = useBlockchainStore((s) => s.blockNumber);
  const erc1155 = useErc1155Contract();
  const [owner, setOwner] = useState<string | undefined | null>(undefined);

  useEffect(() => {
    if (!tokenId) {
      return;
    }

    erc1155?.ownerOf(tokenId).then((v) => {
      if (v !== NULL_ADDRESS) {
        setOwner(v);
      } else {
        setOwner(null);
      }
    });
  }, [blockNumber, erc1155, tokenId, transactionMap]);
  return owner;
};

export const useOwnerByHash = (hash: string | undefined) => {
  const tokenId = useTokenId(hash);
  return useOwnerByTokenId(tokenId);
};
