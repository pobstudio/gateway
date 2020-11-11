import { Web3Provider } from '@ethersproject/providers';
import { useMemo } from 'react';
import { useWallet } from 'use-wallet';

export const useProvider = () => {
  const { ethereum } = useWallet<any>();
  const provider = useMemo(() => {
    if (!ethereum) {
      return undefined;
    }
    return new Web3Provider(ethereum);
  }, [ethereum]);

  return useMemo(() => provider, [provider]);
};
