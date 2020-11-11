import { FC, useMemo } from 'react';
import {
  AnimatedDetailsContainer,
  ArtworkCardAbsoluteProps,
  ArtworkCardProps,
  DetailsTextAnchor,
  DetailsContent,
  DetailsTextBold,
  DetailsText,
} from './artworkCards';
import { useAnalytics } from 'use-analytics';
import { useWeb3React } from '@web3-react/core';
import { ANALYTIC_EVENTS } from '../constants/analytics';
import { useMinter } from '../hooks/useMinter';
import { useTokenId } from '../hooks/useTokenId';
import { shortenHexString } from '../utils/hex';
import { getEditionFromTokenId } from '../utils/token';
import { IPFS_GATEWAY_LINK, WHAT_IS_ALL_NONSENSE_LINK } from '../constants';
import { getOpenSeaUrl } from '../utils/urls';
import { maybePluralizeWord } from '../utils/words';
import { generateTokenAttributesFromGene, GeneWithTxData } from '@pob/sketches';
import { SpanBold } from './text';
import { animated, config, useSpring, useTransition } from 'react-spring';
import styled from 'styled-components';
import { ethers } from 'ethers';
import { BaseButton } from './button';

export interface ArtworkDescriptionCardProps {
  gene: GeneWithTxData;
  isHidden?: boolean;
  isClutter?: boolean;
  toggleIsExpanded: () => void;
}

const ArtworkDescriptionCardWrapper = styled.div`
  position: absolute;
  z-index: 3;
  right: -200px;
  bottom: -8px;
  width: 175px;
  height: 76px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const AnimatedArtworkDescriptionCardWrapper = animated(
  ArtworkDescriptionCardWrapper,
);

const OwnerOrMintWrapper = styled.div`
  text-align: right;
  width: 100%;
  height: 100%;
  position: relative;
`;

const AnimatedOwnerOrMintWrapper = animated(OwnerOrMintWrapper);

const OwnerOrMintText = styled.p<{ isClutter?: boolean }>`
  opacity: ${(p) => (p.isClutter ? 1 : 0.1)};
  transition: opacity 150ms ease-out;
  font-family: Bebas Neue;
  font-style: normal;
  font-weight: normal;
  font-size: 34px;
  line-height: 38px;
  display: block;
  margin: 0;
  word-wrap: break-word;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const AOwnerOrMintText = animated(OwnerOrMintText);

const OwnerOrMintAnchor = styled(BaseButton)`
  text-decoration: underline;
  font-family: Bebas Neue;
  font-style: normal;
  font-weight: normal;
  font-size: 34px;
  line-height: 38px;
  padding: 0;
`;

export const CarouselStateText: FC<ArtworkDescriptionCardProps> = ({
  toggleIsExpanded,
  isHidden,
  isClutter,
  gene,
}) => {
  const hideSpring = useSpring({
    opacity: isHidden ? 0 : 1,
    translateX: isHidden ? 40 : 0,
  });

  const { adjustedCurrentPriceToMintInWei, mintingStatus, owner } = useMinter(
    gene.seed,
  );

  const transitionMintingStatus = useMemo(() => {
    if (mintingStatus === 'insufficient-balance') {
      return 'mintable';
    }
    if (mintingStatus === 'too-recent') {
      return 'mintable';
    }
    return mintingStatus;
  }, [mintingStatus]);

  const transitions = useTransition(
    [
      {
        transitionMintingStatus,
        centerCardOwner: owner,
      },
    ],
    ({ centerCardOwner, transitionMintingStatus }) =>
      `center-card-transition-${transitionMintingStatus}`,
    {
      from: { transform: `translateY(76px)` },
      enter: { transform: `translateY(0px)` },
      leave: { transform: `translateY(-76px)` },
      config: config.slow,
    },
  );

  const { account } = useWeb3React();

  return (
    <AnimatedArtworkDescriptionCardWrapper
      style={{ pointerEvents: isHidden ? 'none' : 'auto' }}
    >
      <AnimatedOwnerOrMintWrapper
        style={{
          opacity: hideSpring.opacity.interpolate((v) => v),
          transform: hideSpring.translateX.interpolate(
            (v) => `translateX(${v}px)`,
          ),
        }}
      >
        {transitions.map(({ item, key, props }) => {
          return (
            <AOwnerOrMintText style={props} key={key} isClutter={isClutter}>
              {(() => {
                const { transitionMintingStatus, centerCardOwner } = item;
                // if (transitionMintingStatus === 'no-more-editions') {
                //   return `No more NO. left`;
                // }
                if (transitionMintingStatus === 'in-progress') {
                  return (
                    <>
                      Minting <br /> artwork
                    </>
                  );
                }
                if (transitionMintingStatus === 'failed') {
                  return (
                    <>
                      Oops.
                      <OwnerOrMintAnchor onClick={toggleIsExpanded}>
                        Try Again?
                      </OwnerOrMintAnchor>
                    </>
                  );
                }
                if (
                  (transitionMintingStatus === 'minted' ||
                    transitionMintingStatus === 'success') &&
                  centerCardOwner === account
                ) {
                  return (
                    <>
                      Owned By <br /> you
                    </>
                  );
                }
                if (transitionMintingStatus === 'proud-owner') {
                  return (
                    <>
                      Owned By <br /> you
                    </>
                  );
                }

                if (centerCardOwner === undefined) {
                  return 'Loading...';
                }

                if (
                  transitionMintingStatus === 'mintable' ||
                  centerCardOwner === null
                ) {
                  return (
                    <>
                      <OwnerOrMintAnchor onClick={toggleIsExpanded}>
                        Mint
                      </OwnerOrMintAnchor>{' '}
                      for <br />{' '}
                      {ethers.utils.formatEther(
                        adjustedCurrentPriceToMintInWei,
                      )}{' '}
                      ETH
                    </>
                  );
                }
                return `Owned by ${shortenHexString(centerCardOwner)}`;
              })()}
            </AOwnerOrMintText>
          );
        })}
      </AnimatedOwnerOrMintWrapper>
    </AnimatedArtworkDescriptionCardWrapper>
  );
};
