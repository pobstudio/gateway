import { GeneWithTxData } from '@pob/sketches';
import { responsePathAsArray } from 'graphql';
import { ReactNode } from 'react';
import { FC } from 'react';
import { useMemo } from 'react';
import { animated, useSpring } from 'react-spring';
import { useWindowSize } from 'react-use';
import styled from 'styled-components';
import { BREAKPTS } from '../../styles';
import { PrimaryButton } from '../button';

export interface ArtworkCardProps {
  gene: GeneWithTxData;
  isRight?: boolean;
}

export type ArtworkCardAbsoluteCorner =
  | 'topLeft'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomRight';

export interface ArtworkCardAbsoluteProps {
  children: ReactNode;
  style?: any;
  isHidden?: boolean;
  contentWidth: number;
  corner?: ArtworkCardAbsoluteCorner;
}

const useResponsiveAbsolutePositioning = (contentWidth: number) => {
  const { width } = useWindowSize();
  const isMD = useMemo(() => width <= BREAKPTS.MD, [width]);
  const isLG = useMemo(() => width <= BREAKPTS.LG, [width]);
  return useMemo(() => {
    if (isLG && !isMD) {
      return -32;
    }
    if (isMD) {
      return -16;
    }
    return -1 * (contentWidth - 120);
  }, [isMD, isLG]);
};

const AbsoluteContainer = styled.div`
  z-index: 2;
  cursor: auto;
`;

const AnimatedAbsoluteContainer = animated(AbsoluteContainer);

const IsHiddenContainer = styled.div``;

const AnimatedIsHiddenContainer = animated(IsHiddenContainer);

export const ArtworkCardAbsoluteContainer: FC<ArtworkCardAbsoluteProps> = ({
  isHidden,
  style,
  children,
  contentWidth,
  corner,
}) => {
  const hideSpring = useSpring({
    opacity: isHidden ? 0 : 1,
    translateX: isHidden ? -40 : 0,
  });

  const reponsiveLeftRightPosition = useResponsiveAbsolutePositioning(
    contentWidth,
  );

  const posStyles = useMemo(() => {
    if (corner === 'topLeft') {
      return {
        top: 20,
        left: reponsiveLeftRightPosition,
      };
    }
    if (corner === 'topRight') {
      return {
        top: 20,
        right: reponsiveLeftRightPosition,
      };
    }
    if (corner === 'bottomLeft') {
      return {
        bottom: 20,
        left: reponsiveLeftRightPosition,
      };
    }
    if (corner === 'bottomRight') {
      return {
        bottom: 20,
        right: reponsiveLeftRightPosition,
      };
    }
    return {};
  }, [reponsiveLeftRightPosition, corner]);

  return (
    <AnimatedAbsoluteContainer
      style={{
        position: 'absolute',
        width: contentWidth,
        pointerEvents: isHidden ? 'none' : 'auto',
        ...posStyles,
        ...style,
      }}
    >
      <AnimatedIsHiddenContainer
        style={{
          opacity: hideSpring.opacity.interpolate((v) => v),
          transform: hideSpring.translateX.interpolate(
            (v) => `translateX(${v}px)`,
          ),
        }}
      >
        {children}
      </AnimatedIsHiddenContainer>
    </AnimatedAbsoluteContainer>
  );
};

export const DetailsContainer = styled.div<{ isRight?: boolean }>`
  padding: 14px;
  background: white;
  box-shadow: ${(p) =>
    p.isRight ? '-4px 4px 0px #000000' : `4px 4px 0px #000000`};
  display: flex;
  align-items: ${(p) => (p.isRight ? 'flex-start' : 'flex-end')};
  flex-direction: column;
  text-align: ${(p) => (p.isRight ? 'left' : 'right')};
  width: 100%;
  > div + div {
    padding-top: 12px;
  }
  @media (max-width: ${BREAKPTS.SM}px) {
    align-items: flex-start;
    text-align: left;
  }
`;

export const AnimatedDetailsContainer = animated(DetailsContainer);

export const DetailsText = styled.p`
  padding: 0;
  margin: 0;
  word-wrap: break-word;
  font-size: 14px;
`;

export const DetailsTextBold = styled.p`
  padding: 0;
  margin: 0;
  word-wrap: break-word;
  font-size: 14px;
  font-weight: bold;
`;

export const DetailsTextAnchor = styled.a`
  font-weight: 600;
  color: black;
  text-decoration: underline;
  font-size: 14px;
`;

export const DetailsContent = styled.div`
  width: 100%;
  > p + p {
    padding-top: 4px;
  }
  @media (max-width: ${BREAKPTS.MD}px) {
    > p + p {
      padding-top: 4px;
    }
  }
`;

export const DetailsActionButton = styled(PrimaryButton)`
  font-size: 14px;
  font-weight: bold;
  padding: 16px 24px;
  text-transform: uppercase;
  width: 100%;
  color: white;
  :disabled {
    color: rgba(255, 255, 255, 0.5);
  }
  ::after {
    opacity: 1;
    background: black;
  }
`;
