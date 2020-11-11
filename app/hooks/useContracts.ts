import { deployments, ERC1155MintableFactory } from '@pob/protocol';
import { POBMinterFactory } from '@pob/protocol';
import { useMemo } from 'react';
import { CHAIN_ID } from '../constants';
import { getProviderOrSigner } from '../utils/provider';
import { JsonRpcProvider } from '@ethersproject/providers';
import { useProvider } from './useProvider';
import { useWeb3React } from '@web3-react/core';

// TODO is this how we want to handle no accounts?
export const usePobContract = () => {
  const { account } = useWeb3React();
  const provider = useProvider();

  return useMemo(() => {
    if (!account && !provider) {
      return;
    }

    return POBMinterFactory.connect(
      deployments[CHAIN_ID].pobMinterV2,
      getProviderOrSigner(provider as JsonRpcProvider, account as string),
    );
  }, [account, provider]);
};

export const usePobContractV1 = () => {
  const { account } = useWeb3React();
  const provider = useProvider();

  return useMemo(() => {
    if (!account && !provider) {
      return;
    }

    return POBMinterFactory.connect(
      deployments[CHAIN_ID].pobMinter,
      getProviderOrSigner(provider as JsonRpcProvider, account as string),
    );
  }, [account, provider]);
};

export const useErc1155Contract = () => {
  const { account } = useWeb3React();
  const provider = useProvider();

  return useMemo(() => {
    if (!account && !provider) {
      return;
    }

    return ERC1155MintableFactory.connect(
      deployments[CHAIN_ID].erc1155,
      getProviderOrSigner(provider as JsonRpcProvider, account as string),
    );
  }, [account, provider]);
};
