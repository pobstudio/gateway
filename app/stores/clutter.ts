import create from 'zustand';
import produce from 'immer';

interface KeyToIsClutterMap {
  [key: string]: boolean;
}

type State = {
  clutterMap: KeyToIsClutterMap;
  setIsClutterForMap: (key: string, isCluttered: boolean) => void;
};

export const useIsClutteredStore = create<State>((set, get) => ({
  clutterMap: {},
  setIsClutterForMap: (key: string, isCluttered: boolean) => {
    set(
      produce((update) => {
        update.clutterMap[key] = isCluttered;
      }),
    );
  },
}));
