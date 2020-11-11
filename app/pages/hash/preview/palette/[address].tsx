import React from 'react';
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from 'next';
import styled from 'styled-components';
import { getContrast } from 'polished';

import { generateColorPalleteFromAddress } from '@pob/sketches';
import { ADDRESS_REGEX } from '../../../../utils/regex';
import { FC } from 'react';

const ColorPalleteWrapper = styled.div`
  width: 1200px;
  height: 627px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f8f8;
`;

const ColorPalleteContent = styled.div`
  max-width: 900px;
  padding: 64px 36px;
  transform: scale(1.3);
`;

const PalleteText = styled.p`
  margin: 0;
  font-weight: 600;
  text-align: right;
  font-size: 20px;
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
`;

const ColorsWrapper = styled.div`
  display: flex;
  padding-top: 16px;
  justify-content: flex-end;
  div + div {
    margin-left: 24px;
  }
`;

const ColorCircle = styled.div<{ color: string }>`
  width: 144px;
  height: 144px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => props.color};
  &:hover {
    .color-text {
      transform: scale(1.1);
    }
  }
`;

const ColorText = styled.p.attrs({ className: 'color-text' })<{
  color: string;
}>`
  margin: 0;
  font-size: 28px;
  font-weight: bold;
  transition: transform 150ms ease-in-out;
  transform: scale(1);
  color: ${(props) =>
    getContrast('#000', props.color) > getContrast('#FFF', props.color)
      ? '#000'
      : '#FFF'};
`;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { address } = context.query;
  if (!address || !ADDRESS_REGEX.test(address as string)) {
    return {
      notFound: true,
    };
  }
  const colorsData = generateColorPalleteFromAddress(address as string);
  return {
    props: {
      ...colorsData,
      address: address as string,
    },
  };
};

const Color: FC<{ color: string }> = ({ color }) => {
  return (
    <ColorCircle key={`color-circle-${color}`} color={color}>
      <ColorText color={color}>{color}</ColorText>
    </ColorCircle>
  );
};

const PalletesPage: NextPage = ({
  address,
  palleteIndex,
  colors,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <ColorPalleteWrapper>
      <ColorPalleteContent>
        <AddressText>{address}</AddressText>
        <ColorsWrapper>
          {colors.map((c: string, i: number) => (
            <Color color={c} key={`color-circle${c}-${i}`} />
          ))}
        </ColorsWrapper>
      </ColorPalleteContent>
    </ColorPalleteWrapper>
  );
};

export default React.memo(PalletesPage);
