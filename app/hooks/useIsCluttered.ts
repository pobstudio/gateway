import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useIsClutteredStore } from '../stores/clutter';

export const useIsCluttered = (
  key?: string,
): [boolean, (isCluttered: boolean) => void] => {
  const router = useRouter();
  const { clutterMap, setIsClutterForMap } = useIsClutteredStore();
  const isCluttered = useMemo(
    () => clutterMap[key ?? router.pathname] ?? true,
    [clutterMap, key, router.pathname],
  );
  const setIsCluttered = useCallback(
    (newIsCluttered: boolean) => {
      setIsClutterForMap(key ?? router.pathname, newIsCluttered);
    },
    [key, router.pathname, setIsClutterForMap],
  );
  return [isCluttered, setIsCluttered];
};
