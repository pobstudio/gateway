import { FC, useMemo } from 'react';
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
import { IPFS_GATEWAY_LINK, WHAT_IS_ALL_NONSENSE_LINK } from '../../constants';
import { getOpenSeaUrl } from '../../utils/urls';
import { maybePluralizeWord } from '../../utils/words';
import { generateTokenAttributesFromGene } from '@pob/sketches';
import { SpanBold } from '../text';

export const ArtworkFeaturesCard: FC<ArtworkCardProps> = ({
  gene,
  isRight,
}) => {
  const attributes = useMemo(() => generateTokenAttributesFromGene(gene), [
    gene,
  ]);

  return (
    <AnimatedDetailsContainer isRight={isRight}>
      <DetailsContent>
        <DetailsTextBold>{`ARTWORK FEATURES`}</DetailsTextBold>
      </DetailsContent>
      <DetailsContent>
        <DetailsText>
          {`GAS LIMIT ${gene.gasLimit} = `}
          <SpanBold>{attributes.texture.display_value} texture</SpanBold>
        </DetailsText>
        <DetailsText>
          {`GAS PRICE ${gene.gasPriceInGwei} GWEI = `}
          <SpanBold>{attributes.quarters.display_value} grid</SpanBold>
        </DetailsText>
        <DetailsText>
          {`NONCE ${gene.nonce} = `}
          <SpanBold>{attributes.complexity.display_value} complexity</SpanBold>
        </DetailsText>
        <DetailsText>
          {`VALUE ${gene.valueInEth} ETH = `}
          <SpanBold>{attributes.size.display_value} size diversity</SpanBold>
        </DetailsText>
        <DetailsText>
          {`${gene.leadingZeros} LEADING ${maybePluralizeWord(
            'ZERO',
            gene.leadingZeros,
          ).toUpperCase()} = `}
          <SpanBold>
            {`${gene.foreground.colorPalletes.length} ${maybePluralizeWord(
              'palette',
              gene.foreground.colorPalletes.length,
            )}`}
          </SpanBold>
        </DetailsText>
      </DetailsContent>
      <DetailsContent>
        <DetailsTextAnchor
          href={WHAT_IS_ALL_NONSENSE_LINK}
          target={'_blank'}
          style={{ width: 125 }}
        >
          What is all this nonsense?
        </DetailsTextAnchor>
      </DetailsContent>
    </AnimatedDetailsContainer>
  );
};
