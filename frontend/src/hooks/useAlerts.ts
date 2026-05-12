import { useEffect } from 'react';
import { useAlertStore } from '../store/alertStore';

export const useAlerts = () => {
  const { alerts, total, isLoading, error, loadAlerts } = useAlertStore();

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  return { alerts, total, isLoading, error, refresh: loadAlerts };
};
