import React from 'react';
import { NextPage } from 'next';
import { ContentRow, ContentWrapper } from '../components/content';
import { Header } from '../components/header';
import styled from 'styled-components';
import { useCallback } from 'react';
import { PrimaryButton } from '../components/button';
import { FC } from 'react';
import { useState } from 'react';
import { useMemo } from 'react';
import { BREAKPTS } from '../styles';
import { ROUTES } from '../constants/routes';
import { useRouter } from 'next/router';
import { ADDRESS_REGEX, TX_HASH_REGEX } from '../utils/regex';

const MainContent = styled.div`
  width: 100%;
`;

const Title = styled.h1`
  font-family: Helvetica;
  font-style: normal;
  font-weight: bold;
  font-size: 64px;
  line-height: 64px;
  margin: 0;
  @media (max-width: ${BREAKPTS.LG}px) {
    font-size: 48px;
    line-height: 48px;
  }
  @media (max-width: ${BREAKPTS.SM}px) {
    font-size: 32px;
    line-height: 32px;
  }
`;

const SubTitle = styled.h2`
  font-family: Helvetica;
  font-style: normal;
  font-weight: bold;
  font-size: 24px;
  line-height: 28px;
  margin: 0;
  @media (max-width: ${BREAKPTS.LG}px) {
    font-size: 20px;
    line-height: 24px;
  }
  @media (max-width: ${BREAKPTS.SM}px) {
    font-size: 16px;
    line-height: 20px;
  }
`;

const TitleRow = styled(ContentRow)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 72px;
  @media (max-width: ${BREAKPTS.SM}px) {
    padding: 0 16px;
    padding-top: 24px;
  }
`;

const Input = styled.textarea`
  display: block;
  border: none;
  outline: none;
  font-size: 72px;
  line-height: 80px;
  height: 240px;
  resize: none;
  font-style: normal;
  font-weight: bold;
  width: 100%;
  word-wrap: break-word;
  text-align: left;
  ::placeholder {
    color: black;
    opacity: 0.1;
  }
  @media (max-width: ${BREAKPTS.SM}px) {
    font-size: 40px;
    line-height: 48px;
  }
`;

const SearchActionsRow = styled.div`
  display: flex;
  align-items: center;
  padding-top: 12px;
  button + button {
    margin-left: 28px;
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

const SearchContentRow = styled(ContentRow)`
  padding-top: 36px;
`;

const SearchArtworkContent: FC = () => {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchTerm = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleShowMe = useCallback(() => {
    router.push(`${ROUTES.HASH.ART}/${searchTerm}`);
    setSearchTerm('');
  }, [searchTerm]);

  const isValidSearch = useMemo(() => {
    return TX_HASH_REGEX.test(searchTerm);
  }, [searchTerm]);

  return (
    <SearchContentRow>
      <SubTitle>Search for artwork by hash</SubTitle>
      <Input
        onChange={handleSearchTerm}
        value={searchTerm}
        placeholder={
          '0xe4daa77a0de5be96234872cc38fa04682c3d1cc4597e759ca272d12670a991fa'
        }
      />
      <SearchActionsRow>
        <ShowMeButton onClick={handleShowMe} disabled={!isValidSearch}>
          Show artwork
        </ShowMeButton>
      </SearchActionsRow>
    </SearchContentRow>
  );
};

const SearchPaletteContent: FC = () => {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchTerm = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleShowMe = useCallback(() => {
    router.push(`${ROUTES.HASH.PALETTE}/${searchTerm}`);
    setSearchTerm('');
  }, [searchTerm]);

  const isValidSearch = useMemo(() => {
    return ADDRESS_REGEX.test(searchTerm);
  }, [searchTerm]);

  return (
    <SearchContentRow>
      <SubTitle>Search for pallete</SubTitle>
      <Input
        style={{ height: 160 }}
        onChange={handleSearchTerm}
        value={searchTerm}
        placeholder={'0x0B7056e2D9064f2ec8647F1ae556BAcc06da6Db4'}
      />
      <SearchActionsRow>
        <ShowMeButton onClick={handleShowMe} disabled={!isValidSearch}>
          Show palette
        </ShowMeButton>
      </SearchActionsRow>
    </SearchContentRow>
  );
};

const IndexPage: NextPage = () => {
  return (
    <ContentWrapper>
      <Header />
      <MainContent>
        <TitleRow>
          <div>
            <Title>IPFS Gateway</Title>
          </div>
        </TitleRow>
        <SearchArtworkContent />
        <SearchPaletteContent />
      </MainContent>
      <BetweenContentAndFooterSpacer />
    </ContentWrapper>
  );
};

const BetweenContentAndFooterSpacer = styled.div`
  height: 64px;
  width: 100%;
  @media (max-width: ${BREAKPTS.SM}px) {
    height: 32px;
  }
`;

export default React.memo(IndexPage);
