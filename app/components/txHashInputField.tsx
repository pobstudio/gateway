import styled from 'styled-components';

const TxHashInput = styled.input`
  background: none;
  border: none;
  font-size: 20px;
  font-weight: 500;
  width: 100%;
  text-align: center;
  outline: none;
`;

export const TxHashInputField: React.FC = () => {
  return <TxHashInput type="text" placeholder="Paste an Ethereum txhash..." />;
};
