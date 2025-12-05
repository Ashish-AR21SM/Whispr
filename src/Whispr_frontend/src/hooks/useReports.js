import { useState, useEffect, useCallback, useRef } from 'react';
import { reportService } from '../services/reportService';

export const useReports = (status = 'all') => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Prevent duplicate fetches
  const fetchingRef = useRef(false);
  const mountedRef = useRef(true);

  const fetchReports = useCallback(async () => {
    // Prevent concurrent fetches
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    
    try {
      setLoading(true);
      setError(null);
      
      // Dashboard should always show only the user's own reports
      // Use getUserReports to ensure users only see their own reports
      const data = status === 'all' 
        ? await reportService.getUserReports()
        : await reportService.getUserReportsByStatus(status);
      
      // Only update state if component is still mounted
      if (mountedRef.current) {
        setReports(data || []);
      }
    } catch (err) {
      console.error('Error in useReports:', err);
      if (mountedRef.current) {
        setError(err.message || 'Failed to fetch reports');
        setReports([]);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      fetchingRef.current = false;
    }
  }, [status]);

  useEffect(() => {
    mountedRef.current = true;
    fetchReports();
    
    return () => {
      mountedRef.current = false;
    };
  }, [fetchReports]);

  const refreshReports = useCallback(() => {
    fetchingRef.current = false;
    fetchReports();
  }, [fetchReports]);

  return {
    reports,
    loading,
    error,
    refreshReports
  };
};
