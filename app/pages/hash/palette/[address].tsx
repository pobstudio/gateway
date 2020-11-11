import React from 'react';
import {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from 'next';
import { ContentWrapper, MainContent } from '../../../components/content';
import { Header } from '../../../components/header';
import styled from 'styled-components';
import { getContrast } from 'polished';

import { generateColorPalleteFromAddress } from '@pob/sketches';
import { ADDRESS_REGEX } from '../../../utils/regex';
import { FC } from 'react';
import { useCopyToClipboard } from 'react-use';
import { useState } from 'react';
import { useEffect } from 'react';
import { NextSeo } from 'next-seo';
import { BREAKPTS } from '../../../styles';
import { ROUTES } from '../../../constants/routes';
import { POB_PROD_LINK } from '../../../constants';
import { useMemo } from 'react';
import { useRouter } from 'next/router';

const ColorPalleteWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f8f8;
  @media (max-width: ${BREAKPTS.SM}px) {
    padding: 16px;
  }
`;

const ColorPalleteContent = styled.div`
  max-width: 900px;
  padding: 64px 36px;
  background: white;
  box-shadow: 4px 4px 0px #000000;
  @media (max-width: ${BREAKPTS.SM}px) {
    max-width: 100%;
    padding: 24px 18px;
  }
`;

const PalleteText = styled.p`
  margin: 0;
  font-weight: 600;
  text-align: right;
  font-size: 20px;
  @media (max-width: ${BREAKPTS.SM}px) {
    font-size: 16px;
  }
`;

const AddressText = styled.h1`
  margin: 0;
  font-family: Bebas Neue;
  font-style: normal;
  font-weight: normal;
  font-size: 72px;
  line-height: 80px;
  text-align: right;
  word-wrap: break-word;
  @media (max-width: ${BREAKPTS.SM}px) {
    font-size: 36px;
    line-height: 44px;
  }
`;

const ColorsWrapper = styled.div`
  display: flex;
  padding-top: 16px;
  justify-content: flex-end;
  div + div {
    margin-left: 24px;
    @media (max-width: ${BREAKPTS.SM}px) {
      margin-left: 8px;
    }
  }
`;

const ColorCircle = styled.div<{ color: string }>`
  width: 144px;
  height: 144px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: ${(p) =>
    getContrast(p.color, '#FFFFFF') <= 1.1 ? '1px solid #000' : 'none'};
  background: ${(props) => props.color};
  &:hover {
    .color-text {
      transform: scale(1.1);
    }
  }
  @media (max-width: ${BREAKPTS.SM}px) {
    width: 72px;
    height: 72px;
  }
`;

const ColorText = styled.p.attrs({ className: 'color-text' })<{
  color: string;
}>`
  margin: 0;
  font-weight: bold;
  transition: transform 150ms ease-in-out;
  transform: scale(1);
  color: ${(props) =>
    getContrast('#000', props.color) > getContrast('#FFF', props.color)
      ? '#000'
      : '#FFF'};
  @media (max-width: ${BREAKPTS.SM}px) {
    font-size: 14px;
  }
`;

const Color: FC<{ color: string }> = ({ color }) => {
  const [, copyToClipboard] = useCopyToClipboard();
  const [copied, setCopied] = useState<boolean>(false);
  useEffect(() => {
    let clearToken: number | undefined = undefined;
    if (copied) {
      clearToken = setTimeout(() => {
        setCopied(false);
      }, 5000);
    }
    return () => {
      clearTimeout(clearToken);
    };
  }, [copied]);

  return (
    <ColorCircle
      onClick={() => {
        copyToClipboard(color);
        setCopied(true);
      }}
      key={`color-circle-${color}`}
      color={color}
    >
      <ColorText color={color}>{copied ? 'Copied!' : color}</ColorText>
    </ColorCircle>
  );
};

const PalletesPage: NextPage = (x) => {
  const router = useRouter();
  const address = useMemo(() => {
    return router.query.address;
  }, [router.query]);

  const isValidAddress = useMemo(() => {
    return !!address && ADDRESS_REGEX.test(address as string);
  }, [address]);

  const colorsData = useMemo(() => {
    if (!isValidAddress) {
      return undefined;
    }
    return generateColorPalleteFromAddress(address as string);
  }, [address]);

  return (
    <>
      {colorsData && (
        <>
          <NextSeo
            title={`POB - Palette ${
              colorsData.palleteIndex === -1 ? '' : colorsData.palleteIndex
            }`}
            description={'Color palette used to generate artworks'}
            openGraph={{
              type: 'website',
              locale: 'en_US',
              url: `${POB_PROD_LINK}${ROUTES.HASH.PALETTE}/${address}`,
              title: `POB - Palette ${
                colorsData.palleteIndex === -1 ? '' : colorsData.palleteIndex
              }`,
              description: 'Color palette used to generate artworks',
              site_name: 'POB',
              images: [],
            }}
            twitter={{
              handle: '@prrfbeauty',
              site: '@prrfbeauty',
              cardType: 'summary_large_image',
            }}
            additionalMetaTags={[
              {
                name: 'twitter:url',
                content: `${POB_PROD_LINK}${ROUTES.HASH.PALETTE}/${address}`,
              },
            ]}
          />
          <ContentWrapper>
            <Header />
            <MainContent>
              <ColorPalleteWrapper>
                <ColorPalleteContent>
                  <PalleteText>
                    {colorsData.palleteIndex === -1
                      ? 'Unique Palette'
                      : `Palette ${`${colorsData.palleteIndex}`.padStart(
                          5,
                          '0',
                        )}`}
                  </PalleteText>
                  <AddressText>{address}</AddressText>
                  <ColorsWrapper>
                    {colorsData.colors.map((c: string, i: number) => (
                      <Color color={c} key={`color-circle${c}-${i}`} />
                    ))}
                  </ColorsWrapper>
                </ColorPalleteContent>
              </ColorPalleteWrapper>
            </MainContent>
          </ContentWrapper>
        </>
      )}
    </>
  );
};

export default React.memo(PalletesPage);
