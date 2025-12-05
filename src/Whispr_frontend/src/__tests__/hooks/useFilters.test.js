/**
 * Tests for useFilters hook
 * @file useFilters.test.js
 */

import { renderHook, act } from '@testing-library/react';
import { useFilters } from '../../hooks/useFilters';

describe('useFilters Hook', () => {
  const mockData = [
    { id: '1', title: 'Fraud Report', category: 'fraud', status: 'pending', date: '2024-01-15', stakeAmount: 100, evidenceCount: 3 },
    { id: '2', title: 'Environmental Issue', category: 'environmental', status: 'verified', date: '2024-01-10', stakeAmount: 50, evidenceCount: 1 },
    { id: '3', title: 'Corruption Case', category: 'corruption', status: 'pending', date: '2024-01-20', stakeAmount: 200, evidenceCount: 5 },
    { id: '4', title: 'Another Fraud', category: 'fraud', status: 'rejected', date: '2024-01-05', stakeAmount: 75, evidenceCount: 2 },
  ];

  describe('Initial State', () => {
    it('should initialize with default filters', () => {
      const { result } = renderHook(() => useFilters(mockData));

      expect(result.current.filters).toEqual({
        search: '',
        category: 'all',
        status: 'all',
        sortBy: 'date',
        sortDirection: 'desc',
      });
    });

    it('should merge initial filters with defaults', () => {
      const { result } = renderHook(() => 
        useFilters(mockData, { status: 'pending' })
      );

      expect(result.current.filters.status).toBe('pending');
      expect(result.current.filters.category).toBe('all');
    });

    it('should return all data when no filters applied', () => {
      const { result } = renderHook(() => useFilters(mockData));

      expect(result.current.filteredData).toHaveLength(4);
    });

    it('should handle null data', () => {
      const { result } = renderHook(() => useFilters(null));

      expect(result.current.filteredData).toEqual([]);
    });

    it('should handle undefined data', () => {
      const { result } = renderHook(() => useFilters(undefined));

      expect(result.current.filteredData).toEqual([]);
    });
  });

  describe('Search Filter', () => {
    it('should filter by title', () => {
      const { result } = renderHook(() => useFilters(mockData));

      act(() => {
        result.current.updateFilter('search', 'Fraud');
      });

      expect(result.current.filteredData).toHaveLength(2);
      expect(result.current.filteredData.every(r => 
        r.title.toLowerCase().includes('fraud')
      )).toBe(true);
    });

    it('should filter by ID', () => {
      const { result } = renderHook(() => useFilters(mockData));

      act(() => {
        result.current.updateFilter('search', '1');
      });

      expect(result.current.filteredData.some(r => r.id === '1')).toBe(true);
    });

    it('should be case insensitive', () => {
      const { result } = renderHook(() => useFilters(mockData));

      act(() => {
        result.current.updateFilter('search', 'FRAUD');
      });

      expect(result.current.filteredData).toHaveLength(2);
    });

    it('should return empty array when no matches', () => {
      const { result } = renderHook(() => useFilters(mockData));

      act(() => {
        result.current.updateFilter('search', 'nonexistent');
      });

      expect(result.current.filteredData).toEqual([]);
    });
  });

  describe('Category Filter', () => {
    it('should filter by category', () => {
      const { result } = renderHook(() => useFilters(mockData));

      act(() => {
        result.current.updateFilter('category', 'fraud');
      });

      expect(result.current.filteredData).toHaveLength(2);
      expect(result.current.filteredData.every(r => r.category === 'fraud')).toBe(true);
    });

    it('should return all when category is "all"', () => {
      const { result } = renderHook(() => useFilters(mockData));

      act(() => {
        result.current.updateFilter('category', 'all');
      });

      expect(result.current.filteredData).toHaveLength(4);
    });
  });

  describe('Status Filter', () => {
    it('should filter by status', () => {
      const { result } = renderHook(() => useFilters(mockData));

      act(() => {
        result.current.updateFilter('status', 'pending');
      });

      expect(result.current.filteredData).toHaveLength(2);
      expect(result.current.filteredData.every(r => r.status === 'pending')).toBe(true);
    });

    it('should return all when status is "all"', () => {
      const { result } = renderHook(() => useFilters(mockData));

      act(() => {
        result.current.updateFilter('status', 'all');
      });

      expect(result.current.filteredData).toHaveLength(4);
    });
  });

  describe('Combined Filters', () => {
    it('should apply multiple filters', () => {
      const { result } = renderHook(() => useFilters(mockData));

      act(() => {
        result.current.updateFilter('category', 'fraud');
        result.current.updateFilter('status', 'pending');
      });

      expect(result.current.filteredData).toHaveLength(1);
      expect(result.current.filteredData[0].id).toBe('1');
    });
  });

  describe('Sorting', () => {
    it('should sort by date descending by default', () => {
      const { result } = renderHook(() => useFilters(mockData));

      const dates = result.current.filteredData.map(r => new Date(r.date).getTime());
      expect(dates).toEqual([...dates].sort((a, b) => b - a));
    });

    it('should sort by date ascending', () => {
      const { result } = renderHook(() => useFilters(mockData));

      act(() => {
        result.current.updateFilter('sortDirection', 'asc');
      });

      const dates = result.current.filteredData.map(r => new Date(r.date).getTime());
      expect(dates).toEqual([...dates].sort((a, b) => a - b));
    });

    it('should sort by stake amount', () => {
      const { result } = renderHook(() => useFilters(mockData));

      act(() => {
        result.current.updateFilter('sortBy', 'stake');
        result.current.updateFilter('sortDirection', 'desc');
      });

      const stakes = result.current.filteredData.map(r => r.stakeAmount);
      expect(stakes).toEqual([...stakes].sort((a, b) => b - a));
    });

    it('should sort by evidence count', () => {
      const { result } = renderHook(() => useFilters(mockData));

      act(() => {
        result.current.updateFilter('sortBy', 'evidence');
        result.current.updateFilter('sortDirection', 'desc');
      });

      const evidence = result.current.filteredData.map(r => r.evidenceCount);
      expect(evidence).toEqual([...evidence].sort((a, b) => b - a));
    });

    it('should sort by title', () => {
      const { result } = renderHook(() => useFilters(mockData));

      act(() => {
        result.current.updateFilter('sortBy', 'title');
        result.current.updateFilter('sortDirection', 'asc');
      });

      const titles = result.current.filteredData.map(r => r.title);
      expect(titles).toEqual([...titles].sort());
    });
  });

  describe('Reset Filters', () => {
    it('should reset all filters to defaults', () => {
      const { result } = renderHook(() => useFilters(mockData));

      act(() => {
        result.current.updateFilter('search', 'test');
        result.current.updateFilter('category', 'fraud');
        result.current.updateFilter('status', 'pending');
      });

      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.filters).toEqual({
        search: '',
        category: 'all',
        status: 'all',
        sortBy: 'date',
        sortDirection: 'desc',
      });
    });

    it('should preserve initial filters on reset', () => {
      const { result } = renderHook(() => 
        useFilters(mockData, { status: 'pending' })
      );

      act(() => {
        result.current.updateFilter('category', 'fraud');
      });

      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.filters.status).toBe('pending');
      expect(result.current.filters.category).toBe('all');
    });
  });

  describe('Update Filter', () => {
    it('should update single filter', () => {
      const { result } = renderHook(() => useFilters(mockData));

      act(() => {
        result.current.updateFilter('search', 'test');
      });

      expect(result.current.filters.search).toBe('test');
    });

    it('should preserve other filters when updating one', () => {
      const { result } = renderHook(() => useFilters(mockData));

      act(() => {
        result.current.updateFilter('category', 'fraud');
      });

      act(() => {
        result.current.updateFilter('status', 'pending');
      });

      expect(result.current.filters.category).toBe('fraud');
      expect(result.current.filters.status).toBe('pending');
    });
  });
});
