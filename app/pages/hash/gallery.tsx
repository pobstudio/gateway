import React, { FC } from 'react';
import { NextPage } from 'next';
import {
  ContentRow,
  ContentWrapper,
  MainContent,
} from '../../components/content';
import { Header } from '../../components/header';
import styled from 'styled-components';
import { useRef } from 'react';
import { useParallax, useParallaxDelta } from '../../hooks/useParallax';
import { animated } from 'react-spring';
import { Footer } from '../../components/footer';
import { useBlockchainStore } from '../../stores/blockchain';
import {
  SmallCollectionCard,
  LargeCollectionCard,
  MoreCollectionCard,
  CollectionFullCard,
} from '../../components/collectionCard';
import {
  CollectionMetadata,
  useCollectionsStore,
} from '../../stores/collections';
import { useWeb3React } from '@web3-react/core';
import { NextSeo } from 'next-seo';
import { PrimaryButton } from '../../components/button';
import { useModalStore } from '../../stores/modal';
import { useAnalytics } from 'use-analytics';
import { ANALYTIC_EVENTS } from '../../constants/analytics';
import { BREAKPTS } from '../../styles';
import { ROUTES } from '../../constants/routes';
import {
  DEFAULT_PREVIEW_HASHES,
  POB_PROD_LINK,
  TWITTER_LINK,
} from '../../constants';
import { getDefaultPreviewUrl } from '../../utils/urls';
import { Flex } from '../../components/flex';

const GalleryContent = styled(ContentRow)`
  padding-top: 36px;
  padding-bottom: 128px;
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: 36px;
  @media (max-width: ${BREAKPTS.MD}px) {
    padding: 16px 16px 64px 16px;
    grid-gap: 16px;
  }
`;

const GalleryContentRow = styled.div``;

const HalfAndHalfGalleryContentRow = styled(GalleryContentRow)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 36px;
  @media (max-width: ${BREAKPTS.MD}px) {
    grid-gap: 16px;
    grid-template-columns: 1fr;
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 72px;
  color: black;
  opacity: 0.1;
  font-weight: bold;
  @media (max-width: ${BREAKPTS.SM}px) {
    font-size: 36px;
  }
`;

const TryYourHashButton = styled(PrimaryButton)`
  font-size: 18px;
  font-weight: bold;
  padding: 16px 20px;
  color: white;
  ::after {
    background: black;
    opacity: 1;
  }
  @media (max-width: ${BREAKPTS.SM}px) {
    display: none;
  }
`;

const TwitterButton = styled(PrimaryButton).attrs({ as: 'a' })`
  font-size: 18px;
  font-weight: bold;
  padding: 16px 20px;
  color: black;
  text-decoration: none;
  ::after {
    background: #f3f3f3;
    opacity: 1;
  }
  @media (max-width: ${BREAKPTS.SM}px) {
    display: none;
  }
`;

const TitleRow = styled(ContentRow)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 72px;
  @media (max-width: ${BREAKPTS.SM}px) {
    padding: 0 16px;
    padding-top: 24px;
  }
`;

const GalleryPage: NextPage = () => {
  const { account } = useWeb3React();
  const collectionHashOrIdMap = useCollectionsStore(
    (s) => s.collectionHashOrIdMap,
  );
  const toggleIsSearchOpen = useModalStore((s) => s.toggleIsSearchModalOpen);
  const { track } = useAnalytics();
  return (
    <>
      <NextSeo
        title={'POB - Galleries'}
        description={'Collections of artworks recreating Ethereum history'}
        openGraph={{
          type: 'website',
          locale: 'en_US',
          url: `${POB_PROD_LINK}${ROUTES.HASH.GALLERY}`,
          title: 'POB - Galleries',
          description: 'Collections of artworks recreating Ethereum history',
          site_name: 'POB',
          images: [
            {
              url: getDefaultPreviewUrl(DEFAULT_PREVIEW_HASHES[0], 'Galleries'),
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
            content: getDefaultPreviewUrl(
              DEFAULT_PREVIEW_HASHES[0],
              'Galleries',
            ),
          },
          {
            name: 'twitter:url',
            content: `${POB_PROD_LINK}${ROUTES.HASH.GALLERY}`,
          },
        ]}
      />
      <ContentWrapper>
        <Header />
        <TitleRow>
          <Title>Galleries</Title>
          <Flex>
            <TwitterButton
              as={'a'}
              href={TWITTER_LINK}
              target={'_blank'}
              style={{ marginRight: 12 }}
            >
              FOLLOW TWITTER
            </TwitterButton>
            <TryYourHashButton
              onClick={() => {
                track(ANALYTIC_EVENTS.GALLERY_CLICK_TRY_HASH);
                toggleIsSearchOpen();
              }}
            >
              TRY YOUR $HASH
            </TryYourHashButton>
          </Flex>
        </TitleRow>
        <GalleryContent>
          <GalleryContentRow>
            <HalfAndHalfGalleryContentRow>
              <CollectionFullCard id={'gas-station'} isFullWidth={false} />
              <CollectionFullCard
                id={'cryptopunk-aliens'}
                isFullWidth={false}
              />
            </HalfAndHalfGalleryContentRow>
          </GalleryContentRow>
          {!!account &&
          !!collectionHashOrIdMap[account] &&
          collectionHashOrIdMap[account].length !== 0 ? (
            <HalfAndHalfGalleryContentRow>
              <CollectionFullCard id={account} isFullWidth={false} />
              <CollectionFullCard id={'latest-minted'} isFullWidth={false} />
            </HalfAndHalfGalleryContentRow>
          ) : (
            <GalleryContentRow>
              <CollectionFullCard id={'latest-minted'} isFullWidth={true} />
            </GalleryContentRow>
          )}
          <GalleryContentRow>
            <CollectionFullCard id={'uniswap'} isFullWidth={true} />
          </GalleryContentRow>
          <GalleryContentRow>
            <MoreCollectionCard />
          </GalleryContentRow>
        </GalleryContent>
        <Footer />
      </ContentWrapper>
    </>
  );
};

export default React.memo(GalleryPage);
