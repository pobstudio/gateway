import { FC } from 'react';
import styled from 'styled-components';
import { TOKEN_SYMBOL } from '../stores/tokens';

export const TokenLabelWrapper = styled.p`
  color: white;
  background: black;
  padding: 6px;
  font-size: 14px;
  font-weight: 700;
  margin: 0;
`;

export const TokenLabel: FC<{ className?: string }> = ({ className }) => {
  return (
    <TokenLabelWrapper className={className}>{TOKEN_SYMBOL}</TokenLabelWrapper>
  );
};
