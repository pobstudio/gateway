import styled from 'styled-components';
import { animated, useSpring, interpolate } from 'react-spring';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEvent, useKey, useWindowSize } from 'react-use';
import useMeasure from 'react-use-measure';

import { BaseButton } from './button';
import { LargeLeftArrow, LargeRightArrow } from './icons/largeArrow';
import { CardState, GhostCard, LargeCard, LargeCardProps } from './card';
import { fetchGeneLocally } from '../utils/api';
import {
  useCarouselStore,
  CarouselCardState,
  CAROUSEL_CARD_STATE_LIFECYCLE,
} from '../stores/carousel';
import { Baffle } from './baffle';
import { POB_PROD_LINK, SPRING_CONFIG } from '../constants';
import { ClutterIcon, DeclutterIcon } from './icons/clutter';
import { useIsCluttered } from '../hooks/useIsCluttered';
import useSWR from 'swr';
import { useWeb3React } from '@web3-react/core';
import { useENSLookup } from '../hooks/useENS';
import { useHashFromMaybeHashOrId } from '../hooks/useHashFromMaybeHashOrId';
import { TertiaryButton } from '../components/button';
import {
  ArtworkOwnerCard,
  ArtworkTxCard,
  ArtworkColorsCard,
  ArtworkFeaturesCard,
  ArtworkMintCard,
  ArtworkCelebrationCard,
  ArtworkCardAbsoluteContainer,
} from './artworkCards';
import debounce from 'lodash/debounce';
import { CarouselDisplayType } from '../types';
import { TwitterIcon } from './icons/social';
import { getTwitterShareLink } from '../utils/twitter';
import { BaseAnchor } from './anchor';
import { BREAKPTS } from '../styles';
import { DIMENSIONS } from '@pob/sketches';
import { useCardStore } from '../stores/card';
import { shortenHexString } from '../utils/hex';
import { useMinter } from '../hooks/useMinter';
import { PrimaryButton } from './button';
import { ethers } from 'ethers';
import { ExternalLinkIcon } from './icons/externalLink';
import Link from 'next/link';
import { ROUTES } from '../constants/routes';
import { useOwnerByHash } from '../hooks/useOwner';
import { CarouselStateText } from './carouselStateText';

const BOTTOM_DETAILS_PADDING = 0;
const CAROUSEL_SIDE_CARDS_OFFSET = 500;
const PLAY_DURATION_IN_MS = 10000;

interface SpringAnimationState {
  transform: [number, number];
  opacity: number;
}

interface CarouselProps {
  collectionName?: string;
  hashOrIds?: string[];
  displayType?: CarouselDisplayType; // defaults to normal
  displayMetadata?: any;
  id: string;
  isExpanded?: boolean;
}

export const Carousel: React.FC<CarouselProps> = ({
  hashOrIds,
  collectionName,
  displayType = 'normal',
  displayMetadata,
  id,
  isExpanded: isDefaultExpanded,
}) => {
  const {
    getCarousel,
    incrementCarouselIndex,
    decrementCarouselIndex,
    setValues,
    carouselIndex,
    values,
  } = useCarouselStore(
    useCallback(
      (s) => {
        return {
          getCarousel: s.getCarousel(id),
          incrementCarouselIndex: s.incrementCarouselIndex(id),
          decrementCarouselIndex: s.decrementCarouselIndex(id),
          setValues: s.setValues(id),
          carouselIndex: s.carouselIndexMap[id] ?? 0,
          values: s.valuesMap[id] ?? [],
        };
      },
      [id],
    ),
  );

  useEffect(() => {
    if (!hashOrIds) {
      return;
    }
    setValues(hashOrIds);
  }, [hashOrIds]);

  const lifeCycle = useMemo(() => getCarousel(), [values, carouselIndex]);

  // measurements
  const [flexCenterRef, flexCenterBounds] = useMeasure();
  const cardDimensionsBySketchDimensions: [number, number] = useMemo(() => {
    const { height, width } = flexCenterBounds;
    const mW = width / DIMENSIONS[0];
    const mH = height / DIMENSIONS[1];

    return mH < mW
      ? [
          Math.round((height * DIMENSIONS[0]) / DIMENSIONS[1]),
          height - BOTTOM_DETAILS_PADDING,
        ]
      : [
          width,
          Math.round((DIMENSIONS[1] * width) / DIMENSIONS[0]) -
            BOTTOM_DETAILS_PADDING,
        ];
  }, [flexCenterBounds]);

  const setLargeCardDimensions = useCardStore((s) => s.setLargeCardDimensions);

  useEffect(() => {
    setLargeCardDimensions(cardDimensionsBySketchDimensions);
  }, [cardDimensionsBySketchDimensions]);

  const windowSize = useWindowSize();

  const transitionDistance = useMemo(() => {
    return (
      cardDimensionsBySketchDimensions[0] * 0.8 +
      (windowSize.width - cardDimensionsBySketchDimensions[0]) / 2
    );
  }, [cardDimensionsBySketchDimensions, windowSize]);

  const getAnimationStateFromCardState = useCallback(
    (state: CarouselCardState): SpringAnimationState => {
      if (state === 'center') {
        return { transform: [0, 1], opacity: 1 };
      }
      if (state === 'side-left') {
        return { transform: [-1 * transitionDistance, 0.8], opacity: 1 };
      }
      if (state === 'side-right') {
        return { transform: [1 * transitionDistance, 0.8], opacity: 1 };
      }
      if (state === 'prefetch-left') {
        return { transform: [-2 * transitionDistance, 0.8], opacity: 1 };
      }
      if (state === 'prefetch-right') {
        return { transform: [2 * transitionDistance, 0.8], opacity: 1 };
      }
      return { transform: [0, 1], opacity: 1 };
    },
    [transitionDistance],
  );

  // expanded
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!isDefaultExpanded) {
      return;
    }
    setIsExpanded(isDefaultExpanded);
  }, [isDefaultExpanded]);
  // card details
  const toggleIsExpanded = useCallback(() => setIsExpanded(!isExpanded), [
    isExpanded,
  ]);

  useEffect(() => {
    if (displayType === 'singular-detail') {
      setIsExpanded(true);
    }
  }, [displayType]);

  // keyboard controls
  const debouncedIncrementCarouselIndex = useCallback(
    () =>
      debounce(() => {
        incrementCarouselIndex();
        setIsExpanded(false);
        setIsClutter(true);
      }, 20)(),
    [],
  );
  const debouncedDecrementCarouselIndex = useCallback(
    () =>
      debounce(() => {
        decrementCarouselIndex();
        setIsExpanded(false);
        setIsClutter(true);
      }, 20)(),
    [],
  );
  const debouncedToggleIsExpanded = useCallback(
    () =>
      debounce(() => {
        toggleIsExpanded();
      }, 20)(),
    [toggleIsExpanded],
  );

  useKey('ArrowLeft', (e: any) => {
    e.preventDefault();
    debouncedDecrementCarouselIndex();
  });
  useKey('ArrowRight', (e: any) => {
    e.preventDefault();
    debouncedIncrementCarouselIndex();
  });
  useKey(
    'Enter',
    (e: any) => {
      e.preventDefault();
      debouncedToggleIsExpanded();
    },
    {},
    [debouncedToggleIsExpanded],
  );
  useKey(
    'Escape',
    (e: any) => {
      e.preventDefault();
      debouncedToggleIsExpanded();
    },
    {},
    [debouncedToggleIsExpanded],
  );

  // lifecycle states
  const shouldShowLeftArrow = useMemo(() => !!lifeCycle[1], [lifeCycle]);
  const shouldShowRightArrow = useMemo(() => !!lifeCycle[3], [lifeCycle]);

  // clutter
  const [isClutter, setIsClutter] = useIsCluttered();
  const toggleIsClutter = useCallback(() => {
    setIsClutter(!isClutter);
  }, [isClutter, setIsClutter]);

  // center card
  const centerHash = useHashFromMaybeHashOrId(lifeCycle[2]?.value);

  const { data: gene, error } = useSWR(
    useMemo(() => centerHash ?? null, [centerHash]),
    fetchGeneLocally,
    {},
  );

  const isCardHidden = useMemo(() => {
    return (
      !isExpanded || !lifeCycle[2] || (!isClutter && displayType === 'normal')
    );
  }, [lifeCycle, isExpanded, isClutter, displayType]);

  // cursor controls
  const carouselWrapperRef = useRef<HTMLDivElement | null>(null);
  const [cursorType, setCursorType] = useState<'none' | 'right' | 'left'>(
    'none',
  );

  const carouselWidth = useMemo(() => {
    if (!carouselWrapperRef.current) {
      return 0;
    }
    return carouselWrapperRef.current.getBoundingClientRect().width;
  }, [carouselWrapperRef.current, windowSize]);

  const handleMouseMove = useCallback(
    (e: any) => {
      if (!shouldShowLeftArrow && !shouldShowRightArrow) {
        setCursorType('none');
        return;
      }
      const halfWay = carouselWidth / 2;
      setCursorType(e.clientX > halfWay ? 'right' : 'left');
    },
    [carouselWidth, shouldShowRightArrow, shouldShowLeftArrow],
  );

  const handleMouseClick = useCallback(
    (e: any) => {
      const halfWay = carouselWidth / 2;
      if (e.clientX > halfWay) {
        debouncedIncrementCarouselIndex();
      } else {
        debouncedDecrementCarouselIndex();
      }
    },
    [carouselWidth],
  );

  useEvent('mousemove', handleMouseMove, carouselWrapperRef.current);

  // springs
  const shouldShowBottomDetails = useMemo(() => {
    return !!lifeCycle[2] && isClutter && displayType === 'normal';
  }, [lifeCycle, isClutter, displayType]);

  const opacitySpring = useSpring({
    opacity: useMemo(() => (shouldShowBottomDetails ? 1 : 0), [
      shouldShowBottomDetails,
    ]),
    config: SPRING_CONFIG,
  });

  const { width } = useWindowSize();
  const isMobile = useMemo(() => width <= BREAKPTS.SM, [width]);

  return (
    <CarouselWrapper ref={carouselWrapperRef} cursorType={cursorType}>
      <CarouselClickNet onClick={handleMouseClick} />
      <CarouselForegroundLeftContent
        isHidden={!isClutter || !shouldShowLeftArrow}
      >
        <BaseButton onClick={debouncedDecrementCarouselIndex}>
          <LargeLeftArrow />
        </BaseButton>
      </CarouselForegroundLeftContent>
      <CarouselForegroundRightContent
        isHidden={!isClutter || !shouldShowRightArrow}
      >
        <BaseButton onClick={debouncedIncrementCarouselIndex}>
          <LargeRightArrow />
        </BaseButton>
      </CarouselForegroundRightContent>
      <CarouselMainContent>
        <FlexCenter ref={flexCenterRef}>
          <LargeCardContainer>
            <BaffleAbsoluteContainer>
              {!!centerHash && !isMobile && (
                <AnimatedBaffleWrapper>
                  <Baffle>{centerHash}</Baffle>
                </AnimatedBaffleWrapper>
              )}
            </BaffleAbsoluteContainer>
            <GhostCard showEmpty={!lifeCycle[2]} />
            {lifeCycle.map((lc, stateIndex) => {
              if (!lc) {
                return <div key={stateIndex}></div>;
              }
              const { value, key } = lc;
              const carouselState = CAROUSEL_CARD_STATE_LIFECYCLE[stateIndex];
              let cardState: CardState = 'minimized';

              if (
                carouselState === 'prefetch-left' ||
                carouselState === 'prefetch-right'
              ) {
                cardState = 'prefetch';
              }
              if (carouselState === 'center') {
                cardState = 'normal';
              }
              return (
                <LargeCardWithSpring
                  key={`carousel-${key}`}
                  hashOrId={value}
                  carouselState={carouselState}
                  getAnimationStateFromCardState={
                    getAnimationStateFromCardState
                  }
                  cardState={cardState}
                  isClutter={isClutter}
                  isExpanded={isExpanded}
                  setIsExpanded={setIsExpanded}
                  setIsClutter={setIsClutter}
                />
              );
            })}
            <AnimatedLargeCardBottomDetailsContainer
              style={{
                pointerEvents: shouldShowBottomDetails ? 'auto' : 'none',
                opacity: opacitySpring.opacity.interpolate((o) => o),
              }}
            >
              <BottomDetailsButton onClick={toggleIsExpanded}>
                {isExpanded ? 'Minimize' : 'Expand Details'}
              </BottomDetailsButton>
            </AnimatedLargeCardBottomDetailsContainer>
            {!isMobile && !!lifeCycle[2] && !!gene && (
              <ArtworkCardsDesktop
                gene={gene}
                isCardHidden={isCardHidden}
                isClutter={isClutter}
                toggleIsExpanded={toggleIsExpanded}
              />
            )}
          </LargeCardContainer>
        </FlexCenter>
      </CarouselMainContent>
      <DescriptionWrapper>
        <DescriptionWrapperText style={{ opacity: isClutter ? 1 : 0 }}>
          {collectionName}
        </DescriptionWrapperText>
        {displayType === 'normal' && (
          <>
            {/* <IconButton
              style={{ opacity: isClutter ? 1 : 0.2 }}
              onClick={() => {
                track(ANALYTIC_EVENTS.CAROUSEL_EXTERNAL_LINK_ARTWORK);
              }}
            >
              <Link passHref href={`${ROUTES.HASH.ART}/${centerHash}`}>
                <BaseAnchor target={'_blank'}>
                  <ExternalLinkIcon />
                </BaseAnchor>
              </Link>
            </IconButton> */}
          </>
        )}
      </DescriptionWrapper>
      <UIControlWrapper>
        {displayType === 'normal' && (
          <IconButton
            style={{ opacity: isClutter ? 1 : 0.2 }}
            onClick={toggleIsClutter}
          >
            {isClutter ? <DeclutterIcon /> : <ClutterIcon />}
          </IconButton>
        )}
      </UIControlWrapper>
      {/* {!isSingular && (
        <MediaControlWrapper>
          <IconButton
            style={{ opacity: isClutter ? 1 : 0.2 }}
            onClick={toggleIsPaused}
          >
            {isPaused ? <PlayIcon /> : <PauseIcon />}
          </IconButton>
        </MediaControlWrapper>
      )}
      {!isSingular && (
        <Progress isPaused={isPaused} triggerAtOne={incrementCarouselIndex} />
      )} */}
      {isMobile && !!lifeCycle[2] && (
        <ArtworkCardsMobile
          gene={gene}
          isCardHidden={isCardHidden}
          isClutter={isClutter}
          toggleIsExpanded={toggleIsExpanded}
        />
      )}
      {isMobile && (
        <BottomBar
          centerHash={centerHash}
          isClutter={isClutter}
          shouldShowBottomDetails={shouldShowBottomDetails}
          shouldShowLeftArrow={shouldShowLeftArrow}
          shouldShowRightArrow={shouldShowRightArrow}
          isExpanded={isExpanded}
          debouncedDecrementCarouselIndex={debouncedDecrementCarouselIndex}
          debouncedIncrementCarouselIndex={debouncedIncrementCarouselIndex}
          toggleIsExpanded={toggleIsExpanded}
        />
      )}
    </CarouselWrapper>
  );
};

const BottomBar: FC<{
  centerHash?: string;
  isClutter: boolean;
  shouldShowRightArrow: boolean;
  shouldShowLeftArrow: boolean;
  shouldShowBottomDetails: boolean;
  isExpanded: boolean;
  debouncedDecrementCarouselIndex: () => void;
  debouncedIncrementCarouselIndex: () => void;
  toggleIsExpanded: () => void;
}> = ({
  toggleIsExpanded,
  isExpanded,
  debouncedIncrementCarouselIndex,
  debouncedDecrementCarouselIndex,
  centerHash,
  shouldShowBottomDetails,
  shouldShowLeftArrow,
  shouldShowRightArrow,
  isClutter,
}) => {
  const { adjustedCurrentPriceToMintInWei, mintingStatus, owner } = useMinter(
    centerHash,
  );

  const opacitySpring = useSpring({
    opacity: useMemo(() => (shouldShowBottomDetails ? 1 : 0), [
      shouldShowBottomDetails,
    ]),
    config: SPRING_CONFIG,
  });

  const ensName = useENSLookup(owner ?? undefined);

  const transitionMintingStatus = useMemo(() => {
    if (mintingStatus === 'insufficient-balance') {
      return 'mintable';
    }
    if (mintingStatus === 'too-recent') {
      return 'mintable';
    }
    return mintingStatus;
  }, [mintingStatus]);

  const { account } = useWeb3React();
  return (
    <BottomMobileControlsBar isClutter={isClutter}>
      <BottomMobileControlsContainer style={{ paddingLeft: 8 }}>
        <ABottomMobileArrowButton
          isHidden={!shouldShowLeftArrow}
          onClick={debouncedDecrementCarouselIndex}
        >
          <SmallLeftArrow />
        </ABottomMobileArrowButton>
      </BottomMobileControlsContainer>
      <BottomMobileControlsCenterContainer>
        <BottomMobileControlsContainerText>
          {shortenHexString(centerHash ?? '')}
        </BottomMobileControlsContainerText>
        <ABottomDetailsButton
          style={{
            pointerEvents: shouldShowBottomDetails ? 'auto' : 'none',
            opacity: opacitySpring.opacity,
            padding: '4px 14px',
          }}
          onClick={toggleIsExpanded}
        >
          {(() => {
            if (isExpanded) {
              return <>Dismiss Details</>;
            }
            // TODO lift this logic to share it with artwork card
            if (transitionMintingStatus === 'in-progress') {
              return <>Minting artwork</>;
            }
            if (transitionMintingStatus === 'failed') {
              return <>Oops. Try Again?</>;
            }
            if (
              (transitionMintingStatus === 'minted' ||
                transitionMintingStatus === 'success') &&
              owner === account
            ) {
              return <>Owned By You</>;
            }
            if (transitionMintingStatus === 'proud-owner') {
              return <>Owned By You</>;
            }

            if (owner === undefined) {
              return 'Loading...';
            }

            if (transitionMintingStatus === 'mintable' || owner === null) {
              return (
                <>
                  Mint for{' '}
                  {ethers.utils.formatEther(adjustedCurrentPriceToMintInWei)}{' '}
                  ETH
                </>
              );
            }
            return `Owned by ${shortenHexString(owner)}`;
          })()}
        </ABottomDetailsButton>
      </BottomMobileControlsCenterContainer>
      <BottomMobileControlsContainer style={{ paddingRight: 8 }}>
        <ABottomMobileArrowButton
          isHidden={!shouldShowRightArrow}
          onClick={debouncedIncrementCarouselIndex}
        >
          <SmallRightArrow />
        </ABottomMobileArrowButton>
      </BottomMobileControlsContainer>
    </BottomMobileControlsBar>
  );
};

type OwnerStateCard = 'owner' | 'celebration' | 'mint';

const useShouldShowOwnerStateCard = (hash: string): OwnerStateCard => {
  const owner = useOwnerByHash(hash);
  const { mintingStatus } = useMinter(hash);

  return useMemo(() => {
    if (!!owner) {
      if (mintingStatus === 'proud-owner') {
        return 'celebration';
      }
      return 'owner';
    }
    return 'mint';
  }, [owner]);
};

interface ArtworkCardsProps {
  gene: any;
  isCardHidden: boolean;
  toggleIsExpanded: () => void;
  isClutter: boolean;
}

const ArtworkCardsDesktop: FC<ArtworkCardsProps> = ({
  isClutter,
  toggleIsExpanded,
  gene,
  isCardHidden,
}) => {
  const ownerCardState = useShouldShowOwnerStateCard(gene.seed);

  return (
    <>
      <ArtworkCardAbsoluteContainer
        corner={'topLeft'}
        isHidden={isCardHidden}
        contentWidth={225}
      >
        <ArtworkTxCard gene={gene} />
      </ArtworkCardAbsoluteContainer>
      <ArtworkCardAbsoluteContainer
        corner={'bottomLeft'}
        isHidden={isCardHidden}
        contentWidth={165}
      >
        <ArtworkColorsCard gene={gene} />
      </ArtworkCardAbsoluteContainer>
      <ArtworkCardAbsoluteContainer
        corner={'topRight'}
        isHidden={isCardHidden}
        contentWidth={300}
      >
        <ArtworkFeaturesCard gene={gene} isRight={true} />
      </ArtworkCardAbsoluteContainer>
      <ArtworkCardAbsoluteContainer
        corner={'bottomRight'}
        isHidden={isCardHidden || ownerCardState !== 'mint'}
        contentWidth={300}
      >
        <ArtworkMintCard gene={gene} isRight={true} />
      </ArtworkCardAbsoluteContainer>
      <ArtworkCardAbsoluteContainer
        corner={'bottomRight'}
        isHidden={isCardHidden || ownerCardState !== 'owner'}
        contentWidth={200}
      >
        <ArtworkOwnerCard gene={gene} isRight={true} />
      </ArtworkCardAbsoluteContainer>
      <ArtworkCardAbsoluteContainer
        corner={'bottomRight'}
        isHidden={isCardHidden || ownerCardState !== 'celebration'}
        contentWidth={300}
      >
        <ArtworkCelebrationCard gene={gene} isRight={true} />
      </ArtworkCardAbsoluteContainer>
      <CarouselStateText
        gene={gene}
        isClutter={isClutter}
        isHidden={!isCardHidden}
        toggleIsExpanded={toggleIsExpanded}
      />
    </>
  );
};

const ArtworkCardsMobileContiner = styled.div`
  padding: 16px;
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  background: #f8f8f8;
  overflow: auto;
  z-index: 3;
  > div + div {
    margin-top: 16px;
  }
  padding-bottom: 128px;
`;

const ArtworkCardsTabs = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 16px;
`;

const AnimatedArtworkCardsMobileContiner = animated(ArtworkCardsMobileContiner);

const ARTWORK_CARD_STYLE_MOBILE = {
  display: 'block',
  position: 'static',
  width: '100%',
};

const ARTWORK_ABSOLUTE_CARD_STYLE_MOBILE = {
  ...ARTWORK_CARD_STYLE_MOBILE,
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 'auto',
};

const ArtworkTab = styled(PrimaryButton)<{ isActive?: boolean }>`
  text-transform: uppercase;
  font-size: 14px;
  font-weight: bold;
  opacity: 1;
  transition: all 200ms ease-out;
  padding: 16px 24px;
  color: ${(p) => (p.isActive ? 'white' : 'black')};
  @media (max-width: ${BREAKPTS.SM}px) {
    padding: 12px 14px;
    font-size: 12px;
  }
  ::after {
    opacity: 1;
    background: ${(p) => (p.isActive ? 'black' : 'white')};
  }
  &:hover {
    opacity: 1;
  }
`;

const ArtworkOwnerRelativeContainer = styled.div`
  position: relative;
`;

const ArtworkCardsMobile: FC<ArtworkCardsProps> = ({ gene, isCardHidden }) => {
  const hideSpring = useSpring({
    opacity: isCardHidden ? 0 : 1,
    transform: `translateY(${isCardHidden ? -40 : 0}px)`,
  });

  const [isArtDetailsTabOpen, setIsArtDetailsTabOpen] = useState(false);

  const ownerCardState = useShouldShowOwnerStateCard(gene.seed);

  return (
    <AnimatedArtworkCardsMobileContiner
      style={{ ...hideSpring, pointerEvents: isCardHidden ? 'none' : 'auto' }}
    >
      <ArtworkCardsTabs>
        <ArtworkTab
          isActive={isArtDetailsTabOpen}
          onClick={() => setIsArtDetailsTabOpen(true)}
        >
          Artwork Details
        </ArtworkTab>
        <ArtworkTab
          isActive={!isArtDetailsTabOpen}
          onClick={() => setIsArtDetailsTabOpen(false)}
        >
          Token Details
        </ArtworkTab>
      </ArtworkCardsTabs>
      {isArtDetailsTabOpen && !isCardHidden && (
        <>
          <ArtworkTxCard gene={gene} />
          <ArtworkFeaturesCard gene={gene} />
          <ArtworkColorsCard gene={gene} />
        </>
      )}
      {!isArtDetailsTabOpen && !isCardHidden && (
        <ArtworkOwnerRelativeContainer>
          {ownerCardState === 'mint' && <ArtworkMintCard gene={gene} />}
          {ownerCardState === 'owner' && <ArtworkOwnerCard gene={gene} />}
          {ownerCardState === 'celebration' && (
            <ArtworkCelebrationCard gene={gene} />
          )}
        </ArtworkOwnerRelativeContainer>
      )}
    </AnimatedArtworkCardsMobileContiner>
  );
};

const BottomMobileArrowButton = styled(BaseButton)<{ isHidden?: boolean }>`
  display: block;
  opacity: ${(p) => (!p.isHidden ? 1 : 0)};
  transition: opacity 150ms ease-out;
  pointer-events: ${(p) => (!p.isHidden ? 'auto' : 'none')};
`;

const ABottomMobileArrowButton = animated(BottomMobileArrowButton);

const SmallLeftArrow = styled(LargeLeftArrow)`
  height: 24px;
  width: 24px;
`;

const SmallRightArrow = styled(LargeRightArrow)`
  height: 24px;
  width: 24px;
`;

const BottomMobileControlsBar = styled.div<{ isClutter?: boolean }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(60px + env(safe-area-inset-bottom));
  display: none;
  transition: all 250ms ease-out;
  opacity: ${(p) => (!p.isClutter ? 0.2 : 1)};
  background: ${(p) => (!p.isClutter ? 'rgba(255, 255, 255, 0)' : 'white')};
  box-shadow: ${(p) =>
    !p.isClutter ? '0px 0px 0px rgba(0, 0, 0, 0)' : '0px -4px 0px #000000'};
  z-index: 4;
  padding-bottom: env(safe-area-inset-bottom);
  @media (max-width: ${BREAKPTS.MD}px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
`;

const BottomMobileControlsContainer = styled.div`
  display: flex;
`;

const BottomMobileControlsCenterContainer = styled(
  BottomMobileControlsContainer,
)`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-grow: 1;
`;

const BottomMobileControlsContainerText = styled.p`
  font-size: 18px;
  font-weight: bold;
  margin: 0;
`;

const LargeCardWithSpring: FC<
  LargeCardProps & {
    carouselState: CarouselCardState;
    getAnimationStateFromCardState: any;
  }
> = ({ carouselState, getAnimationStateFromCardState, cardState, ...rest }) => {
  const springState = useMemo(
    () => getAnimationStateFromCardState(carouselState),
    [carouselState, getAnimationStateFromCardState],
  );
  const zIndex = useMemo(() => (cardState === 'normal' ? 2 : 0), [cardState]);
  const props = useSpring({
    to: {
      transform: useMemo(
        () =>
          `translateX(${springState.transform[0]}px) scale(${springState.transform[1]})`,
        [springState.transform],
      ),
      opacity: useMemo(() => springState.opacity, [springState.opacity]),
    },
    initial: null,
    config: SPRING_CONFIG,
  });
  return (
    <LargeCardWithSpringAbsoluteWrapper style={{ zIndex }}>
      <LargeCard {...rest} cardState={cardState} springProps={props} />
    </LargeCardWithSpringAbsoluteWrapper>
  );
};

const CarouselClickNet = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
`;

const MediaControlWrapper = styled.div`
  display: flex;
  align-items: center;
  position: absolute;
  bottom: 16px;
  left: 24px;
  z-index: 2;
`;

const IconButton = styled(BaseButton)`
  transition: opacity 150ms ease-out;
  display: block;
  height: 24px;
  width: 24px;
`;

const UIControlWrapper = styled.div`
  display: flex;
  align-items: center;
  position: absolute;
  top: 16px;
  left: 24px;
  z-index: 3;
  > button + button {
    margin-left: 8px;
  }
  @media (max-width: ${BREAKPTS.SM}px) {
    top: 8px;
    left: 8px;
  }
`;

const DescriptionWrapperText = styled.p`
  transition: opacity 150ms ease-out;
  font-weight: 600;
  opacity: 0.2;
  font-size: 18px;
  margin: 0;
`;

const DescriptionWrapper = styled.div`
  display: flex;
  align-items: center;
  position: absolute;
  top: 16px;
  right: 24px;
  z-index: 2;
  > * + * {
    margin-left: 14px;
  }
  @media (max-width: ${BREAKPTS.SM}px) {
    top: 8px;
    right: 8px;
  }
`;

const LargeStateText = styled.h1`
  text-align: center;
  font-family: Bebas Neue;
  margin: 0;
  opacity: 0.1;
  font-size: 144px;
  font-weight: 600;
  width: 100%;
`;

const BaffleAbsoluteContainer = styled.div`
  position: absolute;
  z-index: 0;
  right: -200px;
  left: -200px;
  display: flex;
  top: 0;
  bottom: 0;
  align-items: center;
  pointer-events: none;
`;

const BaffleWrapper = styled.div`
  width: 100%;
`;

const AnimatedBaffleWrapper = animated(BaffleWrapper);

const LargeCardWithSpringAbsoluteWrapper = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
`;

const CarouselForegroundSideContent = styled.div<{ isHidden?: boolean }>`
  opacity: ${(p) => (!p.isHidden ? 1 : 0)};
  transition: opacity 250ms ease-out;
  pointer-events: ${(p) => (!p.isHidden ? 'auto' : 'none')};
  position: absolute;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 78px;
  height: 78px;
  margin: auto 0;
  z-index: 3;
  @media (max-width: ${BREAKPTS.MD}px) {
    display: none;
  }
`;

const CarouselForegroundLeftContent = styled(CarouselForegroundSideContent)`
  left: 20px;
`;

const CarouselForegroundRightContent = styled(CarouselForegroundSideContent)`
  right: 20px;
`;

const CarouselWrapper = styled.div<{ cursorType?: 'right' | 'left' | 'none' }>`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: ${(p) =>
    p.cursorType === undefined || p.cursorType === 'none'
      ? 'cursor'
      : p.cursorType === 'right'
      ? 'url(/cursor/right.svg) 20 20, pointer'
      : 'url(/cursor/left.svg) 20 20, pointer'};
`;

const CarouselMainContent = styled.div`
  width: 100%;
  height: 100%;
  z-index: 0;
  padding: 64px 0;
  background: #f8f8f8;
  @media (max-width: ${BREAKPTS.LG}px) {
    padding: 64px 64px;
  }
  @media (max-width: ${BREAKPTS.MD}px) {
    padding: 64px 32px;
  }
  @media (max-width: ${BREAKPTS.SM}px) {
    padding: 42px 8px 78px 8px;
  }
`;

const FlexCenter = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const LargeCardContainer = styled.div`
  position: relative;
`;

const LargeCardBottomDetailsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  bottom: -40px;
  right: 0;
  left: 0;
  z-index: 3;
  @media (max-width: ${BREAKPTS.MD}px) {
    display: none;
  }
`;

const AnimatedLargeCardBottomDetailsContainer = animated(
  LargeCardBottomDetailsContainer,
);

const BottomDetailsButton = styled(TertiaryButton)`
  padding: 14px;
`;

const ABottomDetailsButton = animated(BottomDetailsButton);
