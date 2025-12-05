import { useState, useEffect, useCallback, useRef } from 'react';
import { getAuthorityDashboardData, reinitializeWithIdentity } from '../api/whisprBackend';

// Combined hook for authority dashboard - fetches reports and stats in parallel
export const useAuthorityDashboard = () => {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    reports_pending: 0,
    reports_verified: 0,
    reports_rejected: 0,
    total_rewards_distributed: 0
  });
  const [isAuthority, setIsAuthority] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Prevent duplicate fetches and state updates after unmount
  const fetchingRef = useRef(false);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    // Prevent concurrent fetches
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    
    try {
      setLoading(true);
      setError(null);
      
      // Ensure the backend is using the correct identity (Plug wallet if connected)
      await reinitializeWithIdentity(null);
      
      const data = await getAuthorityDashboardData();
      
      // Only update state if component is still mounted
      if (mountedRef.current) {
        setReports(data.reports || []);
        setStats(data.stats || {
          reports_pending: 0,
          reports_verified: 0,
          reports_rejected: 0,
          total_rewards_distributed: 0
        });
        setIsAuthority(data.isAuthority || false);
      }
    } catch (err) {
      console.error('Error in useAuthorityDashboard:', err);
      if (mountedRef.current) {
        setError(err.message || 'Failed to load authority dashboard');
        setReports([]);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    
    return () => {
      mountedRef.current = false;
    };
  }, [fetchData]);

  const refresh = useCallback(() => {
    fetchingRef.current = false;
    fetchData();
  }, [fetchData]);

  return {
    reports,
    stats,
    isAuthority,
    loading,
    error,
    refresh
  };
};
