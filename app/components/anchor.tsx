import { FC, HTMLProps } from 'react';
import styled from 'styled-components';

export const BaseAnchor = styled.a`
  outline: none;
  background: none;
  border: none;
  transition: 200ms ease-in-out transform;
  transform: scale(1, 1);
  padding: 0;
  &:hover {
    transform: scale(0.95, 0.95);
  }
`;

export const PrimaryAnchor = styled(BaseAnchor)`
  position: relative;
  &::after {
    content: '';
    transition: 200ms ease-in-out all;
    background: #f8f8f8;
    opacity: 0;
    position: absolute;
    z-index: -1;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
  }
  :hover {
    &::after {
      opacity: 1;
      transform: scale(1.05, 1.15);
    }
  }
`;
