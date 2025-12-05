import { useState, useMemo } from 'react';

export const useFilters = (data, initialFilters = {}) => {
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    status: 'all',
    sortBy: 'date',
    sortDirection: 'desc',
    ...initialFilters
  });

  const filteredData = useMemo(() => {
    if (!data) return [];

    let result = [...data];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(item => 
        (item.title?.toLowerCase() || '').includes(searchLower) ||
        (item.id?.toLowerCase() || '').includes(searchLower) ||
        (item.description?.toLowerCase() || '').includes(searchLower)
      );
    }

    if (filters.category && filters.category !== 'all') {
      result = result.filter(item => item.category === filters.category);
    }

    if (filters.status && filters.status !== 'all') {
      result = result.filter(item => item.status === filters.status);
    }

    result.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'date':
          comparison = new Date(a.date || 0) - new Date(b.date || 0);
          break;
        case 'stake':
          comparison = (a.stakeAmount || 0) - (b.stakeAmount || 0);
          break;
        case 'evidence':
          comparison = (a.evidenceCount || 0) - (b.evidenceCount || 0);
          break;
        case 'title':
          comparison = (a.title || '').localeCompare(b.title || '');
          break;
        default:
          comparison = 0;
      }
      
      return filters.sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [data, filters]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      status: 'all',
      sortBy: 'date',
      sortDirection: 'desc',
      ...initialFilters
    });
  };

  return {
    filters,
    filteredData,
    updateFilter,
    resetFilters
  };
};
