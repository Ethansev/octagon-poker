import { create } from 'zustand';

type GameStore = {
  activePlayerIds: number[];
  setActivePlayerIds: (players: number[]) => void;
  resetActivePlayerIds: () => void;
};

export const useGameStore = create<GameStore>((set) => ({
  activePlayerIds: [],
  setActivePlayerIds: (players) => set({ activePlayerIds: players }),
  resetActivePlayerIds: () => set({ activePlayerIds: [] }),
}));
