import create from 'zustand';

type State = {
  isAudioMuted: boolean;
  setIsAudioMuted: (s: boolean) => void;
  toggleIsAudioMuted: () => void;
};

export const useAudioStore = create<State>((set, get) => ({
  isAudioMuted: false,
  setIsAudioMuted: (s) => set({ isAudioMuted: s }),
  toggleIsAudioMuted: () =>
    set((s) => ({
      isAudioMuted: !s.isAudioMuted,
    })),
}));
