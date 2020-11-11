import { BigNumber, ethers } from 'ethers';
import { useState } from 'react';
import { useCallback } from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';
import { useMemo } from 'react';
import { FC } from 'react';
import { useMouse } from 'react-use';
import styled from 'styled-components';
import { useBlockchainStore } from '../stores/blockchain';
import {
  FLAT_PRICE_UP_TO,
  FORMATTED_PRICE_PER_MINT,
  FORMATTED_STARTING_PRICE,
  PRICE_PER_MINT,
  STARTING_PRICE,
  useTokensStore,
} from '../stores/tokens';

const AxisLabel = styled.p`
  padding: 0;
  margin: 0;
  word-wrap: break-word;
  font-size: 12px;
`;

const AxisRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DetailsText = styled.p`
  padding: 0;
  margin: 0;
  word-wrap: break-word;
  font-size: 16px;
`;

const DetailsTextBold = styled.span`
  font-weight: 600;
`;

const MintingGraphContainer = styled.div`
  position: relative;
`;

const TopLeftContent = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
`;

const BottomRightContent = styled.div`
  position: absolute;
  right: 0px;
  bottom: 0px;
  background: rgb(248, 248, 248);
`;

const HEIGHT = 166;
const WIDTH = 350;

const MAX_MINT_SHOWN = 1100;
const getYOnLineFromX = (x: number) => HEIGHT * (x / WIDTH);

const getXFromMintEdNum = (mintEdNum: number) =>
  (mintEdNum / MAX_MINT_SHOWN) * WIDTH;

const transformPosToSvgSpace = (pos: [number, number]) => [
  pos[0],
  HEIGHT - pos[1],
];

export const MintingGraph: FC<{
  className?: string;
  currentMintEdNum: number;
}> = ({ currentMintEdNum, className }) => {
  const ref = useRef(null);
  const { elX } = useMouse(ref);

  const maxIndex = useTokensStore((s) => s.maxIndex);

  const posForMintEdNum = useMemo(() => {
    const x = getXFromMintEdNum(currentMintEdNum);
    const y = getYOnLineFromX(x);
    return transformPosToSvgSpace([x, y]);
  }, [currentMintEdNum]);
  const [mouseMintEd, setMouseMintEd] = useState<number | undefined>(undefined);

  useEffect(() => {
    const mouseMintEd = Math.round((elX / WIDTH) * MAX_MINT_SHOWN);
    setMouseMintEd(mouseMintEd);
  }, [elX]);

  const [isHover, setIsHover] = useState(false);

  const onMouseEnter = useCallback((e: any) => {
    setIsHover(true);
  }, []);
  const onMouseLeave = useCallback((e: any) => {
    setIsHover(false);
  }, []);

  const posForMouseMintEdNum = useMemo(() => {
    if (!mouseMintEd || !isHover) {
      return undefined;
    }
    const x = getXFromMintEdNum(mouseMintEd);
    const y = getYOnLineFromX(x);
    return transformPosToSvgSpace([x, y]);
  }, [mouseMintEd]);

  const adjustedPriceToMintInWei = useMemo(() => {
    if (!mouseMintEd || !isHover) {
      return undefined;
    }
    return BigNumber.from(mouseMintEd === 0 ? 0 : mouseMintEd - 1)
      .mul(PRICE_PER_MINT)
      .add(STARTING_PRICE)
      .toString();
  }, [mouseMintEd]);

  const formattedAdjustedPriceToMintInWei = useMemo(
    () =>
      !adjustedPriceToMintInWei
        ? undefined
        : ethers.utils.formatEther(adjustedPriceToMintInWei),
    [adjustedPriceToMintInWei],
  );

  return (
    <MintingGraphContainer ref={ref}>
      <TopLeftContent>
        <DetailsText style={{ opacity: 1 }}>
          <DetailsTextBold>{maxIndex}</DetailsTextBold> $HASH MINTED
        </DetailsText>
        {isHover && (
          <DetailsText style={{ paddingTop: 4, opacity: 0.5, fontSize: 12 }}>
            Mint early. The price grows after {FLAT_PRICE_UP_TO} $HASH tokens
            are minted.
          </DetailsText>
        )}
      </TopLeftContent>
      <svg
        className={className}
        width={`${WIDTH}`}
        height={`${HEIGHT}`}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <path d={`M${WIDTH} 1V166H1L${WIDTH} 1Z`} fill="url(#paint0_linear)" />
        <line
          x1="0.754658"
          y1="165.564"
          x2={`${WIDTH - 0.245}`}
          y2="0.564337"
          stroke="black"
        />
        <line
          x1={posForMintEdNum[0]}
          y1={posForMintEdNum[1]}
          x2={posForMintEdNum[0]}
          y2={HEIGHT}
          stroke="black"
        />
        <circle
          cx={posForMintEdNum[0]}
          cy={posForMintEdNum[1]}
          r="6"
          fill="white"
          stroke="black"
        />
        <circle
          cx={posForMintEdNum[0]}
          cy={posForMintEdNum[1]}
          r="2.5"
          fill="black"
        />
        {posForMouseMintEdNum && (
          <>
            <line
              x1={posForMouseMintEdNum[0]}
              y1={posForMouseMintEdNum[1]}
              x2={posForMouseMintEdNum[0]}
              y2={HEIGHT}
              stroke="black"
            />
            <circle
              cx={posForMouseMintEdNum[0]}
              cy={posForMouseMintEdNum[1]}
              r="6"
              fill="white"
              stroke="black"
            />
          </>
        )}

        <defs>
          <linearGradient
            id="paint0_linear"
            x1="141"
            y1="1"
            x2="141.5"
            y2="145"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopOpacity="0.15" />
            <stop offset="1" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      <AxisRow>
        <AxisLabel>NO. 1</AxisLabel>
        <AxisLabel>
          {formattedAdjustedPriceToMintInWei ? (
            <>
              PRICE AT NO. {mouseMintEd} ={' '}
              <DetailsTextBold>
                {formattedAdjustedPriceToMintInWei} ETH
              </DetailsTextBold>
            </>
          ) : (
            <>NO. &#8734;</>
          )}
        </AxisLabel>
      </AxisRow>
    </MintingGraphContainer>
  );
};
