import React, { FC } from 'react';
import { useSpring, animated } from 'react-spring';
import styled from 'styled-components';
import { CHAIN_ID } from '../constants';
import { useBlockchainStore } from '../stores/blockchain';
import { BREAKPTS } from '../styles';

const BlockNumberWrapper = styled.div``;

const BlockNumberText = styled.p`
  font-weight: bold;
  font-size: 14px;
  color: rgba(0, 0, 0);
  margin: 0;
`;

const ABlockNumberText = animated(BlockNumberText);

const UnMemoizedBlockNumber: FC<{ isMinimal?: boolean }> = ({ isMinimal }) => {
  const blockNumber = useBlockchainStore((s) => s.blockNumber);
  const props = useSpring({
    to: async (next: any) => {
      await next({ opacity: 1 });
      await next({ opacity: 0.4 });
    },
    from: { opacity: 0.4 },
  });
  return (
    <BlockNumberWrapper>
      <ABlockNumberText style={props}>
        {!isMinimal && (CHAIN_ID === 1 ? 'mainnet' : 'rinkeby')}{' '}
        {blockNumber ?? '-'}
      </ABlockNumberText>
    </BlockNumberWrapper>
  );
};

export const BlockNumber = React.memo(UnMemoizedBlockNumber);

export const BlockNumberCornerWrapper = styled.div`
  position: fixed;
  z-index: 10000;
  bottom: 20px;
  right: 20px;
  @media (max-width: ${BREAKPTS.MD}px) {
    display: none;
  }
`;
