import { useCallback, useState, useMemo, useEffect } from 'react';
import { FC } from 'react';
import { useSpring, useTransition } from 'react-spring';
import { ConnectionRejectedError, ChainUnsupportedError } from 'use-wallet';
import styled, { keyframes } from 'styled-components';
import { TX_HASH_REGEX } from '../../utils/regex';
import { useModalStore } from '../../stores/modal';
import { TertiaryButton, PrimaryButton, BaseButton } from '../button';
import { AnimatedModalContainer, ModalCloseRow } from './common';
import { shortenHexString } from '../../utils/hex';
import { ethers } from 'ethers';
import {
  TransactionObject,
  useTransactionsStore,
} from '../../stores/transaction';
import { useTokenId } from '../../hooks/useTokenId';
import { getEditionFromTokenId } from '../../utils/token';
import { CloseIcon } from '../icons/close';
import { useCopyToClipboard, usePrevious } from 'react-use';
import { BREAKPTS } from '../../styles';
import { getEtherscanTxUrl } from '../../utils/urls';
import { useBalance } from '../../hooks/useBalance';
import { useWeb3React, UnsupportedChainIdError } from '@web3-react/core';
import { injected } from '../../connectors';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { isMobile } from 'react-device-detect';

const WalletContent = styled.div`
  max-width: 600px;
  width: 600px;
  @media (max-width: ${BREAKPTS.MD}px) {
    max-width: 100%;
    width: 100%;
    padding: 0 16px;
  }
`;

const WalletContentGrid = styled(WalletContent)`
  display: grid;
  grid-gap: 24px;
  grid-template-columns: 1fr;
  @media (max-width: ${BREAKPTS.MD}px) {
    grid-gap: 12px;
  }
`;

const WalletOptions = styled.div`
  margin-top: 24px;
  button + button {
    margin-top: 24px;
  }
`;

const WalletOptionCard = styled(BaseButton)`
  display: block;
  width: 100%;
  text-align: left;
  padding: 28px;
  background: #f8f8f8;
  &:hover {
    transform: scale(0.98, 0.98);
  }
`;

const TransactionsWell = styled.div`
  width: 100%;
  padding: 28px;
  background: #f8f8f8;
  overflow: auto;
  max-height: 264px;
  @media (max-width: ${BREAKPTS.SM}px) {
    padding: 14px;
    max-height: 224px;
  }
`;

const WalletOptionText = styled.h2`
  margin: 0;
  font-weight: 600;
  font-size: 24px;
`;

const WalletSubText = styled.p`
  margin: 0;
  font-weight: 500;
  padding-top: 8px;
  font-size: 16px;
`;

const Title = styled.h1`
  font-size: 48px;
  margin: 0;
  color: black;
  font-weight: bold;
  @media (max-width: ${BREAKPTS.SM}px) {
    font-size: 36px;
  }
`;

const SubTitle = styled.h3`
  font-size: 32px;
  margin: 0;
  color: black;
  font-weight: bold;
  @media (max-width: ${BREAKPTS.SM}px) {
    font-size: 28px;
  }
`;

const TxTitle = styled.h1`
  font-size: 32px;
  margin: 0;
  color: black;
  font-weight: bold;
  @media (max-width: ${BREAKPTS.SM}px) {
    font-size: 20px;
  }
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  @media (max-width: ${BREAKPTS.SM}px) {
    display: block;
  }
`;

const ActionsRow = styled.div`
  display: flex;
  align-items: center;
  button + button {
    margin-left: 12px;
  }
`;

const ActionButton = styled(PrimaryButton)`
  font-size: 16px;
  font-weight: bold;
  padding: 16px 24px;
  text-transform: uppercase;
  :disabled {
    color: rgba(0, 0, 0, 0.1);
  }
  ::after {
    opacity: 1;
  }
  @media (max-width: ${BREAKPTS.SM}px) {
    font-size: 12px;
    padding: 12px 14px;
  }
`;

const SocialButton = styled(BaseButton)`
  opacity: 0.2;
`;

const TransactionWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const TransactionsWrapper = styled.div`
  & > div + div {
    margin-top: 18px;
  }
  @media (max-width: ${BREAKPTS.SM}px) {
    & > div + div {
      margin-top: 12px;
    }
  }
`;

const TransactionActionsWrapper = styled.div`
  display: flex;
  align-items: center;
  button + button {
    margin-left: 12px;
  }
`;

const TransactionStatusWrapper = styled.div`
  display: flex;
  align-items: center;
  button + button {
    margin-left: 12px;
  }
`;

const TransactionStatusIconWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 20px;
  height: 20px;
  margin-right: 12px;
  @media (max-width: ${BREAKPTS.SM}px) {
    margin-right: 4px;
  }
`;

const breath = keyframes`
  0% {
    opacity: 0.5;
  }

  50% {
    opacity: 0.8;
  }

  100% {
    opacity: 0.5;
  }
`;

const LoadingCircle = styled.div`
  background-color: #000;
  animation: ${breath} 0.9s ease-in-out infinite;
  height: 20px;
  width: 20px;
  border-radius: 999px;
  @media (max-width: ${BREAKPTS.SM}px) {
    height: 14px;
    width: 14px;
  }
`;

const SuccessCircle = styled.div<{ imageUrl?: string }>`
  background: url(${(p) => p.imageUrl});
  background-color: #000;
  background-position: center;
  height: 20px;
  width: 20px;
  border-radius: 999px;
  @media (max-width: ${BREAKPTS.SM}px) {
    height: 14px;
    width: 14px;
  }
`;

const FailureCircle = styled.div`
  border: 2px solid #000;
  height: 20px;
  width: 20px;
  border-radius: 999px;
  @media (max-width: ${BREAKPTS.SM}px) {
    height: 14px;
    width: 14px;
  }
`;

const TxStatusSpan = styled.span`
  opacity: 0.1;
`;

const WalletConnectingContent: FC<{ reset: () => void }> = ({ reset }) => {
  return (
    <>
      {' '}
      {
        <WalletContentGrid>
          <Title>Plugging into web3...</Title>
          <ActionsRow>
            <ActionButton onClick={reset}>Cancel</ActionButton>
          </ActionsRow>
        </WalletContentGrid>
      }{' '}
    </>
  );
};

const TransactionInProgress: FC<TransactionObject> = ({ hash, metadata }) => {
  return (
    <TransactionWrapper>
      <TransactionStatusWrapper>
        <TransactionStatusIconWrapper>
          <LoadingCircle />
        </TransactionStatusIconWrapper>
        <TxTitle>
          {`NO. ${metadata.attemptedEdition}`}
          <TxStatusSpan> MINTING</TxStatusSpan>
        </TxTitle>
      </TransactionStatusWrapper>
      <TransactionActionsWrapper>
        <TertiaryButton
          as={'a'}
          target={'blank'}
          href={getEtherscanTxUrl(hash)}
          style={{ color: 'black', opacity: 0.2, textDecoration: 'none' }}
        >
          ETHERSCAN
        </TertiaryButton>
      </TransactionActionsWrapper>
    </TransactionWrapper>
  );
};

const TransactionSuccess: FC<TransactionObject> = ({ hash, metadata }) => {
  const tokenId = useTokenId(metadata.hash);
  return (
    <TransactionWrapper>
      <TransactionStatusWrapper>
        <TransactionStatusIconWrapper>
          <SuccessCircle />
        </TransactionStatusIconWrapper>
        <TxTitle>
          {`NO. ${
            !!tokenId && tokenId !== '0x00'
              ? getEditionFromTokenId(tokenId)
              : metadata.attemptedEdition
          }`}
          <TxStatusSpan> MINTED</TxStatusSpan>
        </TxTitle>
      </TransactionStatusWrapper>
      <TransactionActionsWrapper>
        <TertiaryButton
          as={'a'}
          target={'blank'}
          href={getEtherscanTxUrl(hash)}
          style={{ color: 'black', opacity: 0.2, textDecoration: 'none' }}
        >
          ETHERSCAN
        </TertiaryButton>
      </TransactionActionsWrapper>
    </TransactionWrapper>
  );
};

const TransactionFailure: FC<TransactionObject> = ({ hash, metadata }) => {
  return (
    <TransactionWrapper>
      <TransactionStatusWrapper>
        <TransactionStatusIconWrapper>
          <FailureCircle />
        </TransactionStatusIconWrapper>
        <TxTitle>
          {`NO. ${metadata.attemptedEdition}`}
          <TxStatusSpan>FAILURE</TxStatusSpan>
        </TxTitle>
      </TransactionStatusWrapper>
      <TransactionActionsWrapper>
        <TertiaryButton
          as={'a'}
          target={'blank'}
          href={getEtherscanTxUrl(hash)}
          style={{
            color: 'black',
            outline: 'none',
            opacity: 0.2,
            textDecoration: 'none',
          }}
        >
          ETHERSCAN
        </TertiaryButton>
      </TransactionActionsWrapper>
    </TransactionWrapper>
  );
};

const DUMMY_TX = {
  hash: '0x4b8b3410e43d2bd626c518395fcc6fe017fd35d883f72cb8f772239fead9b1f2',
  status: 'in-progress',
  metadata: {
    attemptedEdition: 1,
    hash: '0x4b8b3410e43d2bd626c518395fcc6fe017fd35d883f72cb8f772239fead9b1f2',
  },
};

const WalletConnectedContent: FC<{ reset: () => void }> = ({ reset }) => {
  const { account } = useWeb3React();
  const balance = useBalance();
  const formattedBalance = useMemo(() => {
    return ethers.utils.formatEther(balance).slice(0, 4);
  }, [balance]);

  const toggleIsOpen = useModalStore((s) => s.toggleIsWalletModalOpen);

  const transactionMap = useTransactionsStore((s) => s.transactionMap);

  const txs = useMemo(() => Object.values(transactionMap), [transactionMap]);

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
    <>
      {' '}
      {!!account && (
        <WalletContentGrid>
          <TitleRow>
            <Title style={{ opacity: 0.1 }}>{shortenHexString(account)}</Title>
            <Title style={{ opacity: 1 }}>{formattedBalance} ETH</Title>
          </TitleRow>
          <ActionsRow style={{ justifyContent: 'space-between' }}>
            <ActionsRow>
              <ActionButton
                onClick={() => {
                  copyToClipboard(account);
                  setCopied(true);
                }}
              >
                {copied ? 'Copied!' : 'Copy Address'}
              </ActionButton>
              <ActionButton
                onClick={() => {
                  reset();
                }}
              >
                Disconnect
              </ActionButton>
            </ActionsRow>
            <ActionsRow></ActionsRow>
          </ActionsRow>
          {txs.length > 0 && (
            <TransactionsWell>
              <TransactionsWrapper>
                {txs.map((tx) => {
                  if (tx.status === 'success') {
                    return <TransactionSuccess {...tx} />;
                  }
                  if (tx.status === 'failed') {
                    return <TransactionFailure {...tx} />;
                  }
                  return <TransactionInProgress {...tx} />;
                })}
              </TransactionsWrapper>
            </TransactionsWell>
          )}
          <ActionsRow></ActionsRow>
        </WalletContentGrid>
      )}{' '}
    </>
  );
};

export interface WalletInfo {
  connector?: AbstractConnector;
  mobile?: true;
  mobileOnly?: true;
  name: string;
  primary?: boolean;
  description: string;
}

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
  INJECTED: {
    connector: injected,
    name: 'Injected',
    primary: true,
    description: 'Connect via injected provider',
  },
  METAMASK: {
    connector: injected,
    name: 'MetaMask',
    description: 'Connect via Metamask',
  },
  // WALLET_CONNECT: {
  //   connector: walletconnect,
  //   name: 'WalletConnect',
  //   mobile: true,
  //   description: 'Connect via WalletConnect',
  // },
  // WALLET_LINK: {
  //   connector: walletlink,
  //   name: 'Coinbase Wallet',
  //   iconName: 'coinbaseWalletIcon.svg',
  //   description: 'Use Coinbase Wallet app on mobile device',
  //   href: null,
  //   color: '#315CF5'
  // },
};

const WALLET_VIEWS = {
  OPTIONS: 'options',
  OPTIONS_SECONDARY: 'options_secondary',
  ACCOUNT: 'account',
  PENDING: 'pending',
};

export const WalletModal: FC = () => {
  // important that these are destructed from the account-specific web3-react context
  const { active, account, connector, activate, error } = useWeb3React();

  const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT);

  const [pendingWallet, setPendingWallet] = useState<
    AbstractConnector | undefined
  >();

  const [pendingError, setPendingError] = useState<boolean>();

  const isOpen = useModalStore((s) => s.isWalletModalOpen);
  const toggleIsOpen = useModalStore((s) => s.toggleIsWalletModalOpen);

  const previousAccount = usePrevious(account);

  const transitions = useTransition(isOpen, null, {
    from: { opacity: 0, transform: 'translateY(-40px)' },
    enter: { opacity: 1, transform: 'translateY(0)' },
    leave: { opacity: 0, transform: 'translateY(-40px)' },
  });

  // close on connection, when logged out before
  useEffect(() => {
    if (account && !previousAccount && isOpen) {
      toggleIsOpen();
    }
  }, [account, previousAccount, toggleIsOpen, isOpen]);

  // always reset to account view
  useEffect(() => {
    if (isOpen) {
      setPendingError(false);
      setWalletView(WALLET_VIEWS.ACCOUNT);
    }
  }, [isOpen]);

  // close modal when a connection is successful
  const activePrevious = usePrevious(active);
  const connectorPrevious = usePrevious(connector);
  useEffect(() => {
    if (
      isOpen &&
      ((active && !activePrevious) ||
        (connector && connector !== connectorPrevious && !error))
    ) {
      setWalletView(WALLET_VIEWS.ACCOUNT);
    }
  }, [
    setWalletView,
    active,
    error,
    connector,
    isOpen,
    activePrevious,
    connectorPrevious,
  ]);

  const tryActivation = async (connector: AbstractConnector | undefined) => {
    let name = '';
    Object.keys(SUPPORTED_WALLETS).map((key) => {
      if (connector === SUPPORTED_WALLETS[key].connector) {
        return (name = SUPPORTED_WALLETS[key].name);
      }
      return true;
    });
    // log selected wallet
    // ReactGA.event({
    //   category: 'Wallet',
    //   action: 'Change Wallet',
    //   label: name
    // })
    setPendingWallet(connector); // set wallet for pending view
    setWalletView(WALLET_VIEWS.PENDING);

    // if the connector is walletconnect and the user has already tried to connect, manually reset the connector
    if (connector instanceof WalletConnectConnector) {
      connector.walletConnectProvider = undefined;
    }

    connector &&
      activate(connector, undefined, true).catch((error) => {
        if (error instanceof UnsupportedChainIdError) {
          activate(connector); // a little janky...can't use setError because the connector isn't set
        } else {
          setPendingError(true);
        }
        if (connector instanceof WalletConnectConnector) {
          connector.walletConnectProvider = undefined;
        }
      });
  };

  // get wallets user can switch too, depending on device/browser
  function getOptions() {
    const isMetamask = window.ethereum && window.ethereum.isMetaMask;
    return Object.keys(SUPPORTED_WALLETS).map((key) => {
      const option = SUPPORTED_WALLETS[key];
      // check for mobile options
      if (isMobile) {
        if (!window.ethereum && option.mobile) {
          return (
            <WalletOptionCard
              key={`wallet-option-${option.name}`}
              onClick={() => {
                option.connector !== connector &&
                  tryActivation(option.connector);
              }}
            >
              <WalletOptionText>{option.name}</WalletOptionText>
              <WalletSubText>{option.description}</WalletSubText>
            </WalletOptionCard>
          );
        }
        return null;
      }

      // overwrite injected when needed
      if (option.connector === injected) {
        // don't show injected if there's no injected provider
        if (!window.ethereum) {
          if (option.name === 'MetaMask') {
            return (
              <WalletOptionCard
                key={`wallet-option-install-metamask`}
                onClick={() => window.open('https://metamask.io', '_blank')}
              >
                <WalletOptionText>Metamask</WalletOptionText>
                <WalletSubText>Install metamask</WalletSubText>
              </WalletOptionCard>
            );
          } else {
            return null; //dont want to return install twice
          }
        }
        // don't return metamask if injected provider isn't metamask
        else if (option.name === 'MetaMask' && !isMetamask) {
          return null;
        }
        // likewise for generic
        else if (option.name === 'Injected' && isMetamask) {
          return null;
        }
      }

      // return rest of options
      return (
        !isMobile &&
        !option.mobileOnly && (
          <WalletOptionCard
            key={`wallet-option-${option.name}`}
            onClick={() => {
              option.connector === connector
                ? setWalletView(WALLET_VIEWS.ACCOUNT)
                : tryActivation(option.connector);
            }}
          >
            <WalletOptionText>{option.name}</WalletOptionText>
            <WalletSubText>{option.description}</WalletSubText>
          </WalletOptionCard>
        )
      );
    });
  }

  const reset = useCallback(() => {
    setWalletView(WALLET_VIEWS.OPTIONS);
    if (connector instanceof WalletConnectConnector) {
      (connector as any).close();
    }
  }, [connector]);

  function getModalContent() {
    if (error) {
      return (
        <WalletContentGrid>
          <Title>
            {(() => {
              if (error instanceof UnsupportedChainIdError) {
                return 'Please connect to Mainnet';
              }
              return 'Something blew up.';
            })()}
          </Title>
          <ActionsRow>
            <ActionButton onClick={reset}>retry</ActionButton>
          </ActionsRow>
        </WalletContentGrid>
      );
    }
    if (account && walletView === WALLET_VIEWS.ACCOUNT) {
      return <WalletConnectedContent reset={reset} />;
    }

    if (walletView === WALLET_VIEWS.PENDING) {
      return <WalletConnectingContent reset={reset} />;
    }

    return (
      <WalletContent>
        <Title>Connect Wallet</Title>
        <WalletOptions>{getOptions()}</WalletOptions>
      </WalletContent>
    );
  }

  return (
    <>
      {transitions.map(
        ({ item, key, props }) =>
          item && (
            <AnimatedModalContainer key={key} style={{ ...props }}>
              <WalletContainer>
                <WalletModalCloseRow>
                  <BaseButton
                    style={{ opacity: 0.5 }}
                    onClick={() => {
                      toggleIsOpen();
                    }}
                  >
                    <CloseIcon />
                  </BaseButton>
                </WalletModalCloseRow>
                {getModalContent()}
              </WalletContainer>
            </AnimatedModalContainer>
          ),
      )}
    </>
  );
};

const WalletContainer = styled.div`
  @media (max-width: ${BREAKPTS.SM}px) {
    width: 100%;
  }
`;

const WalletModalCloseRow = styled(ModalCloseRow)`
  @media (max-width: ${BREAKPTS.SM}px) {
    max-width: 100%;
    width: 100%;
    padding: 0 16px 32px 16px;
    display: none;
  }
`;
