import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { FC } from 'react';
import { useAnalytics } from 'use-analytics';
import { useWeb3React } from '@web3-react/core';
import { isBrowser } from '../utils';

// TODO(dave4506)
export const AnalyticsEffect: FC = () => {
  const { track, page, identify } = useAnalytics();
  const router = useRouter();
  const { account } = useWeb3React();

  useEffect(() => {
    if (!isBrowser()) {
      return;
    }
    const handleRouteChange = (url: string) => {
      page();
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router.events, page]);

  useEffect(() => {
    if (!isBrowser()) {
      return;
    }
    if (account === null) {
      return;
    }

    console.log(account);
    identify(account, {});
  }, [account, identify]);

  return <></>;
};
