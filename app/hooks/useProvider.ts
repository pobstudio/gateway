import { Web3Provider } from '@ethersproject/providers';
import { useMemo } from 'react';
import { useWeb3React } from '@web3-react/core';

export const useProvider = () => {
  const { library } = useWeb3React<Web3Provider>();

  return useMemo(() => library, [library]);
};
