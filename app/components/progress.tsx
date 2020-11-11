import { FC, useEffect, useState } from 'react';
import { useInterval } from 'react-use';
import styled from 'styled-components';

const PROGRESS_BAR_HEIGHT = 4;

const ProgressBarWrapper = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  left: 0;
  height: ${PROGRESS_BAR_HEIGHT}px;
  width: 100%;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 100%;
  background: #808080;
  transform-origin: left top;
`;

interface ProgressProps {
  isPaused?: boolean;
  triggerAtOne?: () => void;
}

const UNITS_IN_MS = 10;

export const Progress: FC<ProgressProps> = ({ isPaused, triggerAtOne }) => {
  const [percent, setPercent] = useState(0);
  useInterval(
    () => {
      setPercent((percent + 0.001) % 1);
    },
    isPaused ? null : UNITS_IN_MS,
  );

  useEffect(() => {
    if (1 - percent < 0.001) {
      triggerAtOne?.();
    }
  }, [triggerAtOne, percent]);

  return (
    <ProgressBarWrapper>
      <ProgressBar style={{ transform: `scaleX(${percent})` }} />
    </ProgressBarWrapper>
  );
};
