import { FC } from 'react';
import { useLocalStorage } from 'react-use';
import { useIsClutteredStore } from '../stores/clutter';

const CLUTTER_KEY = 'clutter';

// TODO(dave4506)
export const LocalStorageEffect: FC = () => {
  const {} = useIsClutteredStore();
  // const [value, setValue, remove] = useLocalStorage(CLUTTER_KEY, {});
  return <></>;
};
