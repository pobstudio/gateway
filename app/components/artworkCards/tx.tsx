import { FC } from 'react';
import {
  AnimatedDetailsContainer,
  ArtworkCardProps,
  DetailsTextAnchor,
  DetailsContent,
  DetailsText,
} from './common';
import { SpanBold } from '../text';

export const ArtworkTxCard: FC<ArtworkCardProps> = ({ gene, isRight }) => {
  return (
    <AnimatedDetailsContainer isRight={isRight}>
      <DetailsContent>
        <DetailsText>
          <SpanBold>BLOCK NUM</SpanBold> {gene.blockNumber}
        </DetailsText>
      </DetailsContent>
      <DetailsContent>
        <DetailsTextAnchor
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
