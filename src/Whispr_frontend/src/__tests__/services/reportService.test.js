/**
 * Tests for Report Service
 * @file reportService.test.js
 */

import { reportService } from '../../services/reportService';
import * as whisprBackend from '../../api/whisprBackend';

// Mock the whisprBackend module
jest.mock('../../api/whisprBackend', () => ({
  submitReport: jest.fn(),
  getUserReports: jest.fn(),
  getReportById: jest.fn(),
  getAllReports: jest.fn(),
  getReportsByStatus: jest.fn(),
  isAuthority: jest.fn(),
}));

describe('Report Service', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('submitReport', () => {
    it('should call API submitReport with report data', async () => {
      const mockReportData = {
        title: 'Test Report',
        description: 'Test Description',
        category: 'fraud',
        stakeAmount: 10,
      };
      const mockResult = { id: 1, ...mockReportData };
      
      whisprBackend.submitReport.mockResolvedValue(mockResult);

      const result = await reportService.submitReport(mockReportData);

      expect(whisprBackend.submitReport).toHaveBeenCalledWith(mockReportData);
      expect(result).toEqual(mockResult);
    });

    it('should throw error when API fails', async () => {
      whisprBackend.submitReport.mockRejectedValue(new Error('Network error'));

      await expect(reportService.submitReport({})).rejects.toThrow('Network error');
    });

    it('should wrap error with custom message when no message provided', async () => {
      whisprBackend.submitReport.mockRejectedValue(new Error());

      await expect(reportService.submitReport({})).rejects.toThrow('Failed to submit report');
    });
  });

  describe('getUserReports', () => {
    it('should return user reports from API', async () => {
      const mockReports = [
        { id: 1, title: 'Report 1' },
        { id: 2, title: 'Report 2' },
      ];
      
      whisprBackend.getUserReports.mockResolvedValue(mockReports);

      const result = await reportService.getUserReports();

      expect(whisprBackend.getUserReports).toHaveBeenCalled();
      expect(result).toEqual(mockReports);
    });

    it('should return empty array when API returns null', async () => {
      whisprBackend.getUserReports.mockResolvedValue(null);

      const result = await reportService.getUserReports();

      expect(result).toEqual([]);
    });

    it('should return empty array on API error', async () => {
      whisprBackend.getUserReports.mockRejectedValue(new Error('API Error'));

      const result = await reportService.getUserReports();

      expect(result).toEqual([]);
    });
  });

  describe('getReportById', () => {
    it('should return report from API', async () => {
      const mockReport = { id: 1, title: 'Test Report' };
      
      whisprBackend.getReportById.mockResolvedValue(mockReport);

      const result = await reportService.getReportById(1);

      expect(whisprBackend.getReportById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockReport);
    });

    it('should return null on API error', async () => {
      whisprBackend.getReportById.mockRejectedValue(new Error('Not found'));

      const result = await reportService.getReportById(999);

      expect(result).toBeNull();
    });
  });

  describe('getAllReports', () => {
    it('should return all reports for authority users', async () => {
      const mockReports = [
        { id: 1, title: 'Report 1' },
        { id: 2, title: 'Report 2' },
        { id: 3, title: 'Report 3' },
      ];
      
      whisprBackend.isAuthority.mockResolvedValue(true);
      whisprBackend.getAllReports.mockResolvedValue(mockReports);

      const result = await reportService.getAllReports();

      expect(whisprBackend.isAuthority).toHaveBeenCalled();
      expect(whisprBackend.getAllReports).toHaveBeenCalled();
      expect(result).toEqual(mockReports);
    });

    it('should return user reports for non-authority users', async () => {
      const mockUserReports = [{ id: 1, title: 'User Report' }];
      
      whisprBackend.isAuthority.mockResolvedValue(false);
      whisprBackend.getUserReports.mockResolvedValue(mockUserReports);

      const result = await reportService.getAllReports();

      expect(whisprBackend.isAuthority).toHaveBeenCalled();
      expect(whisprBackend.getUserReports).toHaveBeenCalled();
      expect(whisprBackend.getAllReports).not.toHaveBeenCalled();
      expect(result).toEqual(mockUserReports);
    });

    it('should treat failed authority check as non-authority', async () => {
      const mockUserReports = [{ id: 1, title: 'User Report' }];
      
      whisprBackend.isAuthority.mockRejectedValue(new Error('Auth failed'));
      whisprBackend.getUserReports.mockResolvedValue(mockUserReports);

      const result = await reportService.getAllReports();

      expect(result).toEqual(mockUserReports);
    });

    it('should return empty array on complete failure', async () => {
      whisprBackend.isAuthority.mockResolvedValue(false);
      whisprBackend.getUserReports.mockRejectedValue(new Error('Failed'));

      const result = await reportService.getAllReports();

      expect(result).toEqual([]);
    });
  });

  describe('getReportsByStatus', () => {
    it('should return filtered reports for authority users', async () => {
      const mockReports = [
        { id: 1, title: 'Report 1', status: 'pending' },
        { id: 2, title: 'Report 2', status: 'pending' },
      ];
      
      whisprBackend.isAuthority.mockResolvedValue(true);
      whisprBackend.getReportsByStatus.mockResolvedValue(mockReports);

      const result = await reportService.getReportsByStatus('pending');

      expect(whisprBackend.getReportsByStatus).toHaveBeenCalledWith('pending');
      expect(result).toEqual(mockReports);
    });

    it('should filter user reports by status for non-authority users', async () => {
      const mockUserReports = [
        { id: 1, title: 'Report 1', status: 'pending' },
        { id: 2, title: 'Report 2', status: 'verified' },
        { id: 3, title: 'Report 3', status: 'pending' },
      ];
      
      whisprBackend.isAuthority.mockResolvedValue(false);
      whisprBackend.getUserReports.mockResolvedValue(mockUserReports);

      const result = await reportService.getReportsByStatus('pending');

      expect(result).toHaveLength(2);
      expect(result.every(r => r.status === 'pending')).toBe(true);
    });

    it('should return empty array on error', async () => {
      whisprBackend.isAuthority.mockResolvedValue(true);
      whisprBackend.getReportsByStatus.mockRejectedValue(new Error('Failed'));

      const result = await reportService.getReportsByStatus('pending');

      expect(result).toEqual([]);
    });
  });

  describe('getUserReportsByStatus', () => {
    it('should filter user reports by status', async () => {
      const mockUserReports = [
        { id: 1, title: 'Report 1', status: 'pending' },
        { id: 2, title: 'Report 2', status: 'verified' },
        { id: 3, title: 'Report 3', status: 'pending' },
      ];
      
      whisprBackend.getUserReports.mockResolvedValue(mockUserReports);

      const result = await reportService.getUserReportsByStatus('pending');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(3);
    });

    it('should return empty array when no reports match status', async () => {
      const mockUserReports = [
        { id: 1, title: 'Report 1', status: 'pending' },
      ];
      
      whisprBackend.getUserReports.mockResolvedValue(mockUserReports);

      const result = await reportService.getUserReportsByStatus('verified');

      expect(result).toEqual([]);
    });

    it('should return empty array on error', async () => {
      whisprBackend.getUserReports.mockRejectedValue(new Error('Failed'));

      const result = await reportService.getUserReportsByStatus('pending');

      expect(result).toEqual([]);
    });
  });
});
