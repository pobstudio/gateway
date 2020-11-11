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
import { IPFS_GATEWAY_LINK, WHAT_IS_ALL_NONSENSE_LINK } from '../../constants';
import { getOpenSeaUrl } from '../../utils/urls';
import { maybePluralizeWord } from '../../utils/words';
import { generateTokenAttributesFromGene } from '@pob/sketches';
import { SpanBold } from '../text';
import { useContractName } from '../../hooks/useContractName';
import { ROUTES } from '../../constants/routes';
import Link from 'next/link';
import styled from 'styled-components';
import { BREAKPTS } from '../../styles';
import { getContrast } from 'polished';

export const ArtworkColorsCard: FC<ArtworkCardProps> = ({ gene, isRight }) => {
  const { track } = useAnalytics();

  return (
    <AnimatedDetailsContainer
      isRight={isRight}
      style={{
        maxHeight: 500,
        overflow: 'auto',
      }}
    >
      <DetailsContent>
        <DetailsTextBold>
          {`${gene.foreground.colorPalletes.length} ${maybePluralizeWord(
            'PALETTE',
            gene.foreground.colorPalletes.length,
          ).toUpperCase()}`}
        </DetailsTextBold>
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
  );
};

const ColorPallete: FC<{ address: string; palette: any }> = ({
  address,
  palette,
}) => {
  const { track } = useAnalytics();
  const contractName = useContractName(address);
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
          <DetailsTextAnchor
            onClick={() =>
              track(ANALYTIC_EVENTS.CAROUSEL_CARD_CLICK_PALLETE, {
                address,
              })
            }
          >
            {contractName?.slice(0, 18) ?? shortenHexString(address)}
          </DetailsTextAnchor>
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
