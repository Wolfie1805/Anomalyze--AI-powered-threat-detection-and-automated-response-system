import { useState, useEffect } from 'react';
import { fetchDashboardStats, fetchThreatLevel } from '../api/dashboard';
import { DashboardStats } from '../types';

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [threatLevel, setThreatLevel] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [statsData, threatData] = await Promise.all([
        fetchDashboardStats(),
        fetchThreatLevel()
      ]);
      setStats(statsData);
      setThreatLevel(threatData.level);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  return { stats, threatLevel, isLoading, refresh: loadData };
};
