/**
 * Tests for storage utility functions
 * @file storage.test.js
 */

import { storage, reportStorage } from '../../utils/storage';
import { STORAGE_KEYS } from '../../constants';

// Create localStorage mock
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value; }),
    removeItem: jest.fn((key) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Storage Utilities', () => {
  
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
    localStorageMock.clear();
  });

  describe('storage.get', () => {
    it('should return parsed JSON from localStorage', () => {
      const mockData = { name: 'test', value: 123 };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData));

      const result = storage.get('testKey');
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('testKey');
      expect(result).toEqual(mockData);
    });

    it('should return default value when key does not exist', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = storage.get('nonExistent', 'defaultValue');
      
      expect(result).toBe('defaultValue');
    });

    it('should return null as default when no default provided', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = storage.get('nonExistent');
      
      expect(result).toBeNull();
    });

    it('should return default value on JSON parse error', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      const result = storage.get('badKey', 'fallback');
      
      expect(result).toBe('fallback');
    });
  });

  describe('storage.set', () => {
    it('should stringify and store value', () => {
      const data = { test: 'value' };
      
      storage.set('myKey', data);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('myKey', JSON.stringify(data));
    });

    it('should handle string values', () => {
      storage.set('stringKey', 'hello');
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('stringKey', '"hello"');
    });

    it('should handle number values', () => {
      storage.set('numKey', 42);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('numKey', '42');
    });

    it('should handle array values', () => {
      storage.set('arrayKey', [1, 2, 3]);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('arrayKey', '[1,2,3]');
    });
  });

  describe('storage.remove', () => {
    it('should call localStorage.removeItem', () => {
      storage.remove('keyToRemove');
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('keyToRemove');
    });
  });

  describe('storage.clear', () => {
    it('should call localStorage.clear', () => {
      storage.clear();
      
      expect(localStorageMock.clear).toHaveBeenCalled();
    });
  });

  describe('reportStorage', () => {
    describe('getReports', () => {
      it('should get reports from correct storage key', () => {
        const mockReports = [{ id: 1, title: 'Report 1' }];
        localStorageMock.getItem.mockReturnValue(JSON.stringify(mockReports));

        const result = reportStorage.getReports();
        
        expect(localStorageMock.getItem).toHaveBeenCalledWith(STORAGE_KEYS.REPORTS);
        expect(result).toEqual(mockReports);
      });

      it('should return empty array when no reports exist', () => {
        localStorageMock.getItem.mockReturnValue(null);

        const result = reportStorage.getReports();
        
        expect(result).toEqual([]);
      });
    });

    describe('setReports', () => {
      it('should store reports with correct key', () => {
        const reports = [{ id: 1, title: 'Test' }];
        
        reportStorage.setReports(reports);
        
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          STORAGE_KEYS.REPORTS,
          JSON.stringify(reports)
        );
      });
    });

    describe('getReportDetails', () => {
      it('should get report details from correct storage key', () => {
        const mockDetails = [{ id: 1, description: 'Details' }];
        localStorageMock.getItem.mockReturnValue(JSON.stringify(mockDetails));

        const result = reportStorage.getReportDetails();
        
        expect(localStorageMock.getItem).toHaveBeenCalledWith(STORAGE_KEYS.REPORTS_DETAILS);
        expect(result).toEqual(mockDetails);
      });
    });

    describe('getTokenBalance', () => {
      it('should return token balance', () => {
        localStorageMock.getItem.mockReturnValue('100');

        const result = reportStorage.getTokenBalance();
        
        expect(localStorageMock.getItem).toHaveBeenCalledWith(STORAGE_KEYS.TOKEN_BALANCE);
        expect(result).toBe(100);
      });

      it('should return 0 when no balance exists', () => {
        localStorageMock.getItem.mockReturnValue(null);

        const result = reportStorage.getTokenBalance();
        
        expect(result).toBe(0);
      });
    });

    describe('setTokenBalance', () => {
      it('should store token balance', () => {
        reportStorage.setTokenBalance(500);
        
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          STORAGE_KEYS.TOKEN_BALANCE,
          '500'
        );
      });
    });

    describe('updateReportStatus', () => {
      it('should update report status in both reports and details', () => {
        const mockReports = [
          { id: '1', title: 'Report 1', status: 'pending' },
          { id: '2', title: 'Report 2', status: 'pending' },
        ];
        const mockDetails = [
          { id: '1', title: 'Report 1', status: 'pending' },
        ];

        localStorageMock.getItem
          .mockReturnValueOnce(JSON.stringify(mockReports))
          .mockReturnValueOnce(JSON.stringify(mockDetails));

        reportStorage.updateReportStatus('1', 'verified', 'Approved');

        // Should have called setItem for both reports and details
        expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);
      });

      it('should handle report not found gracefully', () => {
        localStorageMock.getItem
          .mockReturnValueOnce(JSON.stringify([]))
          .mockReturnValueOnce(JSON.stringify([]));

        // Should not throw
        expect(() => {
          reportStorage.updateReportStatus('999', 'verified');
        }).not.toThrow();
      });
    });
  });
});
