import React from 'react';
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from 'next';
import styled, { keyframes } from 'styled-components';
import { useRef } from 'react';
import { DIMENSIONS, sketch } from '@pob/sketches';
import { useEffect } from 'react';
import { useState } from 'react';
import { useMountedState } from 'react-use';
import { TX_HASH_REGEX } from '../../../utils/regex';
import { FlexCenter, FlexCenterColumn } from '../../../components/flex';
import { getArtworkPreviewUrl } from '../../../utils/urls';
import { has } from 'lodash';

const OpenGraphContainer = styled.div`
  width: 1200px;
  height: 627px;
  position: relative;
`;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { hash, title, subtitle } = context.query;

  if (!hash || !title) {
    return {
      notFound: true,
    };
  }

  if (!TX_HASH_REGEX.test(hash as string)) {
    return {
      notFound: true,
    };
  }

  // prefetches artwork to make it faster on client side
  if (!!hash) {
    await fetch(getArtworkPreviewUrl(hash as string));
  }

  return {
    props: { hash, title, subtitle: subtitle ?? '' },
  };
};

const CardImageBackground = styled.img`
  position: absolute;
  top: 0px;
  right: -0px;
  left: 0px;
  bottom: 0px;
  z-index: 0;
  width: 100%;
  object-fit: cover;
  display: block;
`;

const SmallCardForeground = styled.div.attrs({
  className: 'small-card-foreground',
})`
  position: absolute;
  top: 80px;
  right: 80px;
  left: 80px;
  bottom: 80px;
  padding: 48px;
  background: white;
  box-shadow: 8px 8px 0px #000000;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const CollectionTitle = styled.h2`
  margin: 0;
  font-size: 112px;
  color: black;
  font-weight: bold;
  text-align: center;
`;

const CollectionSubTitle = styled.h4`
  margin: 0;
  font-size: 48px;
  color: black;
  font-weight: bold;
  justify-content: center;
`;

const PreviewPage: NextPage = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) => {
  const { hash, title, subtitle } = props;
  return (
    <OpenGraphContainer>
      <CardImageBackground src={getArtworkPreviewUrl(hash)} />
      <SmallCardForeground>
        <FlexCenterColumn>
          <CollectionTitle style={{ flexGrow: 1 }}>{title}</CollectionTitle>
          {subtitle && <CollectionSubTitle>{subtitle}</CollectionSubTitle>}
        </FlexCenterColumn>
      </SmallCardForeground>
    </OpenGraphContainer>
  );
};

export default React.memo(PreviewPage);
