import styled from 'styled-components';
import { BaseButton, PrimaryButton } from './button';
import { PrimaryAnchor } from './anchor';
import { Web3Status } from './web3Status';
import { useIsCluttered } from '../hooks/useIsCluttered';
import { useModalStore } from '../stores/modal';
import Link from 'next/link';
import { TOKEN_SYMBOL, useTokensStore } from '../stores/tokens';
import { useRouter } from 'next/router';
import { Toasts } from './toast';
import { HEADER_HEIGHT, MOBILE_HEADER_HEIGHT } from '../constants';
import { useCallback } from 'react';
import { useMemo } from 'react';
import { useSpring, animated } from 'react-spring';
import { BREAKPTS } from '../styles';
import { useWindowSize } from 'react-use';
import { AudioControls } from './AudioControls';
import { MenuIcon } from './icons/menu';
import { CloseIcon } from './icons/close';
import { ROUTES } from '../constants/routes';

const SPACER_HEIGHT = 0;

const HeaderSpacer = styled.div`
  width: 100%;
  height: ${SPACER_HEIGHT}px;
`;

const HeaderRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  width: 100%;
  height: ${HEADER_HEIGHT - SPACER_HEIGHT}px;
  padding: 0 16px 0 24px;
  @media (max-width: ${BREAKPTS.SM}px) {
    grid-template-columns: 0.5fr 0fr 0.5fr;
    padding: 0 16px 0 16px;
    height: ${MOBILE_HEADER_HEIGHT - SPACER_HEIGHT}px;
  }
`;

const HeaderWrapper = styled.div<{ isCluttered?: boolean }>`
  background: ${(p) => (p.isCluttered ? 'white' : '#f8f8f8')};
  transition: 200ms ease-in-out background;
  z-index: 1000;
  position: relative;
`;

const HeaderSideContentWrappper = styled.div`
  display: flex;
  align-items: center;
`;

const HeaderRightSideContentWrappper = styled(HeaderSideContentWrappper)`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  transition: 200ms ease-in-out opacity;
`;

const HeaderCenterContentWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 200ms ease-in-out opacity;
`;

const HeaderLogoWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const HeaderLogoText = styled.a`
  color: black;
  font-size: 24px;
  font-family: Bebas Neue;
  text-decoration: none;
  &:focus {
    color: black;
  }
`;

const HeaderLink = styled(PrimaryAnchor)`
  font-weight: 600;
  color: black;
  font-size: 16px;
  text-decoration: none;
  padding: 8px;
  &:focus {
    color: black;
  }
`;

const SecondaryHeaderLink = styled.a`
  font-weight: 600;
  color: black;
  font-size: 16px;
  text-decoration: none;
  &:focus {
    color: black;
  }
`;

const TxHashButton = styled(PrimaryButton)`
  text-transform: uppercase;
  font-size: 16px;
  font-weight: bold;
  opacity: 1;
  transition: all 200ms ease-out;
  padding: 16px 24px;
  color: white;
  @media (max-width: ${BREAKPTS.SM}px) {
    padding: 12px 14px;
    font-size: 12px;
  }
  ::after {
    opacity: 1;
    background: black;
  }
  &:hover {
    opacity: 1;
  }
`;

export const Header: React.FC = () => {
  const router = useRouter();
  const {
    toggleIsMenuModalOpen,
    isMenuModalOpen,
    isWalletModalOpen,
    setIsWalletModalOpen,
    setIsMenuModalOpen,
  } = useModalStore();
  const [isCluttered] = useIsCluttered();
  const maxIndex = useTokensStore((s) => s.maxIndex);
  const dismissAllModals = useCallback(() => {
    setIsWalletModalOpen(false);
    setIsMenuModalOpen(false);
  }, [setIsWalletModalOpen, setIsMenuModalOpen]);

  const isModalOpen = useMemo(() => {
    return isMenuModalOpen || isWalletModalOpen;
  }, [isMenuModalOpen, isWalletModalOpen]);

  const { width } = useWindowSize();
  const isMobile = useMemo(() => width <= BREAKPTS.SM, [width]);
  const isMD = useMemo(() => width <= BREAKPTS.MD, [width]);
  const shouldShowTryYourHash = useMemo(() => {
    return !router.pathname.includes('gallery') || isMobile;
  }, [router.pathname, isMobile]);
  const shouldShowSupply = useMemo(() => {
    return !router.pathname.includes('minting') && !isMD;
  }, [router.pathname, isMD]);

  return (
    <HeaderWrapper isCluttered={isCluttered}>
      <HeaderSpacer />
      <HeaderRow>
        <HeaderSideContentWrappper>
          <HeaderLogoWrapper>
            <Link href={'/'} passHref={true}>
              <HeaderLogoText
                onClick={() => {
                  dismissAllModals();
                }}
              >
                PoB
              </HeaderLogoText>
            </Link>
            {shouldShowSupply && (
              <Link href={'/'} passHref={true}>
                <SecondaryHeaderLink
                  onClick={() => {
                    dismissAllModals();
                  }}
                  style={{ paddingLeft: 12 }}
                  href="/"
                >
                  {maxIndex.toString()} {TOKEN_SYMBOL} MINTED
                </SecondaryHeaderLink>
              </Link>
            )}
          </HeaderLogoWrapper>
        </HeaderSideContentWrappper>
        <HeaderCenterContentWrapper
          style={{
            opacity: isCluttered && shouldShowTryYourHash ? 1 : 0,
            pointerEvents:
              isCluttered && shouldShowTryYourHash ? 'auto' : 'none',
          }}
        >
        </HeaderCenterContentWrapper>
        <HeaderRightSideContentWrappper
          style={{
            opacity: isCluttered ? 1 : 0,
            pointerEvents: isCluttered ? 'auto' : 'none',
          }}
        >
          {/* <AudioControls/> */}
          {!isMobile && (
            <>
              <Web3Status />
            </>
          )}
          {isMobile && (
            <>
              <Web3Status />
              <BaseButton
                onClick={() =>
                  isModalOpen ? dismissAllModals() : setIsMenuModalOpen(true)
                }
                style={{ height: 24, width: 24, marginLeft: 6 }}
              >
                {isModalOpen ? <CloseIcon /> : <MenuIcon />}
              </BaseButton>
            </>
          )}
        </HeaderRightSideContentWrappper>
      </HeaderRow>
      <Toasts />
    </HeaderWrapper>
  );
};
