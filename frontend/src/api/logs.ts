import { apiClient } from './axios';

export const fetchLogs = async (skip = 0, limit = 50) => {
  const { data } = await apiClient.get('/logs', { params: { skip, limit } });
  return data;
};
