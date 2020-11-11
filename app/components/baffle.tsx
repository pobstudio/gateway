import findIndex from 'lodash/findIndex';
import { FC, useMemo } from 'react';
import { useSpring, animated } from 'react-spring';
import { usePrevious } from 'react-use';
import styled from 'styled-components';
import { SPRING_CONFIG } from '../constants';

const BaffleWrapper = styled.div``;

const BaffleText = styled.h1`
  font-family: Bebas Neue;
  font-style: normal;
  font-weight: normal;
  font-size: 81px;
  line-height: 100px;
  text-align: right;
  word-wrap: break-word;
  color: rgba(0, 0, 0, 0.1);
`;

const AnimatedBaffleText = animated(BaffleText);

const baffleHexStr = [...'0123456789ABCDEFX'];
const baffleStandardStr = [...'0123456789ABCDEFGHIJKLMNOPQRSTUVXYWZ'];

const isHexStr = (text: string) => text.startsWith('0x');

export const Baffle: FC<{ children: string }> = ({ children }) => {
  const previousText = usePrevious(children as string);
  const baffleStr = useMemo(() => {
    return baffleHexStr;
    return !isHexStr(previousText ?? '') || !isHexStr(children)
      ? baffleStandardStr
      : baffleHexStr;
  }, [previousText, children]);

  const characterIndexes = useMemo(() => {
    return [...children.toUpperCase()].map((c) =>
      findIndex(baffleStr, (b) => b === c),
    );
  }, [children]);

  const { ci } = useSpring({ ci: characterIndexes, config: SPRING_CONFIG });

  return (
    <BaffleWrapper style={{ width: '100%' }}>
      <AnimatedBaffleText>
        {ci.interpolate(
          (...vs) =>
            `${vs
              .map((v) => baffleStr[Math.floor((v as unknown) as number)])
              .join('')}`,
        )}
      </AnimatedBaffleText>
    </BaffleWrapper>
  );
};
