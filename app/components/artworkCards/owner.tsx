import { FC, useMemo } from 'react';
import {
  AnimatedDetailsContainer,
  ArtworkCardProps,
  DetailsTextAnchor,
  DetailsContent,
  DetailsTextBold,
  DetailsText,
} from './common';
import { useAnalytics } from 'use-analytics';
import { useWeb3React } from '@web3-react/core';
import { ANALYTIC_EVENTS } from '../../constants/analytics';
import { useMinter } from '../../hooks/useMinter';
import { useTokenId } from '../../hooks/useTokenId';
import { shortenHexString } from '../../utils/hex';
import { getEditionFromTokenId } from '../../utils/token';
import { IPFS_GATEWAY_LINK } from '../../constants';
import { getOpenSeaUrl } from '../../utils/urls';
import { FlexEnds } from '../flex';

export const ArtworkOwnerCard: FC<ArtworkCardProps> = ({ gene, isRight }) => {
  const { track } = useAnalytics();
  const { account } = useWeb3React();
  const tokenId = useTokenId(gene.seed);
  const { owner } = useMinter(gene.seed);

  const edNum = useMemo(() => {
    const n = getEditionFromTokenId(tokenId ?? '0');
    return !n ? '-' : `${n}`;
  }, [tokenId]);

  return (
    <AnimatedDetailsContainer isRight={isRight}>
      <DetailsContent>
        <DetailsTextBold style={{ fontSize: 28 }}>
          NO. {`${edNum}`}
        </DetailsTextBold>
        <DetailsTextBold style={{ paddingTop: 4 }}>
          {(() => {
            if (owner === undefined) {
              return `Loading...`;
            }
            if (owner === account) {
              return `Owner: you`;
            }
            return `Owner: ${shortenHexString(owner ?? '')}`;
          })()}
        </DetailsTextBold>
      </DetailsContent>
      <DetailsContent>
        <FlexEnds>
          <DetailsTextAnchor
            onClick={() => track(ANALYTIC_EVENTS.CAROUSEL_CARD_CLICK_OPENSEA)}
            href={!!tokenId ? getOpenSeaUrl(tokenId) : '#'}
            target={'_blank'}
          >
            Opensea
          </DetailsTextAnchor>
          <DetailsTextAnchor
            href={`${IPFS_GATEWAY_LINK}`}
            onClick={() => track(ANALYTIC_EVENTS.CAROUSEL_CARD_CLICK_IPFS)}
            target={'_blank'}
          >
            IPFS
          </DetailsTextAnchor>
        </FlexEnds>
      </DetailsContent>
    </AnimatedDetailsContainer>
  );
};
