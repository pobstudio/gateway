import { generateTokenAttributesFromGene, GeneWithTxData } from '@pob/sketches';
import { BigNumber, ethers } from 'ethers';
import Link from 'next/link';
import { useMemo } from 'react';
import { FC } from 'react';
import { animated, useSpring, useTransition, config } from 'react-spring';
import styled from 'styled-components';
import { useWallet } from 'use-wallet';
import { useENSLookup } from '../hooks/useENS';
import { MINTING_SLIPPAGE_COUNT, useMinter } from '../hooks/useMinter';
import { useOwnerByHash } from '../hooks/useOwner';
import { useTokenId } from '../hooks/useTokenId';
import { invert, getContrast } from 'polished';
import {
  FORMATTED_PRICE_PER_MINT,
  FORMATTED_STARTING_PRICE,
  TOKEN_SYMBOL,
} from '../stores/tokens';
import { shortenHexString } from '../utils/hex';
import { getEditionFromTokenId } from '../utils/token';
import { maybePluralizeWord } from '../utils/words';
import { BaseButton, PrimaryButton } from './button';
import {
  MINT_BLOCK_NUM,
  SPRING_CONFIG,
  TOKEN_TYPE,
  WHAT_IS_ALL_NONSENSE_LINK,
  ZERO,
} from '../constants';
import { CarouselDisplayType } from '../types';
import { useModalStore } from '../stores/modal';
import { HelpIcon } from './icons/help';
import { useEffect } from 'react';
import { useState } from 'react';
import { BREAKPTS } from '../styles';
import { useWindowSize } from 'react-use';
import { ROUTES } from '../constants/routes';

interface ArtworkCardProps {
  springStyles?: any;
  gene: GeneWithTxData;
  isHidden?: boolean;
  displayType?: CarouselDisplayType;
  style?: any;
}

const DetailsContainer = styled.div`
  padding: 18px;
  background: white;
  box-shadow: 4px 4px 0px #000000;
  display: flex;
  align-items: flex-end;
  flex-direction: column;
  text-align: right;
  div + div {
    padding-top: 12px;
  }
  @media (max-width: ${BREAKPTS.SM}px) {
    align-items: flex-start;
    text-align: left;
  }
`;

const DetailsContainerWrapper = styled.div`
  z-index: 2;
  cursor: auto;
`;

const AnimatedDetailsContainerWrapper = animated(DetailsContainerWrapper);
const AnimatedDetailsContainer = animated(DetailsContainer);

const DetailsRightContainer = styled(DetailsContainer)`
  box-shadow: -4px 4px 0px #000000;
  align-items: flex-start;
  text-align: left;
  @media (max-width: ${BREAKPTS.SM}px) {
    box-shadow: 4px 4px 0px #000000;
  }
`;

const AnimatedDetailsRightContainer = animated(DetailsRightContainer);

const DetailsText = styled.p`
  padding: 0;
  margin: 0;
  word-wrap: break-word;
  font-size: 16px;
`;

const DetailsContent = styled.div`
  width: 100%;
  > p + p {
    padding-top: 8px;
  }
  @media (max-width: ${BREAKPTS.MD}px) {
    > p + p {
      padding-top: 4px;
    }
  }
`;

const DetailsTextBold = styled.span`
  font-weight: 600;
`;

const DetailsTextFlexRow = styled.div`
  display: flex;
  align-items: center;
`;

const DetailsTextAnchor = styled.a`
  font-weight: 600;
  color: black;
  text-decoration: underline;
  font-size: 14px;
`;

const DetailsBottomWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding-top: 28px;
`;

const DetailsColorPalleteWrapper = styled.div`
  display: flex;
  padding-top: 8px;
  justify-content: flex-end;
  div + div {
    margin-left: 8px;
  }
  @media (max-width: ${BREAKPTS.SM}px) {
    justify-content: flex-start;
  }
`;

const DetailsColorCircle = styled.div<{ color: string }>`
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: ${(props) => props.color};
  border: ${(p) =>
    getContrast(p.color, '#FFFFFF') <= 1.1 ? '1px solid #000' : 'none'};
`;

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

const useResponsiveAbsolutePositioning = (contentWidth: number) => {
  const { width } = useWindowSize();
  const isMD = useMemo(() => width <= BREAKPTS.MD, [width]);
  const isLG = useMemo(() => width <= BREAKPTS.LG, [width]);
  return useMemo(() => {
    if (isLG && !isMD) {
      return -32;
    }
    if (isMD) {
      return -16;
    }
    return -1 * (contentWidth - 150);
  }, [isMD, isLG]);
};

export const ArtworkDescriptionCard: FC<
  ArtworkCardProps & { isClutter?: boolean; toggleIsExpanded: () => void }
> = ({ toggleIsExpanded, isHidden, isClutter, gene, springStyles }) => {
  const hideSpring = useSpring({
    opacity: isHidden ? 0 : 1,
    translateX: isHidden ? 40 : 0,
  });

  const { adjustedCurrentPriceToMintInWei, mintingStatus, owner } = useMinter(
    gene.seed,
  );

  const ensName = useENSLookup(undefined);

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
        centerCardENSName: ensName,
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

  const { account } = useWallet();

  return (
    <AnimatedArtworkDescriptionCardWrapper
      style={{ ...springStyles, pointerEvents: isHidden ? 'none' : 'auto' }}
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
                const {
                  transitionMintingStatus,
                  centerCardOwner,
                  centerCardENSName,
                } = item;
                // if (transitionMintingStatus === 'no-more-editions') {
                //   return `No more ED. left`;
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
                  return 'You are the owner!';
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
                return `Owned by ${
                  centerCardENSName || shortenHexString(centerCardOwner)
                }`;
              })()}
            </AOwnerOrMintText>
          );
        })}
      </AnimatedOwnerOrMintWrapper>
    </AnimatedArtworkDescriptionCardWrapper>
  );
};

const TitleText = styled.h1`
  margin: 0;
  font-size: 48px;
  color: black;
  font-weight: bold;
`;

// export const ArtworkTitleCard: FC<
//   ArtworkCardProps & { title?: string; subTitle?: string }
// > = ({
//   springStyles,
//   gene,
//   isHidden,
//   title,
//   subTitle,
//   displayType,
// }) => {
//   const isHiddenWithState = useMemo(() => {
//     return isHidden || displayType !== 'singular-detail';
//   }, [isHidden]);

//   const hideSpring = useSpring({
//     opacity: isHiddenWithState ? 0 : 1,
//     translateX: isHiddenWithState ? -40 : 0,
//   });

//   return (
//     <AnimatedDetailsContainerWrapper
//       style={{
//         ...springStyles,
//         position: 'absolute',
//         top: 25,
//         rightle: pinnedContainerWidth - 100,
//         width: 320,
//         pointerEvents: isHidden ? 'none' : 'auto',
//       }}
//     >
//       <AnimatedDetailsRightContainer
//         style={{
//           opacity: hideSpring.opacity.interpolate((v) => v),
//           transform: hideSpring.translateX.interpolate(
//             (v) => `translateX(${v}px)`,
//           ),
//           display: 'flex',
//           flexDirection: 'column',
//           justifyContent: 'space-between',
//         }}
//       >
//         <DetailsContent>
//           <TitleText>{title}</TitleText>
//         </DetailsContent>
//         <DetailsContent>
//           <DetailsText style={{ paddingTop: 48 }}>
//             <DetailsTextBold>{subTitle}</DetailsTextBold>
//           </DetailsText>
//         </DetailsContent>
//       </AnimatedDetailsRightContainer>
//     </AnimatedDetailsContainerWrapper>
//   );
// };

export const ArtworkTxCard: FC<ArtworkCardProps> = ({
  springStyles,
  gene,
  isHidden,
  style,
}) => {
  const hideSpring = useSpring({
    opacity: isHidden ? 0 : 1,
    translateX: isHidden ? -40 : 0,
  });

  const leftRightPos = useResponsiveAbsolutePositioning(250);

  return (
    <AnimatedDetailsContainerWrapper
      style={{
        ...springStyles,
        position: 'absolute',
        top: 25,
        left: leftRightPos,
        width: 250,
        pointerEvents: isHidden ? 'none' : 'auto',
        ...style,
      }}
    >
      <AnimatedDetailsContainer
        style={{
          opacity: hideSpring.opacity.interpolate((v) => v),
          transform: hideSpring.translateX.interpolate(
            (v) => `translateX(${v}px)`,
          ),
        }}
      >
        <DetailsContent>
          <DetailsText>
            <DetailsTextBold>BLOCK NUM</DetailsTextBold> {gene.blockNumber}
          </DetailsText>
        </DetailsContent>

        <DetailsContent>
          <DetailsTextAnchor
            href={`https://etherscan.io/tx/${gene.seed}`}
            target={'_blank'}
          >
            <DetailsTextBold>TXHASH</DetailsTextBold>
          </DetailsTextAnchor>
          <DetailsText>{gene.seed}</DetailsText>
        </DetailsContent>
      </AnimatedDetailsContainer>
    </AnimatedDetailsContainerWrapper>
  );
};

const ActionButton = styled(PrimaryButton)`
  font-size: 14px;
  font-weight: bold;
  padding: 16px 24px;
  text-transform: uppercase;
  width: 100%;
  :disabled {
    color: rgba(0, 0, 0, 0.1);
  }
  ::after {
    opacity: 1;
  }
`;

export const ArtworkOwnerCard: FC<ArtworkCardProps> = ({
  springStyles,
  gene,
  isHidden,
  displayType,
  style,
}) => {
  const { account } = useWallet();
  const tokenId = useTokenId(gene.seed);
  const { owner, mintingStatus } = useMinter(gene.seed);
  const ensName = useENSLookup(undefined);
  const leftRightPos = useResponsiveAbsolutePositioning(275);
  const isHiddenWithOwnerState = useMemo(() => {
    return (
      isHidden ||
      !owner ||
      mintingStatus === 'proud-owner' ||
      displayType === 'singular-detail'
    );
  }, [isHidden, mintingStatus, displayType, owner]);

  const hideSpring = useSpring({
    opacity: isHiddenWithOwnerState ? 0 : 1,
    translateX: isHiddenWithOwnerState ? 40 : 0,
  });

  const edNum = useMemo(() => {
    const n = getEditionFromTokenId(tokenId ?? '0');
    return !n ? '-' : `${n}`;
  }, [tokenId]);

  return (
    <AnimatedDetailsContainerWrapper
      style={{
        ...springStyles,
        position: 'absolute',
        bottom: 25,
        right: leftRightPos,
        width: 275,
        pointerEvents: isHiddenWithOwnerState ? 'none' : 'auto',
        ...style,
      }}
    >
      <AnimatedDetailsRightContainer
        style={{
          opacity: hideSpring.opacity.interpolate((v) => v),
          transform: hideSpring.translateX.interpolate(
            (v) => `translateX(${v}px)`,
          ),
        }}
      >
        <DetailsContent>
          <DetailsText>
            <DetailsTextBold style={{ fontSize: 28 }}>
              ED. {`${edNum}`}
            </DetailsTextBold>
          </DetailsText>
          <DetailsText style={{ paddingTop: 4 }}>
            <DetailsTextBold>
              {(() => {
                if (owner === undefined) {
                  return `Loading...`;
                }
                if (owner === account) {
                  return `Owner: you`;
                }
                return `Owner: ${ensName || shortenHexString(owner ?? '')}`;
              })()}
            </DetailsTextBold>
          </DetailsText>
        </DetailsContent>
        {/* <DetailsContent>
          <DetailsBottomWrapper>
            <DetailsTextAnchor
              onClick={() => track(ANALYTIC_EVENTS.CAROUSEL_CARD_CLICK_OPENSEA)}
              href={!!tokenId ? getOpenSeaUrl(tokenId) : '#'}
              target={'_blank'}
            >
              Opensea
            </DetailsTextAnchor>
            <DetailsTextAnchor
              onClick={() => track(ANALYTIC_EVENTS.CAROUSEL_CARD_CLICK_IPFS)}
              target={'_blank'}
            >
              IPFS
            </DetailsTextAnchor>
          </DetailsBottomWrapper>
        </DetailsContent> */}
      </AnimatedDetailsRightContainer>
    </AnimatedDetailsContainerWrapper>
  );
};

const StyledHelpIcon = styled(HelpIcon)`
  height: 14px;
  width: 14px;
  margin-left: 6px;
`;

const HelpIconWrapper = styled.div`
  position: relative;
  ::after {
    position: absolute;
    top: 20px;
    left: 6px;
    width: 125px;
    padding: 10px;
    font-size: 12px;
    content: 'Ensures mint will succeed. Excess ETH will be returned to you.';
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

const WineLabelContainer = styled(DetailsContent)`
  padding: 15px;
  background: #232323;
  display: flex;
  align-items: center;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  p {
    color: white;
  }
`;

const AnimatedWineLabelContainer = animated(WineLabelContainer);

const SignatureImage = styled.img`
  width: 100%;
`;

const SignatureImageContainer = styled.div`
  position: relative;
  padding-top: 16px;
`;

const HashTexture = styled.div`
  position: absolute;
  top: -40px;
  bottom: -40px;
  right: -40px;
  left: -40px;
  opacity: 0.05;
  z-index: 0;
  word-wrap: break-word;
  font-family: Bebas Neue;
  font-size: 81px;
  line-height: 81px;
  color: white;
  transform: rotate(45deg);
`;

export const ArtworkCelebrationCard: FC<ArtworkCardProps> = ({
  springStyles,
  gene,
  isHidden,
  displayType,
  style,
}) => {
  const tokenId = useTokenId(gene.seed);
  const owner = useOwnerByHash(gene.seed);
  const ensName = useENSLookup(undefined);

  const { mintingStatus } = useMinter(gene.seed);

  const isHiddenWithOwnerState = useMemo(() => {
    return (
      isHidden ||
      !owner ||
      mintingStatus !== 'proud-owner' ||
      displayType === 'singular-detail'
    );
  }, [isHidden, mintingStatus, owner, displayType]);

  const [isSignatureStill, setIsSignatureStill] = useState(false);
  const leftRightPos = useResponsiveAbsolutePositioning(300);

  useEffect(() => {
    setIsSignatureStill(isHiddenWithOwnerState);
  }, [isHiddenWithOwnerState]);

  const hideSpring = useSpring({
    opacity: isHiddenWithOwnerState ? 0 : 1,
    translateX: isHiddenWithOwnerState ? 40 : 0,
  });

  const edNum = useMemo(() => {
    const n = getEditionFromTokenId(tokenId ?? '0');
    return !n ? '-' : `${n}`;
  }, [tokenId]);

  const signatureUrl = useMemo(() => {
    return isSignatureStill ? '/signature.png' : '/signature.gif';
  }, [isSignatureStill]);

  return (
    <AnimatedDetailsContainerWrapper
      style={{
        ...springStyles,
        position: 'absolute',
        bottom: 25,
        right: leftRightPos,
        width: 300,
        pointerEvents: isHiddenWithOwnerState ? 'none' : 'auto',
        ...style,
      }}
    >
      <AnimatedDetailsRightContainer
        style={{
          opacity: hideSpring.opacity.interpolate((v) => v),
          transform: hideSpring.translateX.interpolate(
            (v) => `translateX(${v}px)`,
          ),
        }}
      >
        <AnimatedWineLabelContainer>
          <HashTexture>{gene.seed}</HashTexture>
          <DetailsTextFlexRow
            style={{
              paddingTop: 0,
              width: '100%',
              justifyContent: 'space-between',
            }}
          >
            <DetailsText style={{ fontSize: 14, fontWeight: 'bold' }}>
              ED. {`${edNum} `}
            </DetailsText>
            <DetailsText style={{ fontSize: 14, fontWeight: 'bold' }}>
              EST. {MINT_BLOCK_NUM}
            </DetailsText>
          </DetailsTextFlexRow>
          <SignatureImageContainer>
            <SignatureImage src={signatureUrl} />
          </SignatureImageContainer>
          <DetailsText style={{ fontWeight: 'bold', fontSize: 18 }}>
            &#x00D7;
          </DetailsText>
          <DetailsText
            style={{
              fontWeight: 'bold',
              fontSize: 24,
              paddingTop: 6,
            }}
          >
            {ensName || shortenHexString(owner ?? '')}
          </DetailsText>
        </AnimatedWineLabelContainer>
        {/* <DetailsContent>
          <ActionButton
            onClick={() => {
              track(ANALYTIC_EVENTS.CAROUSEL_CARD_CLICK_SHARE_CELEBRATION);
            }}
            disabled={false}
          >
            SHARE
          </ActionButton>
        </DetailsContent> */}
      </AnimatedDetailsRightContainer>
    </AnimatedDetailsContainerWrapper>
  );
};

export const ArtworkMintCard: FC<ArtworkCardProps> = ({
  springStyles,
  gene,
  isHidden,
  displayType,
  style,
}) => {
  const toggleWalletModal = useModalStore((s) => s.toggleIsWalletModalOpen);

  const { account, balance } = useWallet();
  const owner = useOwnerByHash(gene.seed);

  const isHiddenWithOwnerState = useMemo(() => {
    return isHidden || !!owner || displayType === 'singular-detail';
  }, [isHidden, owner]);

  const hideSpring = useSpring({
    opacity: isHiddenWithOwnerState ? 0 : 1,
    translateX: isHiddenWithOwnerState ? 40 : 0,
  });
  const leftRightPos = useResponsiveAbsolutePositioning(325);
  const formattedBalance = useMemo(() => {
    return ethers.utils.formatEther(balance).slice(0, 4);
  }, [balance]);

  const {
    mintArtwork,
    mintingPriceInWei,
    adjustedCurrentPriceToMintInWei,
    adjustedMaxIndex,
    mintingMaxIndex,
    isMintable,
    mintingStatus,
    mintingSlippageCount,
  } = useMinter(gene.seed);

  const buttonText = useMemo(() => {
    if (!account) {
      return 'CONNECT WALLET';
    }
    // if (mintingStatus === 'no-more-editions') {
    //   return 'NO MORE EDITIONS';
    // }
    if (mintingStatus === 'insufficient-balance') {
      return 'NOT ENOUGH ETH';
    }
    if (mintingStatus === 'in-progress') {
      return 'MINTING...';
    }
    if (
      mintingStatus === 'success' ||
      mintingStatus === 'proud-owner' ||
      mintingStatus === 'minted'
    ) {
      return 'MINTED';
    }
    if (mintingStatus === 'failed') {
      return 'ERROR. TRY AGAIN?';
    }
    if (mintingStatus === 'too-recent') {
      return '30 BLOCK CFM NEEDED';
    }
    if (mintingStatus === 'mintable') {
      return `MINT ${TOKEN_SYMBOL}`;
    }
    return '';
  }, [mintingStatus, account]);

  const formattedCurrentPriceInEth = useMemo(
    () =>
      ethers.utils.formatEther(
        mintingPriceInWei ?? adjustedCurrentPriceToMintInWei,
      ),
    [adjustedCurrentPriceToMintInWei, mintingPriceInWei],
  );

  return (
    <AnimatedDetailsContainerWrapper
      style={{
        ...springStyles,
        position: 'absolute',
        bottom: 25,
        right: leftRightPos,
        width: 325,
        pointerEvents: isHiddenWithOwnerState ? 'none' : 'auto',
        ...style,
      }}
    >
      <AnimatedDetailsRightContainer
        style={{
          opacity: hideSpring.opacity.interpolate((v) => v),
          transform: hideSpring.translateX.interpolate(
            (v) => `translateX(${v}px)`,
          ),
        }}
      >
        <DetailsContent>
          <DetailsText>
            <DetailsTextBold>MINT ED.</DetailsTextBold>
          </DetailsText>
          <DetailsText style={{ paddingTop: 0 }}>
            <DetailsTextBold style={{ fontSize: 32 }}>
              {`${mintingMaxIndex ?? adjustedMaxIndex}`}
            </DetailsTextBold>
          </DetailsText>
          <DetailsText style={{ paddingTop: 0, fontSize: 14 }}>
            1 TXHASH = 1 {TOKEN_SYMBOL} TOKEN
          </DetailsText>
        </DetailsContent>
        <DetailsContent style={{ paddingTop: 20 }}>
          <DetailsTextFlexRow style={{ justifyContent: 'space-between' }}>
            <DetailsText style={{ width: 'initial' }}>
              STARTING PRICE
            </DetailsText>
            <DetailsText>
              <DetailsTextBold>{FORMATTED_STARTING_PRICE} ETH</DetailsTextBold>
            </DetailsText>
          </DetailsTextFlexRow>
          <DetailsTextFlexRow
            style={{ paddingTop: 10, justifyContent: 'space-between' }}
          >
            <DetailsText style={{ width: 'initial' }}>PER ED.</DetailsText>
            <DetailsText>
              <DetailsTextBold>
                + ({FORMATTED_PRICE_PER_MINT} &#x00D7;{' '}
                {mintingMaxIndex ?? adjustedMaxIndex}) ETH
              </DetailsTextBold>
            </DetailsText>
          </DetailsTextFlexRow>
          {mintingSlippageCount !== 0 && (
            <DetailsTextFlexRow
              style={{ paddingTop: 10, justifyContent: 'space-between' }}
            >
              <DetailsTextFlexRow>
                <DetailsText>SLIPPAGE</DetailsText>
                <HelpIconWrapper>
                  <StyledHelpIcon />
                </HelpIconWrapper>
              </DetailsTextFlexRow>
              <DetailsText>
                <DetailsTextBold>
                  + ({FORMATTED_PRICE_PER_MINT} &#x00D7;{' '}
                  {MINTING_SLIPPAGE_COUNT}) ETH
                </DetailsTextBold>
              </DetailsText>
            </DetailsTextFlexRow>
          )}
        </DetailsContent>
        <DetailsContent
          style={{
            marginTop: 12,
            padding: '15px',
            background: '#F8F8F8',
          }}
        >
          <DetailsTextFlexRow style={{ justifyContent: 'space-between' }}>
            <div>
              <DetailsText style={{ opacity: 0.4, fontSize: 14 }}>
                <DetailsTextBold>PRICE</DetailsTextBold>
              </DetailsText>
              <DetailsText
                style={{ paddingTop: 4, opacity: 0.2, fontSize: 12 }}
              >
                <DetailsTextBold>
                  BAL: {account ? formattedBalance : '-'} ETH
                </DetailsTextBold>
              </DetailsText>
            </div>
            <DetailsText style={{ fontSize: 32 }}>
              <DetailsTextBold>
                {BigNumber.from(adjustedCurrentPriceToMintInWei).eq(ZERO)
                  ? 'FREE!'
                  : `${formattedCurrentPriceInEth} ETH`}
              </DetailsTextBold>
            </DetailsText>
          </DetailsTextFlexRow>
        </DetailsContent>
        <DetailsContent>
          <ActionButton
            onClick={() => {
              if (!account) {
                toggleWalletModal();
              } else {
                mintArtwork();
              }
            }}
            disabled={!isMintable && !!account}
          >
            {buttonText}
          </ActionButton>
        </DetailsContent>
      </AnimatedDetailsRightContainer>
    </AnimatedDetailsContainerWrapper>
  );
};

export const ArtworkColorsCard: FC<ArtworkCardProps> = ({
  springStyles,
  gene,
  isHidden,
  style,
}) => {
  const hideSpring = useSpring({
    opacity: isHidden ? 0 : 1,
    translateX: isHidden ? -40 : 0,
  });
  const leftRightPos = useResponsiveAbsolutePositioning(200);

  return (
    <AnimatedDetailsContainerWrapper
      style={{
        ...springStyles,
        position: 'absolute',
        bottom: 25,
        left: leftRightPos,
        width: 200,
        pointerEvents: isHidden ? 'none' : 'auto',
        ...style,
      }}
    >
      <AnimatedDetailsContainer
        style={{
          opacity: hideSpring.opacity.interpolate((v) => v),
          transform: hideSpring.translateX.interpolate(
            (v) => `translateX(${v}px)`,
          ),
          maxHeight: 500,
          overflow: 'auto',
        }}
      >
        <DetailsContent>
          <DetailsText>
            <DetailsTextBold>
              {`${gene.foreground.colorPalletes.length} ${maybePluralizeWord(
                'PALETTE',
                gene.foreground.colorPalletes.length,
              ).toUpperCase()}`}
            </DetailsTextBold>
          </DetailsText>
        </DetailsContent>
        {gene.foreground.colorPalletes.map((p: any, i: number) => {
          return (
            <ColorPallete
              key={`${gene.addresses[i]}-${i}-color-circle-content`}
              address={gene.addresses[i]}
              palette={p}
            />
          );
        })}
      </AnimatedDetailsContainer>
    </AnimatedDetailsContainerWrapper>
  );
};

const ColorPallete: FC<{ address: string; palette: any }> = ({
  address,
  palette,
}) => {
  return (
    <DetailsContent>
      <DetailsText
        style={{
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        <Link passHref href={`${ROUTES.HASH.PALETTE}/${address}`}>
          <DetailsTextAnchor>{shortenHexString(address)}</DetailsTextAnchor>
        </Link>
      </DetailsText>
      <DetailsColorPalleteWrapper>
        {palette.tintColors.map((c: string) => (
          <DetailsColorCircle key={`${address}-color-circle-${c}`} color={c} />
        ))}
      </DetailsColorPalleteWrapper>
    </DetailsContent>
  );
};
export const ArtworkFeaturesCard: FC<ArtworkCardProps> = ({
  springStyles,
  gene,
  isHidden,
  style,
  displayType,
}) => {
  const hideSpring = useSpring({
    opacity: isHidden ? 0 : 1,
    translateX: isHidden ? 40 : 0,
  });
  const leftRightPos = useResponsiveAbsolutePositioning(350);

  const attributes = useMemo(() => generateTokenAttributesFromGene(gene), [
    gene,
  ]);

  return (
    <AnimatedDetailsContainerWrapper
      style={{
        ...springStyles,
        position: 'absolute',
        top: displayType === 'singular-detail' ? undefined : 25,
        right: leftRightPos,
        width: 350,
        bottom: displayType === 'singular-detail' ? 25 : undefined,
        pointerEvents: isHidden ? 'none' : 'auto',
        ...style,
      }}
    >
      <AnimatedDetailsRightContainer
        style={{
          opacity: hideSpring.opacity.interpolate((v) => v),
          transform: hideSpring.translateX.interpolate(
            (v) => `translateX(${v}px)`,
          ),
        }}
      >
        <DetailsContent>
          <DetailsText>
            <DetailsTextBold>{`ARTWORK FEATURES`}</DetailsTextBold>
          </DetailsText>
        </DetailsContent>
        <DetailsContent>
          <DetailsText>
            {`GAS LIMIT ${gene.gasLimit} = `}
            <DetailsTextBold>
              {attributes.texture.display_value} texture
            </DetailsTextBold>
          </DetailsText>
          <DetailsText>
            {`GAS PRICE ${gene.gasPriceInGwei} GWEI = `}
            <DetailsTextBold>
              {attributes.quarters.display_value} grid
            </DetailsTextBold>
          </DetailsText>
          <DetailsText>
            {`NONCE ${gene.nonce} = `}
            <DetailsTextBold>
              {attributes.complexity.display_value} complexity
            </DetailsTextBold>
          </DetailsText>
          <DetailsText>
            {`VALUE ${gene.valueInEth} ETH = `}
            <DetailsTextBold>
              {attributes.size.display_value} size diversity
            </DetailsTextBold>
          </DetailsText>
          <DetailsText>
            {`${gene.leadingZeros} LEADING ${maybePluralizeWord(
              'ZERO',
              gene.leadingZeros,
            ).toUpperCase()} = `}
            <DetailsTextBold>
              {`${gene.foreground.colorPalletes.length} ${maybePluralizeWord(
                'palette',
                gene.foreground.colorPalletes.length,
              )}`}
            </DetailsTextBold>
          </DetailsText>
        </DetailsContent>
        <DetailsContent>
          <DetailsBottomWrapper>
            <DetailsTextAnchor
              href={WHAT_IS_ALL_NONSENSE_LINK}
              target={'_blank'}
              style={{ width: 125 }}
            >
              What is all this nonsense?
            </DetailsTextAnchor>
          </DetailsBottomWrapper>
        </DetailsContent>
      </AnimatedDetailsRightContainer>
    </AnimatedDetailsContainerWrapper>
  );
};
