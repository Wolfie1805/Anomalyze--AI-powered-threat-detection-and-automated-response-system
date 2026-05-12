import { apiClient } from './axios';

export const fetchAlerts = async (skip = 0, limit = 50, severity?: string, status?: string) => {
  const { data } = await apiClient.get('/alerts', { params: { skip, limit, severity, status } });
  return data;
};

export const updateAlertStatus = async (id: number, status: string) => {
  const { data } = await apiClient.patch(`/alerts/${id}/status`, null, { params: { status } });
  return data;
};

export const fetchAlertStats = async () => {
  const { data } = await apiClient.get('/alerts/stats');
  return data;
};
