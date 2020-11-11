import { useRouter } from 'next/router';
import { useState } from 'react';
import { useCallback } from 'react';
import { useMemo } from 'react';
import { FC } from 'react';
import { useTransition } from 'react-spring';
import styled from 'styled-components';
import { TX_HASH_REGEX } from '../../utils/regex';
import { useModalStore } from '../../stores/modal';
import { TertiaryButton, PrimaryButton, BaseButton } from '../button';
import { AnimatedModalContainer, ModalCloseRow } from './common';
import { useCollectionsStore } from '../../stores/collections';
import { ETHERSCAN_API_KEY } from '../../constants';
import { useWeb3React } from '@web3-react/core';
import { useEffect } from 'react';
import { CloseIcon } from '../icons/close';
import { useAnalytics } from 'use-analytics';
import { ANALYTIC_EVENTS } from '../../constants/analytics';
import { BREAKPTS } from '../../styles';
import { ROUTES } from '../../constants/routes';

const SearchContent = styled.div`
  max-width: 800px;
  width: 800px;
  @media (max-width: ${BREAKPTS.MD}px) {
    max-width: 100%;
    width: 100%;
    padding: 0 16px;
  }
`;

const SearchActionsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 12px;
  button + button {
    margin-left: 28px;
  }
`;

const SearchActionsBottomRow = styled(SearchActionsRow)`
  padding-top: 12px;
  padding-bottom: 0;
`;

const Input = styled.textarea`
  display: block;
  border: none;
  outline: none;
  font-size: 72px;
  line-height: 80px;
  height: 320px;
  resize: none;
  font-style: normal;
  font-weight: bold;
  width: 100%;
  word-wrap: break-word;
  text-align: right;
  ::placeholder {
    color: black;
    opacity: 0.1;
  }
  @media (max-width: ${BREAKPTS.SM}px) {
    font-size: 40px;
    line-height: 48px;
  }
`;

const ShowMeButton = styled(PrimaryButton)`
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

export const SearchModal: FC = () => {
  const { track } = useAnalytics();
  const router = useRouter();
  const isOpen = useModalStore((s) => s.isSearchModalOpen);
  const toggleIsOpen = useModalStore((s) => s.toggleIsSearchModalOpen);
  const { account } = useWeb3React();

  const transitions = useTransition(isOpen, null, {
    from: { opacity: 0, transform: 'translateY(-40px)' },
    enter: { opacity: 1, transform: 'translateY(0)' },
    leave: { opacity: 0, transform: 'translateY(-40px)' },
  });

  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchTerm = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const isValidSearch = useMemo(() => {
    return TX_HASH_REGEX.test(searchTerm);
  }, [searchTerm]);

  const handleShowMe = useCallback(() => {
    router.push(`${ROUTES.HASH.ART}/${searchTerm}`);
    toggleIsOpen();
    setSearchTerm('');
    track(ANALYTIC_EVENTS.SEARCH_MODAL_CLICK_SEARCH);
  }, [searchTerm, track]);

  const gasStationHashOrIds = useCollectionsStore(
    (s) => s.collectionHashOrIdMap['gas-station'] ?? [],
  );

  const handleLucky = useCallback(() => {
    const randomTx =
      gasStationHashOrIds[
        Math.floor(Math.random() * gasStationHashOrIds.length)
      ];
    router.push(`${ROUTES.HASH.ART}/${randomTx}`);
    toggleIsOpen();
    setSearchTerm('');
    track(ANALYTIC_EVENTS.SEARCH_MODAL_CLICK_FEELING_LUCKY);
  }, [gasStationHashOrIds, track]);

  const handleLatestTx = useCallback(async () => {
    if (!account) {
      return;
    }
    const res = await fetch(
      `https://api.etherscan.io/api?module=account&action=txlist&address=${account}&startblock=0&endblock=99999999&sort=desc&apikey=${ETHERSCAN_API_KEY}`,
    );
    if (res.ok) {
      const { result } = await res.json();
      if (!!result[0]) {
        router.push(`${ROUTES.HASH.ART}/${result[0].hash}`);
        toggleIsOpen();
        setSearchTerm('');
      }
      track(ANALYTIC_EVENTS.SEARCH_MODAL_CLICK_LAST_TX);
    }
  }, [account, track]);

  return (
    <>
      {transitions.map(
        ({ item, key, props }) =>
          item && (
            <AnimatedModalContainer key={key} style={props}>
              <SearchContent>
                <ModalCloseRow>
                  <BaseButton
                    style={{ opacity: 0.5 }}
                    onClick={() => {
                      toggleIsOpen();
                      track(ANALYTIC_EVENTS.SEARCH_MODAL_DISMISS_MODAL);
                    }}
                  >
                    <CloseIcon />
                  </BaseButton>
                </ModalCloseRow>
                <SearchActionsRow>
                  {!!account && (
                    <ActionButton onClick={handleLatestTx}>
                      Your latest tx
                    </ActionButton>
                  )}
                  <ActionButton onClick={handleLucky}>
                    I'm feeling lucky
                  </ActionButton>
                </SearchActionsRow>
                <Input
                  onChange={handleSearchTerm}
                  value={searchTerm}
                  placeholder={
                    '0xe4daa77a0de5be96234872cc38fa04682c3d1cc4597e759ca272d12670a991fa'
                  }
                />
                <SearchActionsBottomRow>
                  <ShowMeButton
                    onClick={handleShowMe}
                    disabled={!isValidSearch}
                  >
                    Show me what you got!
                  </ShowMeButton>
                </SearchActionsBottomRow>
              </SearchContent>
            </AnimatedModalContainer>
          ),
      )}
    </>
  );
};
