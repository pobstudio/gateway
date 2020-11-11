import { FC } from 'react';
import {
  AnimatedDetailsContainer,
  ArtworkCardProps,
  DetailsTextAnchor,
  DetailsContent,
  DetailsText,
} from './common';
import { useAnalytics } from 'use-analytics';
import { SpanBold } from '../text';
import { ANALYTIC_EVENTS } from '../../constants/analytics';

export const ArtworkTxCard: FC<ArtworkCardProps> = ({ gene, isRight }) => {
  const { track } = useAnalytics();
  return (
    <AnimatedDetailsContainer isRight={isRight}>
      <DetailsContent>
        <DetailsText>
          <SpanBold>BLOCK NUM</SpanBold> {gene.blockNumber}
        </DetailsText>
      </DetailsContent>
      <DetailsContent>
        <DetailsTextAnchor
          onClick={() => track(ANALYTIC_EVENTS.CAROUSEL_CARD_CLICK_HASH)}
          href={`https://etherscan.io/tx/${gene.seed}`}
          target={'_blank'}
        >
          TXHASH
        </DetailsTextAnchor>
        <DetailsText>{gene.seed}</DetailsText>
      </DetailsContent>
    </AnimatedDetailsContainer>
  );
};
