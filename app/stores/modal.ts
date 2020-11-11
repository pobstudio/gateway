import create from 'zustand';

type State = {
  isWalletModalOpen: boolean;
  setIsWalletModalOpen: (s: boolean) => void;
  toggleIsWalletModalOpen: () => void;
  isMenuModalOpen: boolean;
  setIsMenuModalOpen: (s: boolean) => void;
  toggleIsMenuModalOpen: () => void;
};

export const useModalStore = create<State>((set, get) => ({
  isWalletModalOpen: false,
  setIsWalletModalOpen: (s) => set({ isWalletModalOpen: s }),
  toggleIsWalletModalOpen: () =>
    set((s) => ({
      isWalletModalOpen: !s.isWalletModalOpen,
      isSearchModalOpen: false,
      isMenuModalOpen: false,
    })),
  isMenuModalOpen: false,
  setIsMenuModalOpen: (s) => set({ isMenuModalOpen: s }),
  toggleIsMenuModalOpen: () =>
    set((s) => ({
      isMenuModalOpen: !s.isMenuModalOpen,
      isSearchModalOpen: false,
      isWalletModalOpen: false,
    })),
}));
