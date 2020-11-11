import styled from 'styled-components';
import { HEADER_HEIGHT, MOBILE_HEADER_HEIGHT } from '../constants';
import { BREAKPTS } from '../styles';
export const ContentWrapper = styled.div`
  width: 100%;
`;

export const MainContent = styled.div`
  width: 100%;
  height: calc(100vh - ${HEADER_HEIGHT}px);
  @media (max-width: ${BREAKPTS.SM}px) {
    height: calc(100vh - ${MOBILE_HEADER_HEIGHT}px);
  }
`;

export const ContentRow = styled.div`
  max-width: ${BREAKPTS.LG}px;
  margin: 0 auto;
  @media (max-width: ${BREAKPTS.LG}px) {
    max-width: 100%;
    padding: 0 16px;
  }
  @media (max-width: ${BREAKPTS.SM}px) {
    max-width: 100%;
    padding: 0 16px;
  }
`;
