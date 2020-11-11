import { chain } from 'lodash';
import { useEffect } from 'react';
import { FC } from 'react';
import { useWeb3React, UnsupportedChainIdError } from '@web3-react/core';
import { CHAIN_ID } from '../constants';
import { CHAIN_UNSUPPORTED_STATUS_TEXT } from '../data/status';
import { useBlockchainStore } from '../stores/blockchain';
import { useToastsStore } from '../stores/toasts';

// TODO make this more responsive chainId doesn't change to provider
export const WalletEffect: FC = () => {
  const { account, connector, error, chainId } = useWeb3React();
  const addStatusToast = useToastsStore((s) => s.addStatusToast);
  const dismissToast = useToastsStore((s) => s.dismissToast);

  const blockNum = useBlockchainStore((s) => s.blockNumber);

  useEffect(() => {
    if (error instanceof UnsupportedChainIdError || CHAIN_ID !== chainId) {
      addStatusToast('chain-unsupported', blockNum ?? -1, {
        text: CHAIN_UNSUPPORTED_STATUS_TEXT,
      });
    }
    if (!error) {
      dismissToast('chain-unsupported');
    }
  }, [error, chainId]);
  return <></>;
};
