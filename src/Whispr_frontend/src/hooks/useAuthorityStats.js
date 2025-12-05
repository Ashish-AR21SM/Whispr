import { useState, useEffect } from 'react';
import { authorityService } from '../services/authorityService';

export const useAuthorityStats = () => {
  const [stats, setStats] = useState({
    reports_pending: 0,
    reports_verified: 0,
    reports_rejected: 0,
    total_rewards_distributed: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await authorityService.getStatistics();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refreshStats: fetchStats
  };
};
