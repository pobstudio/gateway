import { useEffect } from 'react';
import { FC } from 'react';
import { useMountedState } from 'react-use';
import { CHAIN_ID } from '../constants';
import { useProvider } from '../hooks/useProvider';
import { useBlockchainStore } from '../stores/blockchain';

// TODO(dave4506)
export const BlockchainEffect: FC = () => {
  const setBlockNumber = useBlockchainStore((s) => s.setBlockNumber);
  const setMainnetBlockNumber = useBlockchainStore(
    (s) => s.setMainnetBlockNumber,
  );
  const blockNumber = useBlockchainStore((s) => s.blockNumber);

  const provider = useProvider();
  const isMounted = useMountedState();

  useEffect(() => {
    if (!isMounted() || !provider) {
      return;
    }

    let stale = false;

    // set initial value
    provider.getBlockNumber().then((blockNum: number) => {
      if (!stale) {
        setBlockNumber(blockNum);
      }
    });

    provider.on('block', (blockNum: number) => {
      if (stale) {
      }
      setBlockNumber(blockNum);
    });

    // remove listener when the component is unmounted
    return () => {
      provider.removeAllListeners('block');
      setBlockNumber(undefined);
      stale = true;
    };
  }, [provider, isMounted, setBlockNumber]);

  useEffect(() => {
    if (CHAIN_ID !== 1) {
      return;
    }
    setMainnetBlockNumber(blockNumber);
  }, [setMainnetBlockNumber, blockNumber]);

  return <></>;
};
