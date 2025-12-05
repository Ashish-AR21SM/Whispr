export const REPORT_CATEGORIES = [
  { value: 'environmental', label: 'Environmental' },
  { value: 'fraud', label: 'Fraud' },
  { value: 'cybercrime', label: 'Cybercrime' },
  { value: 'corruption', label: 'Corruption' },
  { value: 'violence', label: 'Violence' },
  { value: 'domestic_violence', label: 'Domestic Violence' }
];

export const REPORT_STATUS = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  VERIFIED: 'verified',
  REJECTED: 'rejected'
};

export const SORT_OPTIONS = {
  DATE: 'date',
  STAKE: 'stake',
  EVIDENCE: 'evidence',
  TITLE: 'title'
};

export const SORT_DIRECTIONS = {
  ASC: 'asc',
  DESC: 'desc'
};

// Detect environment for canister configuration
const isLocal = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.includes('.localhost')
);

export const CANISTER_CONFIG = {
  CANISTER_ID: isLocal ? "uxrrr-q7777-77774-qaaaq-cai" : "bdggw-2qaaa-aaaag-aua3q-cai",
  HOST: isLocal ? "http://localhost:4943" : "https://icp-api.io"
};

export const STORAGE_KEYS = {
  REPORTS: 'whispr_reports',
  REPORTS_DETAILS: 'whispr_reports_details',
  TOKEN_BALANCE: 'whispr_token_balance'
};

export const DEFAULT_STAKE_AMOUNT = 10;
export const DEFAULT_REWARD_MULTIPLIER = 10;
