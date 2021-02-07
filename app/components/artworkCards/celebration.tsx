import { FC, useMemo, useEffect } from 'react';
import {
  AnimatedDetailsContainer,
  ArtworkCardProps,
  DetailsTextAnchor,
  DetailsContent,
  DetailsTextBold,
  DetailsText,
} from './common';
import { useWeb3React } from '@web3-react/core';
import { useMinter } from '../../hooks/useMinter';
import { useTokenId } from '../../hooks/useTokenId';
import { shortenHexString } from '../../utils/hex';
import { getEditionFromTokenId } from '../../utils/token';
import { IPFS_GATEWAY_LINK, MINT_BLOCK_NUM } from '../../constants';
import { getOpenSeaUrl } from '../../utils/urls';
import { useOwnerByHash } from '../../hooks/useOwner';
import { useState } from 'react';
import styled from 'styled-components';
import { FlexEnds } from '../flex';
import { animated } from 'react-spring';

export const ArtworkCelebrationCard: FC<
  ArtworkCardProps & { isHidden?: boolean }
> = ({ gene, isRight, isHidden }) => {
  const tokenId = useTokenId(gene.seed);
  const owner = useOwnerByHash(gene.seed);

  const [isSignatureStill, setIsSignatureStill] = useState(false);

  useEffect(() => {
    setIsSignatureStill(isHidden ?? false);
  }, [isHidden]);

  const edNum = useMemo(() => {
    const n = getEditionFromTokenId(tokenId ?? '0');
    return !n ? '-' : `${n}`;
  }, [tokenId]);

  const signatureUrl = useMemo(() => {
    return isSignatureStill ? '/signature.png' : '/signature.gif';
  }, [isSignatureStill]);

  return (
    <AnimatedDetailsContainer isRight={isRight}>
      <AnimatedWineLabelContainer>
        <HashTexture>{gene.seed}</HashTexture>
        <FlexEnds
          style={{
            paddingTop: 0,
            width: '100%',
          }}
        >
          <DetailsText style={{ fontSize: 14, fontWeight: 'bold' }}>
            NO. {`${edNum} `}
          </DetailsText>
          <DetailsText style={{ fontSize: 14, fontWeight: 'bold' }}>
            EST. {MINT_BLOCK_NUM}
          </DetailsText>
        </FlexEnds>
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
          {shortenHexString(owner ?? '')}
        </DetailsText>
        <FlexEnds
          style={{
            paddingTop: 16,
            opacity: 0.5,
            width: '100%',
          }}
        >
          <DetailsTextAnchor
            href={!!tokenId ? getOpenSeaUrl(tokenId) : '#'}
            target={'_blank'}
            style={{ fontSize: 14, fontWeight: 'bold', color: 'white' }}
          >
            Opensea
          </DetailsTextAnchor>
          <DetailsTextAnchor
            href={`${IPFS_GATEWAY_LINK}`}
            target={'_blank'}
            style={{ fontSize: 14, fontWeight: 'bold', color: 'white' }}
          >
            IPFS
          </DetailsTextAnchor>
        </FlexEnds>
      </AnimatedWineLabelContainer>
    </AnimatedDetailsContainer>
  );
};

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
