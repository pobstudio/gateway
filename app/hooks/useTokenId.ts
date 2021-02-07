import { useEffect } from 'react';
import { useState } from 'react';
import { TOKEN_TYPES, ZERO } from '../constants';
import { useBlockchainStore } from '../stores/blockchain';
import { TOKEN_SYMBOL } from '../stores/tokens';
import { useTransactionsStore } from '../stores/transaction';

import { usePobContract, usePobContractV1 } from './useContracts';

export const useTokenId = (hash: string | undefined) => {
  const transactionMap = useTransactionsStore((s) => s.transactionMap);
  const blockNumber = useBlockchainStore((s) => s.blockNumber);
  const minter = usePobContract();
  const minterV1 = usePobContractV1();
  const [tokenId, setTokenId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!hash) {
      return;
    }

    minter?.txHashToTokenId(hash).then((h) => {
      if (h.eq(ZERO)) {
        minterV1?.txHashToTokenId(hash).then((h) => {
          setTokenId(h.toHexString());
        });
      } else {
        setTokenId(h.toHexString());
      }
    });
  }, [blockNumber, minter, hash, transactionMap]);

  return tokenId;
};
