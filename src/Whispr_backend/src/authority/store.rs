use crate::authority::types::*;
use candid::Principal;
use ic_stable_structures::{memory_manager::{MemoryId, MemoryManager, VirtualMemory}, 
                          DefaultMemoryImpl, StableBTreeMap};
use std::cell::RefCell;
use std::collections::{BTreeSet, HashMap};

// IPFS/Pinata credentials - These should be configured via the configure_ipfs_credentials function
// The defaults are placeholders that will not work - you must configure real credentials
const DEFAULT_PINATA_API_KEY: &str = "CONFIGURE_VIA_API";
const DEFAULT_PINATA_SECRET: &str = "CONFIGURE_VIA_API";
const DEFAULT_PINATA_JWT: &str = "CONFIGURE_VIA_API";

type Memory = VirtualMemory<DefaultMemoryImpl>;

thread_local! {
    // Memory manager for stable storage
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = 
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    // Reports storage
    static REPORTS: RefCell<StableBTreeMap<u64, Report, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|mm| mm.borrow().get(MemoryId::new(0))),
        )
    );
    
    // Users storage
    static USERS: RefCell<StableBTreeMap<Principal, User, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|mm| mm.borrow().get(MemoryId::new(1))),
        )
    );
    
    // Authorities storage
    static AUTHORITIES: RefCell<StableBTreeMap<Principal, Authority, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|mm| mm.borrow().get(MemoryId::new(2))),
        )
    );
    
    // Messages storage
    static MESSAGES: RefCell<StableBTreeMap<u64, Message, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|mm| mm.borrow().get(MemoryId::new(3))),
        )
    );
    
    // Evidence files storage
    static EVIDENCE_FILES: RefCell<StableBTreeMap<u64, EvidenceFile, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|mm| mm.borrow().get(MemoryId::new(4))),
        )
    );

    // IPFS configuration storage (single entry)
    static IPFS_CONFIG: RefCell<StableBTreeMap<u8, IpfsConfig, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|mm| mm.borrow().get(MemoryId::new(5))),
        )
    );
    
    // Counters for IDs
    static NEXT_REPORT_ID: RefCell<u64> = RefCell::new(1);
    static NEXT_MESSAGE_ID: RefCell<u64> = RefCell::new(1);
    static NEXT_EVIDENCE_ID: RefCell<u64> = RefCell::new(1);
    
    // Global configuration
    static REWARD_CONFIG: RefCell<RewardConfig> = RefCell::new(RewardConfig {
        reward_multiplier: 10,
        min_stake_amount: 5,
        max_stake_amount: 100,
    });
    
    // Authority stats
    static AUTHORITY_STATS: RefCell<AuthorityStats> = RefCell::new(AuthorityStats {
        reports_pending: 0,
        reports_verified: 0,
        reports_rejected: 0,
        total_rewards_distributed: 0,
    });
    
    // Report messages mapping (report_id -> message_ids)
    static REPORT_MESSAGES: RefCell<HashMap<u64, Vec<u64>>> = RefCell::new(HashMap::new());
    
    // In-memory indexes for faster queries - O(1) lookups
    static STATUS_INDEX: RefCell<HashMap<ReportStatus, BTreeSet<u64>>> = RefCell::new(HashMap::new());
    static CATEGORY_INDEX: RefCell<HashMap<String, BTreeSet<u64>>> = RefCell::new(HashMap::new());
    static USER_REPORTS_INDEX: RefCell<HashMap<Principal, BTreeSet<u64>>> = RefCell::new(HashMap::new());
}

// Reports operations - Index management for O(1) lookups
fn add_status_index_entry(status: &ReportStatus, report_id: u64) {
    STATUS_INDEX.with(|idx| {
        let mut map = idx.borrow_mut();
        map.entry(status.clone()).or_insert_with(BTreeSet::new).insert(report_id);
    });
}

fn remove_status_index_entry(status: &ReportStatus, report_id: u64) {
    STATUS_INDEX.with(|idx| {
        let mut map = idx.borrow_mut();
        if let Some(entry) = map.get_mut(status) {
            entry.remove(&report_id);
            if entry.is_empty() {
                map.remove(status);
            }
        }
    });
}

fn add_category_index_entry(category: &str, report_id: u64) {
    CATEGORY_INDEX.with(|idx| {
        let mut map = idx.borrow_mut();
        map.entry(category.to_lowercase()).or_insert_with(BTreeSet::new).insert(report_id);
    });
}

fn remove_category_index_entry(category: &str, report_id: u64) {
    CATEGORY_INDEX.with(|idx| {
        let mut map = idx.borrow_mut();
        if let Some(entry) = map.get_mut(&category.to_lowercase()) {
            entry.remove(&report_id);
            if entry.is_empty() {
                map.remove(&category.to_lowercase());
            }
        }
    });
}

fn add_user_report_index_entry(user_id: Principal, report_id: u64) {
    USER_REPORTS_INDEX.with(|idx| {
        let mut map = idx.borrow_mut();
        map.entry(user_id).or_insert_with(BTreeSet::new).insert(report_id);
    });
}

fn remove_user_report_index_entry(user_id: Principal, report_id: u64) {
    USER_REPORTS_INDEX.with(|idx| {
        let mut map = idx.borrow_mut();
        if let Some(entry) = map.get_mut(&user_id) {
            entry.remove(&report_id);
            if entry.is_empty() {
                map.remove(&user_id);
            }
        }
    });
}

pub fn create_report(report: &Report) -> u64 {
    let id = NEXT_REPORT_ID.with(|counter| {
        let id = *counter.borrow();
        *counter.borrow_mut() = id + 1;
        id
    });
    
    let mut new_report = report.clone();
    new_report.id = id;
    
    REPORTS.with(|reports| {
        reports.borrow_mut().insert(id, new_report.clone());
    });
    
    // Add to all indexes for O(1) lookups
    add_status_index_entry(&report.status, id);
    add_category_index_entry(&report.category, id);
    add_user_report_index_entry(report.submitter_id, id);
    
    // Update stats
    AUTHORITY_STATS.with(|stats| {
        stats.borrow_mut().reports_pending += 1;
    });
    
    id
}

pub fn get_report(id: u64) -> Option<Report> {
    REPORTS.with(|reports| {
        reports.borrow().get(&id)
    })
}

pub fn get_all_reports() -> Vec<Report> {
    REPORTS.with(|reports| {
        let reports_map = reports.borrow();
        reports_map.iter().map(|(_, report)| report).collect()
    })
}

pub fn get_all_reports_for_debug() -> usize {
    REPORTS.with(|reports| {
        reports.borrow().len() as usize
    })
}

pub fn rebuild_indexes() {
    let reports = get_all_reports();
    
    // Rebuild status index
    STATUS_INDEX.with(|idx| {
        let mut map = idx.borrow_mut();
        map.clear();
        for report in &reports {
            map.entry(report.status.clone()).or_insert_with(BTreeSet::new).insert(report.id);
        }
    });
    
    // Rebuild category index
    CATEGORY_INDEX.with(|idx| {
        let mut map = idx.borrow_mut();
        map.clear();
        for report in &reports {
            map.entry(report.category.to_lowercase()).or_insert_with(BTreeSet::new).insert(report.id);
        }
    });
    
    // Rebuild user reports index
    USER_REPORTS_INDEX.with(|idx| {
        let mut map = idx.borrow_mut();
        map.clear();
        for report in &reports {
            map.entry(report.submitter_id).or_insert_with(BTreeSet::new).insert(report.id);
        }
    });
}

// O(1) lookup by status using index
pub fn get_reports_by_status(status: ReportStatus) -> Vec<Report> {
    let report_ids: Vec<u64> = STATUS_INDEX.with(|idx| {
        idx.borrow()
            .get(&status)
            .cloned()
            .map(|set| set.into_iter().collect())
            .unwrap_or_default()
    });
    report_ids.into_iter().filter_map(get_report).collect()
}

// O(1) lookup by category using index
pub fn get_reports_by_category(category: &str) -> Vec<Report> {
    let report_ids: Vec<u64> = CATEGORY_INDEX.with(|idx| {
        idx.borrow()
            .get(&category.to_lowercase())
            .cloned()
            .map(|set| set.into_iter().collect())
            .unwrap_or_default()
    });
    report_ids.into_iter().filter_map(get_report).collect()
}

pub fn update_report(report: Report) -> Result<(), String> {
    let report_id = report.id;
    
    let old_report = REPORTS.with(|reports| reports.borrow().get(&report_id));
    
    if old_report.is_none() {
        return Err("Report not found".to_string());
    }
    
    let old_report = old_report.unwrap();
    
    // Update indexes if status or category changed
    if old_report.status != report.status {
        AUTHORITY_STATS.with(|stats| {
            let mut stats = stats.borrow_mut();
            match old_report.status {
                ReportStatus::Pending => stats.reports_pending -= 1,
                ReportStatus::Approved => stats.reports_verified -= 1,
                ReportStatus::Rejected => stats.reports_rejected -= 1,
                _ => {}
            }
            
            match report.status {
                ReportStatus::Pending => stats.reports_pending += 1,
                ReportStatus::Approved => stats.reports_verified += 1,
                ReportStatus::Rejected => stats.reports_rejected += 1,
                _ => {}
            }
        });
        remove_status_index_entry(&old_report.status, report_id);
        add_status_index_entry(&report.status, report_id);
    }
    
    if old_report.category != report.category {
        remove_category_index_entry(&old_report.category, report_id);
        add_category_index_entry(&report.category, report_id);
    }
    
    REPORTS.with(|reports| {
        reports.borrow_mut().insert(report_id, report);
    });
    
    Ok(())
}

// Users operations
pub fn get_user(id: Principal) -> Option<User> {
    USERS.with(|users| {
        users.borrow().get(&id)
    })
}

pub fn create_or_update_user(user: User) {
    USERS.with(|users| {
        users.borrow_mut().insert(user.id, user);
    });
}

// Get user's reports - directly filter from stable storage for reliability
// This ensures correct filtering even if in-memory index is out of sync
pub fn get_user_reports(user_id: Principal) -> Vec<Report> {
    // Direct filter from stable storage - most reliable
    REPORTS.with(|reports| {
        let reports_map = reports.borrow();
        reports_map
            .iter()
            .filter(|(_, report)| report.submitter_id == user_id)
            .map(|(_, report)| report)
            .collect()
    })
}

// Token operations
pub fn transfer_tokens(from: Principal, to: Principal, amount: u64) -> Result<(), String> {
    USERS.with(|users| {
        let mut users = users.borrow_mut();
        
        // Get source account
        let source = match users.get(&from) {
            Some(user) => user,
            None => return Err("Source user not found".to_string()),
        };
        
        // Check balance
        if source.token_balance < amount {
            return Err("Insufficient token balance".to_string());
        }
        
        // Get or create destination account
        let destination = match users.get(&to) {
            Some(user) => user,
            None => User {
                id: to,
                token_balance: 0,
                reports_submitted: Vec::new(),
                rewards_earned: 0,
                stakes_active: 0,
                stakes_lost: 0,
            },
        };
        
        // Update balances
        let mut source_updated = source.clone();
        source_updated.token_balance -= amount;
        
        let mut dest_updated = destination.clone();
        dest_updated.token_balance += amount;
        
        // Save updated accounts
        users.insert(from, source_updated);
        users.insert(to, dest_updated);
        
        Ok(())
    })
}

// Authority operations
pub fn is_authority(id: Principal) -> bool {
    AUTHORITIES.with(|authorities| {
        let auth_map = authorities.borrow();
        let result = auth_map.contains_key(&id);
        ic_cdk::api::print(format!("is_authority check for {}: {}, map size: {}", id.to_text(), result, auth_map.len()));
        result
    })
}

pub fn is_authority_debug(id: Principal) -> (bool, usize, Vec<String>) {
    AUTHORITIES.with(|authorities| {
        let auth_map = authorities.borrow();
        let result = auth_map.contains_key(&id);
        let size = auth_map.len() as usize;
        let keys: Vec<String> = auth_map.iter().map(|(k, _)| k.to_text()).collect();
        (result, size, keys)
    })
}

pub fn add_authority(authority: Authority) {
    AUTHORITIES.with(|authorities| {
        authorities.borrow_mut().insert(authority.id, authority);
    });
}

pub fn get_authority(id: Principal) -> Option<Authority> {
    AUTHORITIES.with(|authorities| {
        authorities.borrow().get(&id)
    })
}

pub fn update_authority(authority: Authority) {
    AUTHORITIES.with(|authorities| {
        authorities.borrow_mut().insert(authority.id, authority);
    });
}

pub fn remove_authority(id: Principal) {
    AUTHORITIES.with(|authorities| {
        authorities.borrow_mut().remove(&id);
    });
}

pub fn get_all_authorities() -> Vec<Authority> {
    AUTHORITIES.with(|authorities| {
        let authorities_map = authorities.borrow();
        authorities_map.iter().map(|(_, authority)| authority).collect()
    })
}

// Message operations
pub fn create_message(message: &Message) -> u64 {
    let id = NEXT_MESSAGE_ID.with(|counter| {
        let id = *counter.borrow();
        *counter.borrow_mut() = id + 1;
        id
    });
    
    let mut new_message = message.clone();
    new_message.id = id;
    
    MESSAGES.with(|messages| {
        messages.borrow_mut().insert(id, new_message.clone());
    });
    
    // Add to report messages mapping
    REPORT_MESSAGES.with(|report_messages| {
        let mut map = report_messages.borrow_mut();
        map.entry(new_message.report_id)
           .or_insert_with(Vec::new)
           .push(id);
    });
    
    id
}

pub fn get_report_messages(report_id: u64) -> Vec<Message> {
    let message_ids = REPORT_MESSAGES.with(|report_messages| {
        report_messages.borrow().get(&report_id).cloned().unwrap_or_default()
    });
    
    MESSAGES.with(|messages| {
        let messages_map = messages.borrow();
        message_ids.iter()
            .filter_map(|id| messages_map.get(id))
            .collect()
    })
}

// Evidence operations
pub fn add_evidence_file(file: &EvidenceFile) -> u64 {
    let id = NEXT_EVIDENCE_ID.with(|counter| {
        let id = *counter.borrow();
        *counter.borrow_mut() = id + 1;
        id
    });
    
    let mut new_file = file.clone();
    new_file.id = id;
    
    EVIDENCE_FILES.with(|files| {
        files.borrow_mut().insert(id, new_file);
    });
    
    id
}

pub fn get_evidence_file(id: u64) -> Option<EvidenceFile> {
    EVIDENCE_FILES.with(|files| {
        files.borrow().get(&id)
    })
}

pub fn update_evidence_file(file: EvidenceFile) -> Result<(), String> {
    let id = file.id;
    let exists = EVIDENCE_FILES.with(|files| files.borrow().contains_key(&id));
    if !exists {
        return Err("Evidence file not found".to_string());
    }
    EVIDENCE_FILES.with(|files| {
        files.borrow_mut().insert(id, file);
    });
    Ok(())
}

pub fn set_report_ipfs_metadata(report_id: u64, cid: String, pinned_at: u64) -> Result<(), String> {
    let mut report = get_report(report_id).ok_or_else(|| "Report not found".to_string())?;
    report.ipfs_cid = Some(cid);
    report.ipfs_pinned_at = Some(pinned_at);
    update_report(report)
}

pub fn set_evidence_ipfs_cid(evidence_id: u64, cid: String) -> Result<(), String> {
    let mut evidence = get_evidence_file(evidence_id).ok_or_else(|| "Evidence file not found".to_string())?;
    evidence.ipfs_cid = Some(cid);
    update_evidence_file(evidence)
}

pub fn ensure_default_ipfs_config() {
    IPFS_CONFIG.with(|cfg| {
        let mut store = cfg.borrow_mut();
        if store.get(&0).is_none() {
            let config = IpfsConfig {
                api_key: option_env!("WHISPR_PINATA_KEY").unwrap_or(DEFAULT_PINATA_API_KEY).to_string(),
                api_secret: option_env!("WHISPR_PINATA_SECRET").unwrap_or(DEFAULT_PINATA_SECRET).to_string(),
                jwt: option_env!("WHISPR_PINATA_JWT").unwrap_or(DEFAULT_PINATA_JWT).to_string(),
            };
            store.insert(0, config);
        }
    });
}

pub fn get_ipfs_config() -> Option<IpfsConfig> {
    IPFS_CONFIG.with(|cfg| cfg.borrow().get(&0))
}

pub fn set_ipfs_config(config: IpfsConfig) {
    IPFS_CONFIG.with(|cfg| {
        cfg.borrow_mut().insert(0, config);
    });
}

// Statistics
pub fn get_authority_stats() -> AuthorityStats {
    // Dynamically calculate stats from actual reports
    let all_reports = get_all_reports();
    
    let reports_pending = all_reports.iter()
        .filter(|r| matches!(r.status, ReportStatus::Pending))
        .count() as u64;
    
    let reports_verified = all_reports.iter()
        .filter(|r| matches!(r.status, ReportStatus::Approved))
        .count() as u64;
    
    let reports_rejected = all_reports.iter()
        .filter(|r| matches!(r.status, ReportStatus::Rejected))
        .count() as u64;
    
    // Get the stored total_rewards_distributed
    let stored_stats = AUTHORITY_STATS.with(|stats| stats.borrow().clone());
    
    AuthorityStats {
        reports_pending,
        reports_verified,
        reports_rejected,
        total_rewards_distributed: stored_stats.total_rewards_distributed,
    }
}

pub fn update_authority_stats(stats: AuthorityStats) {
    AUTHORITY_STATS.with(|s| {
        *s.borrow_mut() = stats;
    });
}

// Initialize mock data for testing (disabled - only real submissions now)
pub fn initialize_mock_data() {
    // Mock data has been removed
    // Only real user-submitted reports will appear in the system
    // This function is kept as a stub for potential future use
}