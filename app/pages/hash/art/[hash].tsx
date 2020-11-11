import React from 'react';
import {
  NextPage,
} from 'next';
import { ContentWrapper, MainContent } from '../../../components/content';
import { Header } from '../../../components/header';
import { Carousel } from '../../../components/carousel';
import { NextSeo } from 'next-seo';
import { shortenHexString } from '../../../utils/hex';
import { ROUTES } from '../../../constants/routes';
import { POB_PROD_LINK } from '../../../constants';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

const ArtworkPage: NextPage = (
) => {
  const router = useRouter();
  const { hash} = useMemo(() => router.query, [router.query]);

  return (
    <>{ !!hash && <>
      <NextSeo
        title={`POB - Artwork ${shortenHexString(hash as string)}...`}
        description={'Artwork'}
        openGraph={{
          type: 'website',
          locale: 'en_US',
          url: `${POB_PROD_LINK}${ROUTES.HASH.ART}/${hash as string}`,
          title: `POB - Artwork ${shortenHexString(hash as string)}...`,
          description: 'Crypto artwork created by a transaction hash.',
          site_name: 'POB',
          images: [],
        }}
        twitter={{
          handle: '@prrfbeauty',
          site: '@prrfbeauty',
          cardType: 'summary_large_image',
        }}
        additionalMetaTags={[
          {
            name: 'twitter:url',
            content: `${POB_PROD_LINK}${ROUTES.HASH.ART}/${hash as string}`,
          },
        ]}
      />
      <ContentWrapper>
        <Header />
        <MainContent>
          <Carousel
            id={'singular-detail'}
            hashOrIds={[hash as string]}
            isExpanded={false}
            collectionName={''}
          />
        </MainContent>
      </ContentWrapper></>}
    </>
  );
};

export default React.memo(ArtworkPage);
