import { PREVIOUS_TOKEN_TYPE_MAX_INDEX, TOKEN_TYPES } from '../constants';
import { useEffect, useMemo } from 'react';
import { useBlockchainStore } from '../stores/blockchain';
import { useState, FC } from 'react';
import { TOKEN_SYMBOL, useTokensStore } from '../stores/tokens';
import { useMountedState } from 'react-use';
import { useErc1155Contract } from '../hooks/useContracts';
import { useTransactionsStore } from '../stores/transaction';

export const TokenStatsEffect: FC = () => {
  const transactionMap = useTransactionsStore((s) => s.transactionMap);
  const blockNumber = useBlockchainStore((s) => s.blockNumber);
  const isMounted = useMountedState();

  const erc1155 = useErc1155Contract();

  const setMaxIndex = useTokensStore((s) => s.setMaxIndex);

  useEffect(() => {
    if (!isMounted() && !erc1155) {
      return;
    }

    erc1155?.maxIndex(TOKEN_TYPES[TOKEN_SYMBOL]).then((maxIndex) => {
      setMaxIndex(maxIndex.toNumber());
    });
  }, [transactionMap, blockNumber]);

  return <></>;
};
