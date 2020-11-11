import { FC } from 'react';
import { useAccountCollection } from '../hooks/useAccountCollection';

export const AccountCollectionEffect: FC<{ account?: string }> = ({
  account,
}) => {
  useAccountCollection(account);
  return <></>;
};
