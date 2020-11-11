import { useWeb3React } from '@web3-react/core';
import { useState, useEffect } from 'react';
import { useProvider } from './useProvider';

export const useENSLookup = (address?: string) => {
  const provider = useProvider();
  const [ensName, setEnsName] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!address) {
      return;
    }
    if (!provider) {
      return;
    }
    provider.lookupAddress(address).then(setEnsName);
  }, [provider, setEnsName, address]);

  return ensName;
};
