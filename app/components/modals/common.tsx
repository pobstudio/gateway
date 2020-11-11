import { animated } from 'react-spring';
import styled from 'styled-components';
import { HEADER_HEIGHT, MOBILE_HEADER_HEIGHT } from '../../constants';
import { BREAKPTS } from '../../styles';
export const ModalContainer = styled.div`
  position: fixed;
  z-index: 999;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: scroll;
  padding-top: ${HEADER_HEIGHT}px;
  @media (max-width: ${BREAKPTS.SM}px) {
    align-items: flex-start;
    padding-top: calc(64px + ${MOBILE_HEADER_HEIGHT}px);
  }
`;

export const AnimatedModalContainer = animated(ModalContainer);

export const ModalCloseRow = styled.div`
  display: flex;
  flex-direction: row-reverse;
  padding: 0 0 32px 0;
  @media (max-width: ${BREAKPTS.SM}px) {
    display: none;
  }
`;
