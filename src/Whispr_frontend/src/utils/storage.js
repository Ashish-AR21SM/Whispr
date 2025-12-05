import { STORAGE_KEYS } from '../constants';

export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error);
      return defaultValue;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting ${key} in localStorage:`, error);
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  },

  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};

export const reportStorage = {
  getReports: () => storage.get(STORAGE_KEYS.REPORTS, []),
  setReports: (reports) => storage.set(STORAGE_KEYS.REPORTS, reports),
  
  getReportDetails: () => storage.get(STORAGE_KEYS.REPORTS_DETAILS, []),
  setReportDetails: (details) => storage.set(STORAGE_KEYS.REPORTS_DETAILS, details),
  
  getTokenBalance: () => storage.get(STORAGE_KEYS.TOKEN_BALANCE, 0),
  setTokenBalance: (balance) => storage.set(STORAGE_KEYS.TOKEN_BALANCE, balance),
  
  updateReportStatus: (reportId, status, notes = '') => {
    const reports = reportStorage.getReports();
    const details = reportStorage.getReportDetails();
    
    const reportIndex = reports.findIndex(r => String(r.id) === String(reportId));
    if (reportIndex !== -1) {
      reports[reportIndex].status = status;
      reportStorage.setReports(reports);
    }
    
    const detailIndex = details.findIndex(r => String(r.id) === String(reportId));
    if (detailIndex !== -1) {
      details[detailIndex].status = status;
      details[detailIndex].reviewNotes = notes;
      details[detailIndex].reviewDate = new Date().toISOString();
      reportStorage.setReportDetails(details);
    }
  }
};
