import {
  getAuthorityStatistics,
  verifyReport,
  rejectReport,
  getTokenBalance
} from '../api/whisprBackend';

export const authorityService = {
  async getStatistics() {
    try {
      return await getAuthorityStatistics();
    } catch (error) {
      return {
        reports_pending: 0,
        reports_verified: 0,
        reports_rejected: 0,
        total_rewards_distributed: 0
      };
    }
  },

  async verifyReport(reportId, notes) {
    try {
      return await verifyReport(reportId, notes);
    } catch (error) {
      throw new Error(error.message || 'Failed to verify report');
    }
  },

  async rejectReport(reportId, notes) {
    try {
      return await rejectReport(reportId, notes);
    } catch (error) {
      throw new Error(error.message || 'Failed to reject report');
    }
  },

  async getTokenBalance() {
    try {
      return await getTokenBalance();
    } catch (error) {
      return 0;
    }
  }
};
