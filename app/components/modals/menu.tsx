import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { FC } from 'react';
import { useTransition } from 'react-spring';
import styled from 'styled-components';
import Link from 'next/link';
import { useModalStore } from '../../stores/modal';
import { AnimatedModalContainer } from './common';
import { useWeb3React } from '@web3-react/core';
import { FlexCenterColumn } from '../flex';
import { PrimaryAnchor } from '../anchor';
import { PrimaryButton } from '../button';
import { ROUTES } from '../../constants/routes';
import { BREAKPTS } from '../../styles';

const MenuContent = styled(FlexCenterColumn)`
  max-width: 800px;
  width: 800px;
  height: 100%;
  justify-content: center;
  div + div {
    margin-top: 12px;
  }
`;

const HeaderLink = styled(PrimaryAnchor)`
  font-weight: 600;
  color: black;
  font-size: 36px;
  text-decoration: none;
  display: block;
  padding: 8px;
  &:focus {
    color: black;
  }
`;

const Title = styled.h3`
  font-weight: 600;
  color: black;
  font-size: 36px;
  opacity: 0.1;
  margin: 0;
`;

export const MenuModal: FC = () => {
  const isOpen = useModalStore((s) => s.isMenuModalOpen);
  const { setIsWalletModalOpen, setIsMenuModalOpen } = useModalStore();
  const dismissAllModals = useCallback(() => {
    setIsWalletModalOpen(false);
    setIsMenuModalOpen(false);
  }, [setIsWalletModalOpen, setIsMenuModalOpen]);

  const transitions = useTransition(isOpen, null, {
    from: { opacity: 0, transform: 'translateY(-40px)' },
    enter: { opacity: 1, transform: 'translateY(0)' },
    leave: { opacity: 0, transform: 'translateY(-40px)' },
  });

  return (
    <>
      {transitions.map(
        ({ item, key, props }) =>
          item && (
            <AnimatedModalContainer key={key} style={props}>
              <MenuContent>
                <div>
                  <Title>Menu</Title>
                </div>
                <div>
                  {/* <Link href={ROUTES.HASH.GALLERY} passHref={true}>
                    <HeaderLink onClick={dismissAllModals}>Gallery</HeaderLink>
                  </Link> */}
                </div>
              </MenuContent>
            </AnimatedModalContainer>
          ),
      )}
    </>
  );
};
