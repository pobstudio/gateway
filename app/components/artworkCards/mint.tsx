import { FC, useMemo } from 'react';
import {
  AnimatedDetailsContainer,
  ArtworkCardProps,
  DetailsActionButton,
  DetailsContent,
  DetailsTextBold,
  DetailsText,
} from './common';
import { useWeb3React } from '@web3-react/core';
import { MINTING_SLIPPAGE_COUNT, useMinter } from '../../hooks/useMinter';
import { useTokenId } from '../../hooks/useTokenId';
import { shortenHexString } from '../../utils/hex';
import { getEditionFromTokenId } from '../../utils/token';
import {
  IPFS_GATEWAY_LINK,
  WHAT_IS_ALL_NONSENSE_LINK,
  ZERO,
} from '../../constants';
import { getOpenSeaUrl } from '../../utils/urls';
import { maybePluralizeWord } from '../../utils/words';
import { generateTokenAttributesFromGene } from '@pob/sketches';
import { SpanBold } from '../text';
import styled from 'styled-components';
import { MintingGraph } from '../mintingGraph';
import { useModalStore } from '../../stores/modal';
import {
  FLAT_PRICE_UP_TO,
  FORMATTED_PRICE_PER_MINT,
  TOKEN_SYMBOL,
  useTokensStore,
} from '../../stores/tokens';
import { BigNumber, ethers } from 'ethers';
import { useOwnerByHash } from '../../hooks/useOwner';
import { FlexEnds } from '../flex';

const StyledMintingGraph = styled(MintingGraph)`
  width: 100%;
`;

export const ArtworkMintCard: FC<ArtworkCardProps> = ({ gene, isRight }) => {
  const toggleWalletModal = useModalStore((s) => s.toggleIsWalletModalOpen);

  const { account } = useWeb3React();

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
      return `MINT ${TOKEN_SYMBOL} NO. ${mintingMaxIndex ?? adjustedMaxIndex}`;
    }
    return '';
  }, [mintingMaxIndex, adjustedMaxIndex, mintingStatus, account]);

  const formattedCurrentPriceInEth = useMemo(
    () =>
      ethers.utils.formatEther(
        mintingPriceInWei ?? adjustedCurrentPriceToMintInWei,
      ),
    [adjustedCurrentPriceToMintInWei, mintingPriceInWei],
  );

  const maxIndex = useTokensStore((s) => s.maxIndex);

  return (
    <AnimatedDetailsContainer isRight={isRight}>
      <DetailsContent>
        {/* <StyledMintingGraph
          currentMintEdNum={mintingMaxIndex ?? adjustedMaxIndex}
        /> */}
        <DetailsTextBold style={{ fontSize: 24 }}>
          {maxIndex} $HASH MINTED
        </DetailsTextBold>
        <DetailsText>*EARLY SUPPORTER PRICING*</DetailsText>
        <DetailsText style={{ opacity: 0.2 }}>
          After {FLAT_PRICE_UP_TO} $HASH are minted, price grows by{' '}
          {FORMATTED_PRICE_PER_MINT} ETH for each mint.
        </DetailsText>
      </DetailsContent>
      <DetailsContent>
        <DetailsText>1 TX HASH = 1 $HASH NO. X</DetailsText>
        <DetailsText style={{ paddingTop: 4, fontSize: 14 }}>
          Each {TOKEN_SYMBOL} represents a tx. Once minted, no other $HASH token
          can represent the tx.
        </DetailsText>
      </DetailsContent>

      <DetailsContent
        style={{
          marginTop: 12,
          padding: '15px',
          background: '#F8F8F8',
        }}
      >
        <FlexEnds>
          <div>
            <DetailsTextBold style={{ opacity: 0.4, fontSize: 14 }}>
              PRICE
            </DetailsTextBold>
            {mintingSlippageCount !== 0 && (
              <HelpWrapper>
                <DetailsText
                  style={{ paddingTop: 4, opacity: 0.2, fontSize: 12 }}
                >
                  <DetailsTextBold>
                    + ({FORMATTED_PRICE_PER_MINT} &#x00D7;{' '}
                    {mintingSlippageCount}) ETH
                  </DetailsTextBold>
                </DetailsText>
              </HelpWrapper>
            )}
          </div>
          <DetailsText style={{ fontSize: 32 }}>
            <DetailsTextBold>
              {BigNumber.from(adjustedCurrentPriceToMintInWei).eq(ZERO)
                ? 'FREE!'
                : `${formattedCurrentPriceInEth} ETH`}
            </DetailsTextBold>
          </DetailsText>
        </FlexEnds>
      </DetailsContent>
      <DetailsContent>
        <DetailsActionButton
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
        </DetailsActionButton>
      </DetailsContent>
    </AnimatedDetailsContainer>
  );
};

const HelpWrapper = styled.div<{ helpContent?: string }>`
  position: relative;
  ::after {
    z-index: 2;
    position: absolute;
    top: 20px;
    right: 0px;
    width: 125px;
    padding: 10px;
    font-size: 12px;
    background: black;
    color: white;
    opacity: 0;
    pointer-events: none;
    transition: all 250ms ease-in-out;
    transform: translateY(-10px);
    content: '${(p) =>
      p.helpContent ??
      'Ensures mint will succeed. Excess ETH will be returned to you.'}';
  }
  :hover {
    ::after {
      opacity: 1;
      transform: translateY(0px);
    }
  }
`;
