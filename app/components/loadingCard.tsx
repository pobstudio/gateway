import { FC } from 'react';
import styled, { keyframes } from 'styled-components';
import { useTransition, animated } from 'react-spring';

const breath = keyframes`
  0% {
    background-color: #e2e2e2;
  }

  50% {
    background-color: #f3f3f3;
  }

  100% {
    background-color: #e2e2e2;
  }
`;

const LoadingCardContent = styled.div`
  width: 100%;
  height: 100%;
  background-color: #e2e2e2;
  animation: ${breath} 1.8s ease-in-out infinite;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  position: absolute;
  pointer-events: none;
`;

export const EmptyCard = styled.div`
  width: 100%;
  height: 100%;
  background-color: #f0f0f0;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  position: absolute;
  pointer-events: none;
`;

const AnimatedLoadingCardContent = animated(LoadingCardContent);

export const LoadingCard: FC<{ isLoading?: boolean }> = ({ isLoading }) => {
  const transitions = useTransition(isLoading, null, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });
  return (
    <>
      {transitions.map(
        ({ item, key, props }) =>
          item && <AnimatedLoadingCardContent key={key} style={props} />,
      )}
    </>
  );
};
