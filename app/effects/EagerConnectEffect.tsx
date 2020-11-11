import { useState } from 'react';
import { useEffect } from 'react';
import { FC } from 'react';
import { useMountedState } from 'react-use';
import { isMobile } from 'react-device-detect';
import { InjectedConnector } from '@web3-react/injected-connector';
import { CHAIN_ID } from '../constants';
import { useToastsStore } from '../stores/toasts';
import { UnsupportedChainIdError } from '@web3-react/core';
import { CHAIN_UNSUPPORTED_STATUS_TEXT } from '../data/status';
import { useWeb3React } from '@web3-react/core';
import { injected } from '../connectors';

export function useEagerConnect() {
  const [tried, setTried] = useState(false);
  const isMounted = useMountedState();
  const { active, activate } = useWeb3React();
  const addStatusToast = useToastsStore((s) => s.addStatusToast);

  useEffect(() => {
    if (!isMounted()) {
      return;
    }

    const attemptActivate = async () => {
      const isAuthorized = await injected.isAuthorized();
      console.log('isAuthorized', isAuthorized);
      if (isAuthorized) {
        try {
          await activate(injected, undefined, true);
        } catch (e) {
          // HACK to detect error
          if (e.message.includes('Unsupported')) {
            addStatusToast('chain-unsupported', -1, {
              text: CHAIN_UNSUPPORTED_STATUS_TEXT,
            });
          }
        }
        setTried(true);
      } else {
        if (isMobile && window.ethereum) {
          activate(injected, undefined, true).catch(() => {
            setTried(true);
          });
        } else {
          setTried(true);
        }
      }
    };
    attemptActivate();
  }, [activate, isMounted, tried]); // intentionally only running on mount (make sure it's only mounted once :))

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (!tried && active) {
      setTried(true);
    }
  }, [tried, active]);

  return tried;
}

export const EagerConnectEffect: FC = () => {
  useEagerConnect();
  return <></>;
};
