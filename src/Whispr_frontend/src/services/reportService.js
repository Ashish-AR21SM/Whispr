import { 
  submitReport as apiSubmitReport,
  getUserReports,
  getReportById,
  getAllReports,
  getReportsByStatus,
  isAuthority
} from '../api/whisprBackend';

export const reportService = {
  async submitReport(reportData) {
    try {
      const result = await apiSubmitReport(reportData);
      return result;
    } catch (error) {
      console.error('Error submitting report:', error);
      throw new Error(error.message || 'Failed to submit report');
    }
  },

  async getUserReports() {
    try {
      const reports = await getUserReports();
      console.log('getUserReports returned:', reports?.length || 0, 'reports');
      return reports || [];
    } catch (error) {
      console.error('Error fetching user reports:', error.message);
      return [];
    }
  },

  async getReportById(id) {
    try {
      const report = await getReportById(id);
      return report;
    } catch (error) {
      console.error('Error fetching report by ID:', error.message);
      return null;
    }
  },

  async getAllReports() {
    try {
      // Check if user is authority - if so, get all reports, otherwise get user's reports
      let isAuth = false;
      try {
        isAuth = await isAuthority();
      } catch (authError) {
        console.warn('Authority check failed:', authError.message);
      }
      
      if (isAuth) {
        const reports = await getAllReports();
        console.log('getAllReports (authority) returned:', reports?.length || 0, 'reports');
        return reports || [];
      } else {
        const reports = await getUserReports();
        console.log('getAllReports (user) returned:', reports?.length || 0, 'reports');
        return reports || [];
      }
    } catch (error) {
      console.error('Error fetching reports:', error.message);
      return [];
    }
  },

  async getReportsByStatus(status) {
    try {
      // Check if user is authority - if so, get all reports by status, otherwise filter user's reports
      let isAuth = false;
      try {
        isAuth = await isAuthority();
      } catch (authError) {
        console.warn('Authority check failed:', authError.message);
      }
      
      if (isAuth) {
        // Authority can see all reports filtered by status
        const reports = await getReportsByStatus(status);
        console.log('getReportsByStatus (authority) returned:', reports?.length || 0, 'reports');
        return reports || [];
      } else {
        // Regular user: get their own reports and filter by status
        const userReports = await getUserReports();
        const filteredReports = (userReports || []).filter(r => r.status === status);
        console.log('getReportsByStatus (user) returned:', filteredReports.length, 'reports');
        return filteredReports;
      }
    } catch (error) {
      console.error('Error fetching reports by status:', error.message);
      return [];
    }
  },

  // Get only the current user's reports filtered by status (for dashboard)
  async getUserReportsByStatus(status) {
    try {
      const userReports = await getUserReports();
      const filteredReports = (userReports || []).filter(r => r.status === status);
      console.log('getUserReportsByStatus returned:', filteredReports.length, 'reports');
      return filteredReports;
    } catch (error) {
      console.error('Error fetching user reports by status:', error.message);
      return [];
    }
  }
};
