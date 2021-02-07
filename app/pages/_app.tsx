import React from 'react';
import App from 'next/app';
import { ThemedGlobalStyle } from '../theme';
import { LocalStorageEffect } from '../effects/LocalStorageEffect';
import { BlockchainEffect } from '../effects/BlockchainEffect';
import { CHAIN_ID, POB_PROD_LINK } from '../constants';
import { WalletModal } from '../components/modals/wallet';
import { EagerConnectEffect } from '../effects/EagerConnectEffect';
import { TokenStatsEffect } from '../effects/TokenStatsEffect';
import { TransactionsEffect } from '../effects/TransactionsEffect';
import { ScrollLockWrapper } from '../components/ScrollLockWrapper';
import { ToastsEffect } from '../effects/ToastEffect';
import { Toasts } from '../components/toast';
import { WalletEffect } from '../effects/WalletEffect';
import { DefaultSeo } from 'next-seo';
import { Web3ReactProvider } from '@web3-react/core';
import {
  BlockNumber,
  BlockNumberCornerWrapper,
} from '../components/blockchainNumber';
import whyDidYouRender from '@welldone-software/why-did-you-render';
import { MenuModal } from '../components/modals/menu';
import { ethers } from 'ethers';

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('initiating wdyr');
  whyDidYouRender(React as any, { trackAllPureComponents: true });
}

const getLibrary = (provider: any) => {
  const library = new ethers.providers.Web3Provider(provider);
  library.pollingInterval = 15000;
  return library;
};

export default class PobApp extends App {
  render() {
    const { Component, pageProps } = this.props;

    const { err } = this.props as any;
    const modifiedPageProps = { ...pageProps, err };
    return (
      <>
        <DefaultSeo
          title={'POB - Ethereum history in art'}
          description={'Generative art created from transaction metadata.'}
          openGraph={{
            type: 'website',
            locale: 'en_US',
            url: POB_PROD_LINK,
            title: 'POB - Ethereum history in art',
            description: 'Generative art created from transaction metadata.',
            site_name: 'POB',
            images: [
              {
                url: `${POB_PROD_LINK}/banner/default.png`,
                // width: 800,
                // height: 418,
                alt: 'POB',
              },
            ],
          }}
          twitter={{
            handle: '@prrfbeauty',
            site: '@prrfbeauty',
            cardType: 'summary_large_image',
          }}
          additionalMetaTags={[
            {
              name: 'twitter:image',
              content: `${POB_PROD_LINK}/banner/default.png`,
            },
            {
              name: 'twitter:url',
              content: POB_PROD_LINK,
            },
          ]}
        />
        <ThemedGlobalStyle />
        <ScrollLockWrapper>
          <Web3ReactProvider getLibrary={getLibrary}>
            {/** Effects are any tasks that strictly only makes state changes to stores */}
            <LocalStorageEffect />
            <BlockchainEffect />
            <EagerConnectEffect />
            <TokenStatsEffect />
            <TransactionsEffect />
            <WalletEffect />
            <ToastsEffect />
            {/** Modals */}
            <WalletModal />
            <MenuModal />
            <BlockNumberCornerWrapper>
              <BlockNumber />
            </BlockNumberCornerWrapper>
            {/** Component */}
            <Component {...modifiedPageProps} />
          </Web3ReactProvider>
        </ScrollLockWrapper>
      </>
    );
  }
}
