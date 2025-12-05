import { Actor, HttpAgent } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';

let idlFactory = null;
let whisprBackend = null;
let initializationPromise = null;
let userIdentity = null;
let usingPlugWallet = false;

// Cache for authority status to avoid repeated calls
let authorityStatusCache = null;
let authorityStatusCacheTime = 0;
const AUTHORITY_CACHE_TTL = 30000; // 30 seconds

// Get or create a persistent identity for this user
function getOrCreateIdentity() {
  if (userIdentity) return userIdentity;
  
  // Check if we have a stored identity
  const storedKey = localStorage.getItem('whispr_identity_key');
  
  if (storedKey) {
    try {
      const keyData = JSON.parse(storedKey);
      userIdentity = Ed25519KeyIdentity.fromJSON(JSON.stringify(keyData));
      console.log("Restored identity from localStorage");
      return userIdentity;
    } catch (e) {
      console.warn("Could not restore identity, creating new one:", e);
    }
  }
  
  // Create a new random identity
  userIdentity = Ed25519KeyIdentity.generate();
  
  // Store it for persistence
  try {
    localStorage.setItem('whispr_identity_key', JSON.stringify(userIdentity.toJSON()));
    console.log("Created and stored new identity");
  } catch (e) {
    console.warn("Could not store identity:", e);
  }
  
  return userIdentity;
}

// Get current principal string
export async function getCurrentPrincipal() {
  if (usingPlugWallet && window.ic?.plug) {
    try {
      const principal = await window.ic.plug.getPrincipal();
      return principal.toString();
    } catch (e) {
      console.error("Error getting Plug principal:", e);
    }
  }
  const identity = getOrCreateIdentity();
  return identity.getPrincipal().toString();
}

// Reinitialize backend with Plug wallet or custom identity
export async function reinitializeWithIdentity(identity) {
  whisprBackend = null;
  initializationPromise = null;
  
  // Check if Plug wallet is available and connected
  if (window.ic?.plug) {
    try {
      const connected = await window.ic.plug.isConnected();
      if (connected) {
        usingPlugWallet = true;
        return initializeBackend();
      }
    } catch (e) {
      console.log("Plug not connected, using default identity");
    }
  }
  
  usingPlugWallet = false;
  if (identity) {
    userIdentity = identity;
  }
  return initializeBackend();
}

async function loadIdlFactory() {
  try {
    const module = await import('../../../../.dfx/local/canisters/Whispr_backend/service.did.js');
    return module.idlFactory;
  } catch (e) {
    console.warn("Could not load IDL factory from .dfx declarations:", e.message);
    try {
      const manualModule = await import('./Whispr_backend.did.js');
      return manualModule.idlFactory;
    } catch (e2) {
      console.error("Could not find any Whispr_backend declarations:", e2.message);
      return null;
    }
  }
}

async function initializeBackend() {
  // If already initialized, return immediately
  if (whisprBackend) {
    return whisprBackend;
  }
  
  // If initialization is in progress, wait for it
  if (initializationPromise) {
    return initializationPromise;
  }
  
  // Start initialization
  initializationPromise = (async () => {
    try {
      idlFactory = await loadIdlFactory();
      
      if (!idlFactory) {
        console.error("No IDL factory available - backend connection disabled");
        return null;
      }

      // Detect environment and set appropriate canister ID and host
      const isLocal = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname.includes('.localhost');
      
      const CANISTER_ID = isLocal 
        ? "uxrrr-q7777-77774-qaaaq-cai"  // Local development
        : "bdggw-2qaaa-aaaag-aua3q-cai"; // IC Mainnet production
      
      const HOST = isLocal 
        ? "http://localhost:4943"  // Local development
        : "https://icp-api.io";    // IC Mainnet (use icp-api.io for API calls)
      
      console.log(`Environment: ${isLocal ? 'LOCAL' : 'PRODUCTION'}, Canister: ${CANISTER_ID}, Host: ${HOST}`);

      let agent;

      // Check if Plug wallet is available and connected
      if (usingPlugWallet && window.ic?.plug) {
        try {
          const connected = await window.ic.plug.isConnected();
          if (connected) {
            // Create actor using Plug's createActor
            await window.ic.plug.createAgent({ whitelist: [CANISTER_ID], host: HOST });
            agent = window.ic.plug.agent;
            
            // Only fetch root key for local development
            if (isLocal) {
              await agent.fetchRootKey();
            }
            
            const principal = await window.ic.plug.getPrincipal();
            console.log("Using Plug wallet with principal:", principal.toString());
            
            whisprBackend = Actor.createActor(idlFactory, {
              agent,
              canisterId: CANISTER_ID,
            });
            
            console.log("Connected to Whispr backend via Plug wallet");
            return whisprBackend;
          }
        } catch (e) {
          console.warn("Plug wallet error, falling back to generated identity:", e);
        }
      }

      // Fallback: use generated identity
      const identity = getOrCreateIdentity();
      console.log("Using generated identity with principal:", identity.getPrincipal().toString());

      agent = new HttpAgent({ host: HOST, identity });

      // Fetch root key for local development
      try {
        await agent.fetchRootKey();
      } catch (err) {
        console.warn('Unable to fetch root key (this is normal if not running locally):', err);
      }

      whisprBackend = Actor.createActor(idlFactory, {
        agent,
        canisterId: CANISTER_ID,
      });

      console.log("Connected to Whispr Rust backend on Internet Computer:", CANISTER_ID);
      return whisprBackend;
    } catch (error) {
      console.error("Error setting up backend connection:", error);
      whisprBackend = null;
      initializationPromise = null;
      return null;
    }
  })();
  
  return initializationPromise;
}

// Initialize on module load
initializeBackend();

async function ensureBackend() {
  const backend = await initializeBackend();
  if (!backend) {
    throw new Error("Backend connection not available. Please check if the canister is running on http://localhost:4943");
  }
  return backend;
}

export async function submitReport(reportData) {
  const backend = await ensureBackend();

  try {
    // Backend will create user with 100 tokens if they don't exist
    // and handle the balance check there
    const evidenceFiles = await Promise.all(
      (reportData.evidenceFiles || []).map(async (file) => {
        const base64Data = await convertFileToBase64(file);
        return {
          name: file.name,
          type: file.type,
          size: file.size,
          base64Data: base64Data,
          lastModified: file.lastModified
        };
      })
    );
    
    const location = reportData.location && reportData.location.coordinates ? [{
      latitude: reportData.location.coordinates.lat,
      longitude: reportData.location.coordinates.lng,
      address: reportData.location.address ? [reportData.location.address] : []
    }] : [];
    
    const result = await backend.submit_report(
      reportData.title,
      reportData.description, 
      reportData.category,
      location.length > 0 ? [location[0]] : [],
      reportData.date ? [reportData.date] : [],
      BigInt(reportData.stakeAmount),
      evidenceFiles.length
    );
    
    if (result && 'Ok' in result) {
      const reportId = result.Ok;
      console.log("Report submitted to Rust backend on-chain, ID:", reportId);
      
      // Upload evidence files to backend canister
      if (evidenceFiles.length > 0) {
        console.log(`Uploading ${evidenceFiles.length} evidence files to backend...`);
        
        for (const file of evidenceFiles) {
          try {
            // Convert base64 to Uint8Array for backend
            const base64Content = file.base64Data.split(',')[1] || file.base64Data;
            const binaryString = atob(base64Content);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            
            const uploadResult = await backend.upload_evidence(
              reportId,  // Keep as BigInt
              file.name,
              file.type,
              Array.from(bytes)  // Convert Uint8Array to regular array
            );
            
            if (uploadResult && 'Ok' in uploadResult) {
              console.log(`Evidence file "${file.name}" uploaded successfully`);
            } else {
              console.warn(`Failed to upload evidence file "${file.name}":`, uploadResult);
            }
          } catch (uploadError) {
            console.error(`Error uploading evidence file "${file.name}":`, uploadError);
          }
        }
        
        // Also save locally as backup
        const detailedReport = {
          id: String(reportId),
          title: reportData.title,
          description: reportData.description,
          evidenceFiles: evidenceFiles,
          evidenceCount: evidenceFiles.length
        };
        saveDetailedReportToLocalStorage(detailedReport);
      }
      
      return { success: true, reportId: String(reportId) };
    } else if (result && 'Err' in result) {
      throw new Error(result.Err);
    } else {
      throw new Error("Invalid response from Rust backend");
    }
  } catch (error) {
    console.error('Error submitting to Rust backend:', error);
    throw error;
  }
}

function convertFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

export async function getUserReports() {
  try {
    const backend = await ensureBackend();
    const reports = await backend.get_user_reports();
    console.log("Retrieved user reports from Rust backend:", reports);
    
    if (Array.isArray(reports)) {
      return reports.map(formatReport);
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching reports from Rust backend:', error);
    return [];
  }
}

// Register current user as an authority (development helper)
export async function registerAsAuthority() {
  const backend = await ensureBackend();

  try {
    const result = await backend.register_as_authority();
    if (result && 'Ok' in result) {
      console.log("Registered as authority:", result.Ok);
      // Invalidate cache since authority status changed
      authorityStatusCache = true;
      authorityStatusCacheTime = Date.now();
      return { success: true, message: result.Ok };
    } else if (result && 'Err' in result) {
      throw new Error(result.Err);
    }
    return { success: false };
  } catch (error) {
    console.error('Error registering as authority:', error);
    throw error;
  }
}

// Check if current user is an authority
export async function checkIsAuthority() {
  const backend = await ensureBackend();

  try {
    const isAuth = await backend.is_authority();
    console.log("Is authority check:", isAuth);
    return isAuth;
  } catch (error) {
    console.error('Error checking authority status:', error);
    return false;
  }
}

export async function getTokenBalance() {
  try {
    const backend = await ensureBackend();
    const balance = await backend.get_user_balance();
    const numericBalance = Number(balance);
    console.log("Retrieved token balance from Rust backend:", numericBalance);
    
    localStorage.setItem('user_token_balance', numericBalance.toString());
    
    return numericBalance;
  } catch (error) {
    console.error('Error fetching token balance from Rust backend:', error);
    
    const cachedBalance = localStorage.getItem('user_token_balance');
    if (cachedBalance !== null) {
      return parseInt(cachedBalance, 10);
    }
    
    return 250; // Default for new users
  }
}

export async function getAuthorityStatistics() {
  const backend = await ensureBackend();

  try {
    // NOTE: Do NOT auto-register here - only authorities should call this
    const result = await backend.get_authority_statistics();
    if (result && 'Ok' in result) {
      console.log("Retrieved authority statistics from Rust backend:", result.Ok);
      // Convert BigInt values to regular numbers
      return {
        reports_pending: Number(result.Ok.reports_pending || 0),
        reports_verified: Number(result.Ok.reports_verified || 0),
        reports_rejected: Number(result.Ok.reports_rejected || 0),
        total_rewards_distributed: Number(result.Ok.total_rewards_distributed || 0)
      };
    } else if (result && 'Err' in result) {
      throw new Error(result.Err);
    } else {
      throw new Error("Invalid response format from get_authority_statistics");
    }
  } catch (error) {
    console.error('Error fetching authority statistics from Rust backend:', error);
    throw error;
  }
}

export async function getReportsByStatus(status) {
  const backend = await ensureBackend();

  try {
    const statusVariant = status === 'pending' ? { Pending: null } :
                         status === 'verified' ? { Approved: null } :
                         status === 'rejected' ? { Rejected: null } :
                         status === 'under_review' ? { UnderReview: null } : 
                         { Pending: null };
    
    const result = await backend.get_reports_by_status(statusVariant);
    if (result && 'Ok' in result) {
      console.log(`Retrieved ${status} reports from Rust backend:`, result.Ok);
      return result.Ok.map(formatReport);
    } else if (result && 'Err' in result) {
      throw new Error(result.Err);
    } else {
      throw new Error("Invalid response format from get_reports_by_status");
    }
  } catch (error) {
    console.error(`Error fetching ${status} reports from Rust backend:`, error);
    throw error;
  }
}

export async function verifyReport(reportId, notes) {
  const backend = await ensureBackend();

  try {
    // NOTE: Caller must already be an authority - do not auto-register
    console.log(`Verifying report ${reportId} on Rust backend with notes:`, notes);
    
    const formattedId = BigInt(reportId);
    const result = await backend.verify_report(formattedId, notes ? [notes] : []);
    
    if (result && 'Ok' in result) {
      console.log(`Successfully verified report ${reportId} on Rust backend`);
      return { success: true };
    } else if (result && 'Err' in result) {
      throw new Error(result.Err);
    } else {
      throw new Error("Invalid response format from verify_report");
    }
  } catch (error) {
    console.error('Error verifying report on Rust backend:', error);
    throw error;
  }
}

export async function rejectReport(reportId, notes) {
  const backend = await ensureBackend();

  try {
    // NOTE: Caller must already be an authority - do not auto-register
    console.log(`Rejecting report ${reportId} on Rust backend with notes:`, notes);
    
    const formattedId = BigInt(reportId);
    const result = await backend.reject_report(formattedId, notes ? [notes] : []);
    
    if (result && 'Ok' in result) {
      console.log(`Successfully rejected report ${reportId} on Rust backend`);
      return { success: true };
    } else if (result && 'Err' in result) {
      throw new Error(result.Err);
    } else {
      throw new Error("Invalid response format from reject_report");
    }
  } catch (error) {
    console.error('Error rejecting report on Rust backend:', error);
    throw error;
  }
}

export async function getAllReports() {
  const backend = await ensureBackend();

  try {
    const result = await backend.get_all_reports();
    if (result && 'Ok' in result) {
      console.log("Retrieved all reports from Rust backend:", result.Ok);
      return result.Ok.map(formatReport);
    } else if (result && 'Err' in result) {
      throw new Error(result.Err);
    } else {
      throw new Error("Invalid response format from get_all_reports");
    }
  } catch (error) {
    console.error('Error fetching all reports from Rust backend:', error);
    throw error;
  }
}

// Optimized: Fetch all authority data in parallel
// NOTE: This function is ONLY for the Authority Dashboard page
// The caller must already be registered as an authority via AuthorityPage registration
export async function getAuthorityDashboardData() {
  const backend = await ensureBackend();
  
  try {
    // NOTE: Do NOT auto-register here - only existing authorities should call this
    // Authority registration happens ONLY through the AuthorityPage form
    
    // Log the current principal for debugging
    const currentPrincipal = await getCurrentPrincipal();
    console.log('Authority Dashboard - Current principal:', currentPrincipal);
    
    // First check if user is authority
    const isAuth = await backend.is_authority();
    console.log('Authority Dashboard - is_authority result:', isAuth);
    
    // Cache authority status
    authorityStatusCache = isAuth;
    authorityStatusCacheTime = Date.now();
    
    if (!isAuth) {
      console.log('User is not an authority, returning empty data');
      return { 
        reports: [], 
        stats: {
          reports_pending: 0,
          reports_verified: 0,
          reports_rejected: 0,
          total_rewards_distributed: 0
        }, 
        isAuthority: false 
      };
    }
    
    // User is authority, fetch reports and stats in parallel
    const [reportsResult, statsResult] = await Promise.all([
      backend.get_all_reports(),
      backend.get_authority_statistics()
    ]);
    
    let reports = [];
    if (reportsResult && 'Ok' in reportsResult) {
      reports = reportsResult.Ok.map(formatReport);
    } else if (reportsResult && 'Err' in reportsResult) {
      console.error('Error fetching reports:', reportsResult.Err);
    }
    
    let stats = {
      reports_pending: 0,
      reports_verified: 0,
      reports_rejected: 0,
      total_rewards_distributed: 0
    };
    
    if (statsResult && 'Ok' in statsResult) {
      stats = {
        reports_pending: Number(statsResult.Ok.reports_pending || 0),
        reports_verified: Number(statsResult.Ok.reports_verified || 0),
        reports_rejected: Number(statsResult.Ok.reports_rejected || 0),
        total_rewards_distributed: Number(statsResult.Ok.total_rewards_distributed || 0)
      };
    } else if (statsResult && 'Err' in statsResult) {
      console.error('Error fetching stats:', statsResult.Err);
    }
    
    return { reports, stats, isAuthority: isAuth };
  } catch (error) {
    console.error('Error fetching authority dashboard data:', error);
    throw error;
  }
}

function saveDetailedReportToLocalStorage(report) {
  try {
    const reportId = String(report.id);
    const existingReports = JSON.parse(localStorage.getItem('whispr_reports_details') || '[]');
    const existingIndex = existingReports.findIndex(r => r.id && String(r.id) === reportId);
    
    if (existingIndex >= 0) {
      existingReports[existingIndex] = { ...existingReports[existingIndex], ...report };
    } else {
      existingReports.unshift(report);
    }
    
    localStorage.setItem('whispr_reports_details', JSON.stringify(existingReports));
    // Invalidate evidence cache
    evidenceStorageCache = null;
    evidenceStorageCacheTime = 0;
    console.log("Evidence files cached locally for report:", reportId);
  } catch (error) {
    console.error('Error caching evidence files:', error);
  }
}

export async function getReportById(reportId) {
  const backend = await ensureBackend();

  try {
    const result = await backend.get_report(BigInt(reportId));
    if (result && result.length > 0) {
      const report = formatReport(result[0]);
      console.log("Retrieved report from Rust backend:", report);
      
      const localReports = JSON.parse(localStorage.getItem('whispr_reports_details') || '[]');
      const detailedReport = localReports.find(r => String(r.id) === String(reportId));
      
      return {
        ...report,
        evidenceFiles: detailedReport?.evidenceFiles || [],
        description: report.description || detailedReport?.description || ""
      };
    } else {
      throw new Error("Report not found");
    }
  } catch (error) {
    console.error('Error fetching report from Rust backend:', error);
    throw error;
  }
}
function formatReport(report) {
  try {
    let formattedDate, incidentDate, reviewDate;
    
    try {
      if (report.date_submitted) {
        formattedDate = new Date(Number(report.date_submitted) / 1000000).toISOString().split('T')[0];
      } else {
        formattedDate = new Date().toISOString().split('T')[0];
      }
    } catch (e) {
      formattedDate = new Date().toISOString().split('T')[0];
    }
    
    try {
      incidentDate = '';
      if (report.incident_date && Array.isArray(report.incident_date) && report.incident_date.length > 0) {
        incidentDate = report.incident_date[0];
      }
    } catch (e) {
      incidentDate = '';
    }
    
    try {
      reviewDate = null;
      if (report.review_date) {
        reviewDate = new Date(Number(report.review_date) / 1000000).toISOString();
      }
    } catch (e) {
      reviewDate = null;
    }
    
    let submitterId;
    try {
      if (typeof report.submitter_id === 'object' && report.submitter_id !== null) {
        if ('toText' in report.submitter_id && typeof report.submitter_id.toText === 'function') {
          submitterId = report.submitter_id.toText();
        } else {
          submitterId = String(report.submitter_id);
        }
      } else {
        submitterId = String(report.submitter_id || "unknown");
      }
    } catch (e) {
      submitterId = "unknown";
    }

    let reviewNotes = '';
    try {
      if (Array.isArray(report.review_notes) && report.review_notes.length > 0) {
        reviewNotes = report.review_notes[0];
      } else if (report.review_notes) {
        reviewNotes = String(report.review_notes);
      }
    } catch (e) {
      reviewNotes = '';
    }
    
    const status = getStatusString(report.status);
    
    // Try to get evidence files from localStorage
    const evidenceFiles = getEvidenceFilesFromStorage(String(report.id));
    
    return {
      id: String(report.id),
      title: report.title || "",
      description: report.description || "",
      category: report.category || "",
      date: incidentDate || formattedDate,
      dateSubmitted: formattedDate,
      submitterId: submitterId,
      status: status,
      evidenceCount: Number(report.evidence_count || 0),
      stakeAmount: Number(report.stake_amount || 0),
      rewardAmount: Number(report.reward_amount || 0),
      reviewNotes: reviewNotes,
      reviewDate: reviewDate,
      reviewer: report.reviewer,
      location: formatLocation(report.location),
      evidenceFiles: evidenceFiles,
      hasMessages: false
    };
  } catch (error) {
    console.error("Error formatting report:", error, report);
    return {
      id: String(report.id || "unknown-" + Date.now()),
      title: report.title || "Error Loading Report",
      description: "Error loading report details",
      category: "unknown",
      date: new Date().toISOString().split('T')[0],
      status: "pending",
      stakeAmount: 0,
      rewardAmount: 0,
      evidenceCount: 0,
      evidenceFiles: [],
      hasMessages: false
    };
  }
}

// Format location from backend format to frontend format
function formatLocation(location) {
  if (!location) return null;
  
  // Handle Option<Location> which comes as an array
  const loc = Array.isArray(location) ? location[0] : location;
  if (!loc) return null;
  
  return {
    address: loc.address ? (Array.isArray(loc.address) ? loc.address[0] : loc.address) : null,
    coordinates: {
      lat: loc.latitude || 0,
      lng: loc.longitude || 0
    }
  };
}

// Cache for localStorage evidence data
let evidenceStorageCache = null;
let evidenceStorageCacheTime = 0;
const EVIDENCE_CACHE_TTL = 5000; // 5 seconds

// Get evidence files from localStorage for a report (with caching)
function getEvidenceFilesFromStorage(reportId) {
  try {
    const now = Date.now();
    
    // Refresh cache if expired
    if (!evidenceStorageCache || (now - evidenceStorageCacheTime) > EVIDENCE_CACHE_TTL) {
      evidenceStorageCache = JSON.parse(localStorage.getItem('whispr_reports_details') || '[]');
      evidenceStorageCacheTime = now;
    }
    
    const detailedReport = evidenceStorageCache.find(r => String(r.id) === String(reportId));
    if (detailedReport && detailedReport.evidenceFiles && detailedReport.evidenceFiles.length > 0) {
      return detailedReport.evidenceFiles;
    }
  } catch (e) {
    console.warn("Error getting evidence from storage:", e);
  }
  return [];
}

// Invalidate evidence cache when new evidence is stored
function invalidateEvidenceCache() {
  evidenceStorageCache = null;
  evidenceStorageCacheTime = 0;
}

// Fetch evidence files from backend for a report
export async function getReportEvidence(reportId) {
  const backend = await ensureBackend();
  
  try {
    // NOTE: Do NOT auto-register as authority here
    // Evidence access is controlled by the backend based on report ownership or authority status
    
    const evidence = await backend.get_report_evidence(BigInt(reportId));
    console.log("Retrieved evidence from backend:", evidence);
    
    if (evidence && evidence.length > 0) {
      return evidence.map(e => ({
        id: Number(e.id),
        name: e.name,
        type: e.file_type,
        size: e.data?.length || 0,
        base64Data: e.data ? `data:${e.file_type};base64,${arrayBufferToBase64(e.data)}` : null,
        uploadDate: e.upload_date ? new Date(Number(e.upload_date) / 1000000).toISOString() : null,
        ipfsCid: e.ipfs_cid?.[0] || null
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching evidence from backend:', error);
    return [];
  }
}

// Helper to convert array buffer to base64
function arrayBufferToBase64(buffer) {
  if (!buffer) return '';
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function getStatusString(status) {
  if (!status) return 'pending';
  
  try {
    if (typeof status === 'string') return status.toLowerCase();
    
    if (typeof status === 'object') {
      if ('Pending' in status) return 'pending';
      if ('UnderReview' in status) return 'under_review';
      if ('Approved' in status) return 'verified';
      if ('Rejected' in status) return 'rejected';
    }
  } catch (e) {
    console.warn("Error determining status:", e);
  }
  
  return 'pending';
}

export function initializeNewUser() {
  const existingBalance = localStorage.getItem('user_token_balance');
  if (existingBalance === null) {
    localStorage.setItem('user_token_balance', '250');
    console.log('New user initialized with 250 tokens locally');
    return 250;
  }
  return parseInt(existingBalance, 10);
}

// Check if current user is an authority (with caching)
export async function isAuthority(forceRefresh = false) {
  const now = Date.now();
  
  // Return cached result if still valid
  if (!forceRefresh && authorityStatusCache !== null && (now - authorityStatusCacheTime) < AUTHORITY_CACHE_TTL) {
    return authorityStatusCache;
  }
  
  try {
    const backend = await ensureBackend();
    const result = await backend.is_authority();
    
    // Cache the result
    authorityStatusCache = result;
    authorityStatusCacheTime = now;
    
    console.log("Authority check result:", result);
    return result;
  } catch (error) {
    console.error('Error checking authority status:', error);
    return false;
  }
}

// Invalidate authority cache (call after registering as authority)
export function invalidateAuthorityCache() {
  authorityStatusCache = null;
  authorityStatusCacheTime = 0;
}

// Get messages for a specific report
export async function getMessages(reportId) {
  const backend = await ensureBackend();

  try {
    const messages = await backend.get_messages(BigInt(reportId));
    console.log("Retrieved messages from backend:", messages);
    return messages.map(msg => ({
      id: String(msg.id),
      reportId: String(msg.report_id),
      sender: formatMessageSender(msg.sender),
      content: msg.content,
      timestamp: Number(msg.timestamp),
      attachment: msg.attachment
    }));
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
}

// Send message as authority
export async function sendMessageAsAuthority(reportId, content) {
  const backend = await ensureBackend();

  try {
    const result = await backend.send_message_as_authority(BigInt(reportId), content);
    if (result && 'Ok' in result) {
      console.log("Message sent successfully as authority");
      return { success: true };
    } else if (result && 'Err' in result) {
      throw new Error(result.Err);
    }
    throw new Error("Invalid response from backend");
  } catch (error) {
    console.error('Error sending message as authority:', error);
    throw error;
  }
}

// Send message as reporter
export async function sendMessageAsReporter(reportId, content) {
  const backend = await ensureBackend();

  try {
    const result = await backend.send_message_as_reporter(BigInt(reportId), content);
    if (result && 'Ok' in result) {
      console.log("Message sent successfully as reporter");
      return { success: true };
    } else if (result && 'Err' in result) {
      throw new Error(result.Err);
    }
    throw new Error("Invalid response from backend");
  } catch (error) {
    console.error('Error sending message as reporter:', error);
    throw error;
  }
}

// Put report under review
export async function putUnderReview(reportId, notes) {
  const backend = await ensureBackend();

  try {
    const result = await backend.put_under_review(BigInt(reportId), notes ? [notes] : []);
    if (result && 'Ok' in result) {
      console.log("Report put under review successfully");
      return { success: true };
    } else if (result && 'Err' in result) {
      throw new Error(result.Err);
    }
    throw new Error("Invalid response from backend");
  } catch (error) {
    console.error('Error putting report under review:', error);
    throw error;
  }
}

// Get user info
export async function getUserInfo() {
  const backend = await ensureBackend();

  try {
    const result = await backend.get_user_info();
    if (result && result.length > 0) {
      const user = result[0];
      return {
        id: user.id,
        tokenBalance: Number(user.token_balance),
        reportsSubmitted: user.reports_submitted.map(id => String(id)),
        rewardsEarned: Number(user.rewards_earned),
        stakesActive: Number(user.stakes_active),
        stakesLost: Number(user.stakes_lost)
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw error;
  }
}

// Initialize system (for first-time setup)
export async function initializeSystem() {
  const backend = await ensureBackend();

  try {
    const result = await backend.initialize_system();
    if (result && 'Ok' in result) {
      console.log("System initialized successfully");
      return { success: true };
    } else if (result && 'Err' in result) {
      throw new Error(result.Err);
    }
    throw new Error("Invalid response from backend");
  } catch (error) {
    console.error('Error initializing system:', error);
    throw error;
  }
}

// Health check
export async function healthCheck() {
  const backend = await ensureBackend();

  try {
    const result = await backend.health_check();
    return {
      status: result.status,
      totalReports: Number(result.total_reports),
      pendingReports: Number(result.pending_reports),
      systemTime: Number(result.system_time),
      memoryUsage: Number(result.memory_usage)
    };
  } catch (error) {
    console.error('Error performing health check:', error);
    throw error;
  }
}

// Helper function to format message sender
function formatMessageSender(sender) {
  if ('Authority' in sender) {
    return { type: 'authority', principal: sender.Authority };
  } else if ('Reporter' in sender) {
    return { type: 'reporter', principal: sender.Reporter };
  } else if ('System' in sender) {
    return { type: 'system', principal: null };
  }
  return { type: 'unknown', principal: null };
}

// Export the backend getter for advanced use cases
export async function getBackend() {
  return ensureBackend();
}

export default whisprBackend;