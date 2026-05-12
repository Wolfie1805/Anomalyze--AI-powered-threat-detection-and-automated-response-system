import { create } from 'zustand';

interface WsState {
  isConnected: boolean;
  systemStats: any;
  setConnected: (status: boolean) => void;
  setSystemStats: (stats: any) => void;
}

export const useWsStore = create<WsState>((set) => ({
  isConnected: false,
  systemStats: null,
  setConnected: (status) => set({ isConnected: status }),
  setSystemStats: (stats) => set({ systemStats: stats }),
}));
