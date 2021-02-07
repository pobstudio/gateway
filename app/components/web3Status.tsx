import { FC } from 'react';
import styled, { keyframes } from 'styled-components';
import { useModalStore } from '../stores/modal';
import { BaseButton, TertiaryButton } from './button';
import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';
import { shortenHexString } from '../utils/hex';
import { useENSLookup } from '../hooks/useENS';
import { useSpring } from 'react-spring';
import { useTransactionsStore } from '../stores/transaction';
import { animated } from 'react-spring';
import { PrimaryButton } from './button';

const breath = keyframes`
  0% {
    opacity: 0.5;
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0.5;
  }
`;

const Circle = styled.div`
  background-color: #fff;
  animation: ${breath} 0.9s ease-in-out infinite;
  height: 16px;
  width: 16px;
  margin: 0 8px 0 0;
  border-radius: 999px;
`;

const StatusIndicator = styled.div`
  position: absolute;
  top: 0;
  color: white;
  display: flex;
  align-items: center;
  padding: 0 12px;
  right: 0;
  bottom: 0;
  background: #000000;
  transition: 200ms ease-in-out all;
  cursor: pointer;
  &:hover {
    transform: scale(0.95, 0.95);
  }
`;

const AnimatedStatusIndicator = animated(StatusIndicator);

const Web3StatusWrapper = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  margin: 0 0 0 8px;
`;

const StyledButton = styled(PrimaryButton)`
  padding: 8px;
  font-weight: 600;
  color: black;
  font-size: 16px;
  :disabled {
    color: rgba(0, 0, 0, 0.1);
  }
`;

export const Web3Status: FC = () => {
  const { account, connector, error } = useWeb3React();

  const toggleIsWalletModalOpen = useModalStore(
    (s) => s.toggleIsWalletModalOpen,
  );

  const buttonText = useMemo(() => {
    if (account) {
      return shortenHexString(account ?? '');
    }
    // if (status === 'error') {
    //   return 'Connect Wallet';
    // }
    return 'Connect Wallet';
  }, [account]);

  const isDisabled = useMemo(() => {
    return false;
  }, [account]);

  const transactionMap = useTransactionsStore((s) => s.transactionMap);

  const numLoadingCount = useMemo(() => {
    return Object.values(transactionMap).reduce(
      (a, tx) => (tx.status === 'in-progress' ? a + 1 : a),
      0,
    );
  }, [transactionMap]);

  return (
    <Web3StatusWrapper>
      <StyledButton
        onClick={() => {
          toggleIsWalletModalOpen();
        }}
        disabled={isDisabled}
      >
        {buttonText}
      </StyledButton>
      {numLoadingCount > 0 && (
        <AnimatedStatusIndicator
          onClick={() => {
            toggleIsWalletModalOpen();
          }}
        >
          <Circle />
          {numLoadingCount}
        </AnimatedStatusIndicator>
      )}
    </Web3StatusWrapper>
  );
};
