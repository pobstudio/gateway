import React from 'react';
import { NextPage } from 'next';
import { ContentWrapper, MainContent } from '../components/content';
import { Header } from '../components/header';
import styled from 'styled-components';

const LargeStateText = styled.h1`
  text-align: center;
  margin: 0;
  opacity: 0.1;
  font-size: 144px;
  font-weight: 600;
  width: 100%;
`;

const NotFoundPage: NextPage = () => {
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
        <LargeStateText>Nothing here.</LargeStateText>
      </MainContent>
    </ContentWrapper>
  );
};

export default React.memo(NotFoundPage);
