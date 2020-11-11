import { ReactNode } from 'react';
import { FC } from 'react';
import { useModalStore } from '../stores/modal';
import styled from 'styled-components';

const Content = styled.div`
  width: 100%;
  max-height: 100vh;
`;

export const ScrollLockWrapper: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const isModalOpen = useModalStore((s) => s.isWalletModalOpen);

  return (
    <Content style={{ overflow: isModalOpen ? 'hidden' : 'auto' }}>
      {children}
    </Content>
  );
};
