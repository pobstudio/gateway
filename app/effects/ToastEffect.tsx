import { useEffect, FC } from 'react';
import { useBlockchainStore } from '../stores/blockchain';
import { MAX_TOAST_LIFE, useToastsStore } from '../stores/toasts';
import { useMountedState } from 'react-use';

export const ToastsEffect: FC = () => {
  const blockNumber = useBlockchainStore((s) => s.blockNumber);
  const isMounted = useMountedState();
  const toastMap = useToastsStore((s) => s.toastMap);
  const dismissToast = useToastsStore((s) => s.dismissToast);

  useEffect(() => {
    if (!isMounted() || !blockNumber) {
      return;
    }

    Object.values(toastMap).forEach((t) => {
      if (
        !t.isDismissed &&
        t.blockAdded !== -1 &&
        blockNumber - t.blockAdded >= MAX_TOAST_LIFE
      ) {
        dismissToast(t.id);
      }
    });
  }, [blockNumber]);

  return <></>;
};
