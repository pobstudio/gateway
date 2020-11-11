import { FC, ReactNode } from 'react';
import { ContentWrapper, MainContent } from './content';
import { Header } from './header';
import styled from 'styled-components';
import { useProvider } from '../hooks/useProvider';

const LargeStateText = styled.h1`
  text-align: center;
  margin: 0;
  opacity: 0.1;
  font-size: 72px;
  font-weight: 600;
  width: 100%;
`;

export const WalletConnectedState: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const provider = useProvider();
  if (!!provider) {
    return <>{children}</>;
  }
  return (
    <ContentWrapper>
      <Header />
      <MainContent
        style={{
          background: '#F8F8F8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LargeStateText>Connect your wallet to continue</LargeStateText>
      </MainContent>
    </ContentWrapper>
  );
};
