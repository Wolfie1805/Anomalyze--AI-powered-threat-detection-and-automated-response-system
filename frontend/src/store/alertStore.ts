import { create } from 'zustand';
import { Alert } from '../types';
import { fetchAlerts } from '../api/alerts';

interface AlertState {
  alerts: Alert[];
  total: number;
  isLoading: boolean;
  error: string | null;
  loadAlerts: (skip?: number, limit?: number) => Promise<void>;
  addAlert: (alert: Alert) => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  total: 0,
  isLoading: false,
  error: null,
  
  loadAlerts: async (skip = 0, limit = 50) => {
    try {
      set({ isLoading: true, error: null });
      const data = await fetchAlerts(skip, limit);
      set({ alerts: data.alerts, total: data.total, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
  
  addAlert: (alert) => set((state) => ({ 
    alerts: [alert, ...state.alerts],
    total: state.total + 1
  })),
}));
