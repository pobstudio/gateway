import { animated } from 'react-spring';
import styled from 'styled-components';

export const Flex = styled.div`
  display: flex;
  align-items: center;
`;
export const AFlex = animated(Flex);

export const FlexEnds = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const AFlexEnds = animated(FlexEnds);

export const FlexCenterColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
export const AFlexCenterColumn = animated(FlexCenterColumn);

export const FlexCenter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
export const AFlexCenter = animated(FlexCenter);
