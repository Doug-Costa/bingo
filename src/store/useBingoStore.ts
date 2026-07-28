import { create } from 'zustand';

export interface Winner {
  name: string;
  location: string;
  amount: number;
}

export interface Prizes {
  line: number;
  full: number;
}

interface BingoState {
  isDemoMode: boolean;
  ballsDrawn: number[];
  currentBall: number | null;
  prizes: Prizes;
  winners: Winner[];
  demoInterval: number; // in seconds
  addBall: (num: number) => void;
  setDemoMode: (val: boolean) => void;
  resetGame: () => void;
  setWinners: (winners: Winner[]) => void;
  setDemoInterval: (sec: number) => void;
  updatePrizes: (prizes: Prizes) => void;
}

export const useBingoStore = create<BingoState>((set) => ({
  isDemoMode: false,
  ballsDrawn: [],
  currentBall: null,
  prizes: {
    line: 500,
    full: 5000,
  },
  winners: [
    { name: 'Carlos Silva', location: 'São Paulo - SP', amount: 500 },
    { name: 'Maria Souza', location: 'Rio de Janeiro - RJ', amount: 5000 },
    { name: 'Fernanda Lima', location: 'Belo Horizonte - MG', amount: 500 },
    { name: 'João Santos', location: 'Curitiba - PR', amount: 500 },
    { name: 'Ana Oliveira', location: 'Salvador - BA', amount: 5000 },
  ],
  demoInterval: 5,

  addBall: (num: number) =>
    set((state) => {
      if (state.ballsDrawn.includes(num)) return {};
      return {
        ballsDrawn: [...state.ballsDrawn, num],
        currentBall: num,
      };
    }),

  setDemoMode: (val: boolean) =>
    set(() => ({
      isDemoMode: val,
    })),

  resetGame: () =>
    set(() => ({
      ballsDrawn: [],
      currentBall: null,
    })),

  setWinners: (winners: Winner[]) =>
    set(() => ({
      winners,
    })),

  setDemoInterval: (sec: number) =>
    set(() => ({
      demoInterval: sec,
    })),

  updatePrizes: (prizes: Prizes) =>
    set(() => ({
      prizes,
    })),
}));
