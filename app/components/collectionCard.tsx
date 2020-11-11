import React, { FC } from 'react';
import { NextPage } from 'next';
import { ContentRow, ContentWrapper, MainContent } from '../components/content';
import { Header } from '../components/header';
import styled from 'styled-components';
import { useRef } from 'react';
import { useParallax, useParallaxDelta } from '../hooks/useParallax';
import { animated, useTransition } from 'react-spring';
import { Footer } from '../components/footer';
import { useBlockchainStore } from '../stores/blockchain';
import Link from 'next/link';
import { useCollectionsStore } from '../stores/collections';
import { useCallback } from 'react';
import { useHashFromMaybeHashOrId } from '../hooks/useHashFromMaybeHashOrId';
import { useState } from 'react';
import { useInterval, usePrevious } from 'react-use';
import { LoadingCard } from './loadingCard';
import { getCyclicIndex } from '@pob/sketches/src/utils/cyclic';
import { useMemo } from 'react';
import { BlockNumber } from './blockchainNumber';
import { BREAKPTS } from '../styles';
import { BaseAnchor } from './anchor';
import { FlexCenterColumn } from './flex';
import { BLOG_LINK } from '../constants';
import { ROUTES } from '../constants/routes';
import { getArtworkPreviewUrl } from '../utils/urls';

export const COLLECTION_CARD_HEIGHT = 400;
export const MOBILE_COLLECTION_CARD_HEIGHT = 225;

export const CollectionCard = styled.div`
  background: #f8f8f8;
  height: ${COLLECTION_CARD_HEIGHT}px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  @media (max-width: ${BREAKPTS.SM}px) {
    height: ${MOBILE_COLLECTION_CARD_HEIGHT}px;
  }
`;

const FullWidthCollectionCard = styled(CollectionCard)`
  cursor: url(/cursor/click.svg) 20 20, pointer;
  :hover .full-width-card-foreground {
    transform: scale(1.02);
  }
`;

const HalfWidthCollectionCard = styled(CollectionCard)`
  cursor: url(/cursor/click.svg) 20 20, pointer;
  :hover .small-card-foreground {
    transform: scale(1.02);
  }
`;

const SmallCardForeground = styled.div.attrs({
  className: 'small-card-foreground',
})`
  position: absolute;
  top: 60px;
  right: 60px;
  left: 60px;
  bottom: 60px;
  padding: 18px;
  background: white;
  box-shadow: 4px 4px 0px #000000;
  z-index: 1;
  display: flex;
  flex-direction: column;
  transform: scale(1);
  transition: transform 150ms ease-in-out;
  @media (max-width: ${BREAKPTS.LG}px) {
    top: 40px;
    right: 40px;
    left: 40px;
    bottom: 40px;
    padding: 16px;
  }
  @media (max-width: ${BREAKPTS.MD}px) {
    top: 30px;
    right: 30px;
    left: 30px;
    bottom: 30px;
    padding: 12px;
  }
`;

const LargeCardForeground = styled.div.attrs({
  className: 'full-width-card-foreground',
})`
  position: absolute;
  top: 60px;
  left: 60px;
  bottom: 60px;
  width: 450px;
  padding: 18px;
  background: white;
  box-shadow: 4px 4px 0px #000000;
  z-index: 1;
  display: flex;
  flex-direction: column;
  transform: scale(1);
  transition: transform 150ms ease-in-out;
  @media (max-width: ${BREAKPTS.LG}px) {
    top: 40px;
    right: 40px;
    left: 40px;
    bottom: 40px;
    padding: 16px;
  }
  @media (max-width: ${BREAKPTS.MD}px) {
    top: 30px;
    right: 30px;
    left: 30px;
    bottom: 30px;
    width: auto;
    padding: 12px;
  }
`;

const AnimatedLargeCardForeground = animated(LargeCardForeground);

const CardImageBackground = styled.img`
  position: absolute;
  top: -25px;
  right: -25px;
  left: -25px;
  bottom: -25px;
  z-index: 0;
  object-fit: cover;
  display: block;
`;

const AnimatedCardImageBackground = animated(CardImageBackground);

const ImageBackground: FC<{ springStyle: any; src?: string }> = ({
  springStyle,
  src,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  return (
    <>
      <AnimatedCardImageBackground
        style={springStyle}
        src={src}
        onLoad={() => setIsLoading(false)}
      />
      <LoadingCard isLoading={isLoading} />
    </>
  );
};

const MoreCollectionText = styled.h1`
  margin: 0;
  font-size: 48px;
  color: black;
  opacity: 0.1;
  font-weight: bold;
  text-align: center;
  max-width: 70%;
  @media (max-width: ${BREAKPTS.SM}px) {
    font-size: 32px;
    max-width: 100%;
  }
`;

const CollectionTitle = styled.h2`
  margin: 0;
  font-size: 48px;
  color: black;
  font-weight: bold;
  @media (max-width: ${BREAKPTS.SM}px) {
    font-size: 28px;
  }
`;

const CollectionSubTitle = styled.h4`
  margin: 0;
  font-size: 16px;
  color: black;
  font-weight: bold;
  @media (max-width: ${BREAKPTS.SM}px) {
    font-size: 14px;
  }
`;

const CollectionSubTitleRow = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
`;

const BlockNumWrapper = styled.div`
  position: relative;
  ::after {
    position: absolute;
    top: 20px;
    left: 6px;
    width: 125px;
    padding: 10px;
    font-size: 12px;
    content: 'This collection is live; artworks are generated with each block';
    background: black;
    color: white;
    opacity: 0;
    pointer-events: none;
    transition: all 250ms ease-in-out;
    transform: translateY(-10px);
  }
  :hover {
    ::after {
      opacity: 1;
      transform: translateY(0px);
    }
  }
`;

interface CollectionCardProps {
  title: string;
  subtitle: string;
  id: string;
  showBlockNumber?: boolean;
}

export const LargeCollectionCard: FC<
  CollectionCardProps & { backgroundImgUrl?: string }
> = ({ id, title, subtitle, backgroundImgUrl, showBlockNumber }) => {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const [delta] = useParallaxDelta(parallaxRef, {
    deltaSnapbackMargin: [0, 25],
  });

  const cardBackgroundStyles = useParallax(delta, {
    rCoeff: [0, 0],
    dCoeff: [0.04, 0.04],
    zIndex: -1,
  });

  const backgroundImgTransition = useTransition(
    !!backgroundImgUrl ? [backgroundImgUrl] : [],
    (k) => `background-image-${id}-${k}`,
    {
      from: { opacity: 0 },
      enter: { opacity: 1 },
      leave: { opacity: 0 },
    },
  );

  return (
    <Link href={`${ROUTES.HASH.COLLECTION}/${id}`}>
      <FullWidthCollectionCard ref={parallaxRef}>
        {backgroundImgTransition.map(({ item, key, props }) => {
          return (
            <ImageBackground
              key={key}
              src={item}
              springStyle={{ ...cardBackgroundStyles, ...props }}
            />
          );
        })}
        <AnimatedLargeCardForeground>
          <CollectionTitle style={{ flexGrow: 1 }}>{title}</CollectionTitle>
          <CollectionSubTitleRow>
            <CollectionSubTitle style={{ maxWidth: '75%' }}>
              {subtitle}
            </CollectionSubTitle>
            {showBlockNumber && (
              <BlockNumWrapper>
                <BlockNumber isMinimal={true} />
              </BlockNumWrapper>
            )}
          </CollectionSubTitleRow>
        </AnimatedLargeCardForeground>
      </FullWidthCollectionCard>
    </Link>
  );
};

export const MoreCollectionCard: FC = () => {
  return (
    <CollectionCard>
      <FlexCenterColumn style={{ width: '100%' }}>
        <MoreCollectionText>More galleries to come</MoreCollectionText>
        <MoreCollectionButton
          href={BLOG_LINK}
          target={'_blank'}
          style={{ marginTop: 16 }}
        >
          FOLLOW FOR UPDATES
        </MoreCollectionButton>
      </FlexCenterColumn>
    </CollectionCard>
  );
};

const MoreCollectionButton = styled(BaseAnchor)`
  font-size: 16px;
  font-weight: bold;
  padding: 16px 20px !important;
  color: white;
  background: black !important; // Why da faq is the !important needed
  text-decoration: none;
  opacity: 1;
  @media (max-width: ${BREAKPTS.SM}px) {
    padding: 12px 14px !important;
    font-size: 14px;
  }
`;

export const SmallCollectionCard: FC<
  CollectionCardProps & { backgroundImgUrl?: string }
> = ({ title, subtitle, backgroundImgUrl, id, showBlockNumber }) => {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const [delta] = useParallaxDelta(parallaxRef, {
    deltaSnapbackMargin: [0, 25],
  });

  const cardBackgroundStyles = useParallax(delta, {
    rCoeff: [0, 0],
    dCoeff: [0.04, 0.04],
    zIndex: 1,
  });

  const backgroundImgTransition = useTransition(
    !!backgroundImgUrl ? [backgroundImgUrl] : [],
    (k) => `background-img-${id}-${k}`,
    {
      from: { opacity: 0 },
      enter: { opacity: 1 },
      leave: { opacity: 0 },
    },
  );

  return (
    <Link href={`${ROUTES.HASH.COLLECTION}/${id}`}>
      <HalfWidthCollectionCard ref={parallaxRef}>
        {backgroundImgTransition.map(({ item, key, props }) => {
          return (
            <ImageBackground
              springStyle={{ ...cardBackgroundStyles, ...props }}
              src={item}
              key={key}
            />
          );
        })}
        <SmallCardForeground>
          <CollectionTitle style={{ flexGrow: 1 }}>{title}</CollectionTitle>
          <CollectionSubTitleRow>
            <CollectionSubTitle style={{ maxWidth: '75%' }}>
              {subtitle}
            </CollectionSubTitle>
            {showBlockNumber && (
              <BlockNumWrapper>
                <BlockNumber isMinimal={true} />
              </BlockNumWrapper>
            )}
          </CollectionSubTitleRow>
        </SmallCardForeground>
      </HalfWidthCollectionCard>
    </Link>
  );
};

export const CollectionFullCard: FC<{ id: string; isFullWidth: boolean }> = ({
  id,
  isFullWidth,
}) => {
  const {
    name,
    description,
    initialBackgroundHash,
    isLiveCollection,
  } = useCollectionsStore(
    useCallback((s) => s.collectionMetadataMap[id], [id]),
  );
  const hashOrIds = useCollectionsStore(
    useCallback((s) => s.collectionHashOrIdMap[id] ?? [], [id]),
  );

  const hashOrIdsWithInitial = useMemo(() => {
    if (!!initialBackgroundHash) {
      return [initialBackgroundHash, ...hashOrIds];
    }
    return hashOrIds;
  }, [hashOrIds]);

  const [counter, setCounter] = useState(0);

  useInterval(() => {
    setCounter(counter + 1);
  }, 15000);

  const hash = useHashFromMaybeHashOrId(
    hashOrIdsWithInitial[getCyclicIndex(counter, hashOrIdsWithInitial.length)],
  );
  const prefetchHash = useHashFromMaybeHashOrId(
    hashOrIdsWithInitial[
      getCyclicIndex(counter + 1, hashOrIdsWithInitial.length)
    ],
  );

  return (
    <>
      <link
        rel="preload"
        href={prefetchHash ? getArtworkPreviewUrl(prefetchHash) : undefined}
        as="image"
      />
      {isFullWidth ? (
        <LargeCollectionCard
          id={id}
          title={name}
          subtitle={description}
          showBlockNumber={isLiveCollection}
          backgroundImgUrl={hash ? getArtworkPreviewUrl(hash) : undefined}
        />
      ) : (
        <SmallCollectionCard
          id={id}
          title={name}
          subtitle={description}
          showBlockNumber={isLiveCollection}
          backgroundImgUrl={hash ? getArtworkPreviewUrl(hash) : undefined}
        />
      )}
    </>
  );
};
