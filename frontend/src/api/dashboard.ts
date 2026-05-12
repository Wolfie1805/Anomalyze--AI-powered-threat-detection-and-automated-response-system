import { apiClient } from './axios';
import { DashboardStats } from '../types';

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const { data } = await apiClient.get('/dashboard/stats');
  return data;
};

export const fetchThreatLevel = async (): Promise<{ level: number }> => {
  const { data } = await apiClient.get('/dashboard/threat-level');
  return data;
};
