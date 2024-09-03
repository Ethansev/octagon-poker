// store for the home page, specifically the dialogs

import { create } from 'zustand';

interface HomeStore {
  isNewPlayerDialogOpen: boolean;
  setIsNewPlayerDialogOpen: (isOpen: boolean) => void;
  isNewGameDialogOpen: boolean;
  setIsNewGameDialogOpen: (isOpen: boolean) => void;
}

export const useHomeStore = create<HomeStore>((set) => ({
  isNewPlayerDialogOpen: false,
  setIsNewPlayerDialogOpen: (isOpen) => set({ isNewPlayerDialogOpen: isOpen }),
  isNewGameDialogOpen: false,
  setIsNewGameDialogOpen: (isOpen) => set({ isNewGameDialogOpen: isOpen }),
}));
