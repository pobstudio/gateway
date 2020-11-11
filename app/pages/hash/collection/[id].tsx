import React from 'react';
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from 'next';
import { ContentWrapper, MainContent } from '../../../components/content';
import { Header } from '../../../components/header';
import styled from 'styled-components';
import { invert, getContrast } from 'polished';

import { generateColorPalleteFromAddress } from '@pob/sketches';
import { ADDRESS_REGEX } from '../../../utils/regex';
import {
  useCollectionsStore,
  COLLECTION_METADATA_MAP,
} from '../../../stores/collections';
import { useCallback } from 'react';
import { Carousel } from '../../../components/carousel';
import { useAccountCollection } from '../../../hooks/useAccountCollection';
import { AccountCollectionEffect } from '../../../effects/AccountCollectionEffect';
import { NextSeo } from 'next-seo';
import { ROUTES } from '../../../constants/routes';
import { DEFAULT_PREVIEW_HASHES, POB_PROD_LINK } from '../../../constants';
import { getDefaultPreviewUrl } from '../../../utils/urls';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id: idOrAddress } = context.query;
  if (
    !idOrAddress ||
    (!ADDRESS_REGEX.test(idOrAddress as string) &&
      !COLLECTION_METADATA_MAP[idOrAddress as string])
  ) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      idOrAddress: idOrAddress as string,
    },
  };
};

const CollectionsPage: NextPage = ({
  idOrAddress,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const hashOrIds = useCollectionsStore(
    useCallback((state) => state.collectionHashOrIdMap[idOrAddress], [
      idOrAddress,
    ]),
  );
  const collectionMetadata = useCollectionsStore(
    useCallback((state) => state.collectionMetadataMap[idOrAddress], [
      idOrAddress,
    ]),
  );

  return (
    <>
      <NextSeo
        title={`POB - ${
          !!collectionMetadata ? collectionMetadata.name : 'Gallery'
        }`}
        description={'Collection of artworks created by POB.'}
        openGraph={{
          type: 'website',
          locale: 'en_US',
          url: `${POB_PROD_LINK}${ROUTES.HASH.COLLECTION}/${idOrAddress}`,
          title: `POB - ${
            !!collectionMetadata
              ? collectionMetadata.seoName ?? collectionMetadata.name
              : 'Gallery'
          }`,
          description: 'Collection of artworks created by POB.',
          site_name: 'POB',
          images: [
            {
              url: getDefaultPreviewUrl(
                !!collectionMetadata?.initialBackgroundHash
                  ? collectionMetadata.initialBackgroundHash
                  : DEFAULT_PREVIEW_HASHES[1],
                !!collectionMetadata
                  ? (collectionMetadata.seoName ?? collectionMetadata.name)
                      .split(' ')
                      .join('%20')
                  : 'Collection',
              ),
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
              !!collectionMetadata?.initialBackgroundHash
                ? collectionMetadata.initialBackgroundHash
                : DEFAULT_PREVIEW_HASHES[1],
              !!collectionMetadata
                ? (collectionMetadata.seoName ?? collectionMetadata.name)
                    .split(' ')
                    .join('%20')
                : 'Collection',
            ),
          },
          {
            name: 'twitter:url',
            content: `${POB_PROD_LINK}${ROUTES.HASH.COLLECTION}/${idOrAddress}`,
          },
        ]}
      />
      <AccountCollectionEffect account={idOrAddress} />
      <ContentWrapper>
        <Header />
        <MainContent>
          {collectionMetadata && (
            <Carousel
              key={idOrAddress}
              id={idOrAddress}
              hashOrIds={hashOrIds}
              collectionName={collectionMetadata.name}
            />
          )}
        </MainContent>
      </ContentWrapper>
    </>
  );
};

export default React.memo(CollectionsPage);
