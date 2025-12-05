use crate::authority::{ipfs, store};
use crate::authority::types::*;
use candid::Principal;
use ic_cdk::{api, caller};

const MAX_EVIDENCE_BYTES: usize = 2 * 1024 * 1024; // 2MB safety cap

fn ensure_authority() -> Result<Principal, String> {
    let caller = caller();

    if caller == Principal::anonymous() {
        return Err("Anonymous callers are not allowed".to_string());
    }

    if !store::is_authority(caller) {
        return Err("Caller is not an authorized authority".to_string());
    }

    Ok(caller)
}

fn ensure_authenticated() -> Result<Principal, String> {
    let caller = caller();
    
    if caller == Principal::anonymous() {
        return Err("Anonymous callers are not allowed".to_string());
    }
    
    Ok(caller)
}

fn validate_report_input(
    title: &str,
    description: &str,
    category: &str,
    stake_amount: u64,
) -> Result<(), String> {
    if title.trim().is_empty() {
        return Err("Title cannot be empty".to_string());
    }
    
    if title.len() > 200 {
        return Err("Title too long (max 200 characters)".to_string());
    }
    
    if description.trim().is_empty() {
        return Err("Description cannot be empty".to_string());
    }
    
    if description.len() > 5000 {
        return Err("Description too long (max 5000 characters)".to_string());
    }
    
    let valid_categories = [
        "environmental", "environment", "fraud", "cybercrime", "corruption", "safety", "other",
        "acid attacks", "bribery", "domestic_violence", "drug_crimes", "human_trafficking",
        "kidnapping", "money_laundering", "murder", "sexual_assault", "theft",
        "violence", "harassment"  // Added missing categories from frontend
    ];
    if !valid_categories.contains(&category.to_lowercase().as_str()) {
        return Err("Invalid category".to_string());
    }
    
    if stake_amount < 5 {
        return Err("Minimum stake amount is 5 tokens".to_string());
    }
    
    if stake_amount > 1000 {
        return Err("Maximum stake amount is 1000 tokens".to_string());
    }
    
    Ok(())
}

// Ensure the hardcoded authority principal is always registered
fn ensure_hardcoded_authority() {
    const AUTHORIZED_PRINCIPAL: &str = "d27x5-vpdgv-xg4ve-woszp-ulej4-4hlq4-xrlwz-nyedm-rtjsa-a2d2z-oqe";
    if let Ok(authorized) = Principal::from_text(AUTHORIZED_PRINCIPAL) {
        if !store::is_authority(authorized) {
            let authority = Authority {
                id: authorized,
                reports_reviewed: Vec::new(),
                approval_rate: 0.0,
            };
            store::add_authority(authority);
            ic_cdk::api::print(format!("Initialized hardcoded authority: {}", AUTHORIZED_PRINCIPAL));
        }
    }
}

pub fn init() {
    store::ensure_default_ipfs_config();
    store::rebuild_indexes();
    ensure_hardcoded_authority();
}

pub fn post_upgrade() {
    store::ensure_default_ipfs_config();
    store::rebuild_indexes();
    ensure_hardcoded_authority();
}


pub async fn submit_report(
    title: String,
    description: String,
    category: String,
    location: Option<Location>,
    incident_date: Option<String>,
    stake_amount: u64,
    evidence_count: u32,
) -> Result<u64, String> {
    let caller = ensure_authenticated()?;
    
    validate_report_input(&title, &description, &category, stake_amount)?;
    
    if evidence_count > 10 {
        return Err("Maximum 10 evidence files allowed".to_string());
    }
    
    let user = match store::get_user(caller) {
        Some(user) => user,
        None => {
            let new_user = User {
                id: caller,
                token_balance: 100,
                reports_submitted: Vec::new(),
                rewards_earned: 0,
                stakes_active: 0,
                stakes_lost: 0,
            };
            store::create_or_update_user(new_user);
            store::get_user(caller).unwrap()
        }
    };
    
    if user.token_balance < stake_amount {
        return Err("Insufficient token balance for staking".to_string());
    }
    
    let user_reports = store::get_user_reports(caller);
    let pending_count = user_reports.iter()
        .filter(|r| r.status == ReportStatus::Pending)
        .count();
    
    if pending_count >= 5 {
        return Err("You have too many pending reports. Please wait for review.".to_string());
    }
    
    let report = Report {
        id: 0,
        title: title.trim().to_string(),
        description: description.trim().to_string(),
        category: category.to_lowercase(),
        date_submitted: api::time(),
        incident_date,
        location,
        submitter_id: caller,
        evidence_count,
        evidence_files: Vec::new(),
        stake_amount,
        reward_amount: 0,
        status: ReportStatus::Pending,
        reviewer: None,
        review_date: None,
        review_notes: None,
        ipfs_cid: None,
        ipfs_pinned_at: None,
    };
    
    let report_id = store::create_report(&report);
    
    // Update user's balance and active stakes
    let mut updated_user = user;
    updated_user.token_balance -= stake_amount;
    updated_user.stakes_active += stake_amount;
    updated_user.reports_submitted.push(report_id);
    store::create_or_update_user(updated_user);
    
    let system_message = Message {
        id: 0,
        report_id,
        sender: MessageSender::System,
        content: format!("Report submitted with a stake of {} tokens. Your report is now pending review.", stake_amount),
        timestamp: api::time(),
        attachment: None,
    };
    
    store::create_message(&system_message);

    if let Some(stored_report) = store::get_report(report_id) {
        match ipfs::pin_report_snapshot(&stored_report).await {
            Ok(cid) => {
                let _ = store::set_report_ipfs_metadata(report_id, cid, api::time());
            }
            Err(err) => {
                ic_cdk::api::print(format!("Failed to pin report {report_id} to IPFS: {err}"));
            }
        }
    }
    
    Ok(report_id)
}


pub fn get_all_reports() -> Result<Vec<Report>, String> {
    ensure_authority()?;
    Ok(store::get_all_reports())
}


pub fn get_reports_by_status(status: ReportStatus) -> Result<Vec<Report>, String> {
    ensure_authority()?;
    Ok(store::get_reports_by_status(status))
}


pub fn get_report(id: u64) -> Vec<Report> {
    match store::get_report(id) {
        Some(report) => {
            let caller = caller();
            
            if report.submitter_id == caller || store::is_authority(caller) {
                vec![report]
            } else {
                vec![]
            }
        },
        None => vec![]
    }
}

// Get user's reports (for users)

pub fn get_user_reports() -> Vec<Report> {
    let caller = caller();
    
    if caller == Principal::anonymous() {
        return vec![];
    }
    
    store::get_user_reports(caller)
}

// Verify a report (for authority)

pub fn verify_report(report_id: u64, notes: Option<String>) -> Result<(), String> {
    let authority_id = ensure_authority()?;
    
    // Get the report
    let report = match store::get_report(report_id) {
        Some(report) => report,
        None => return Err("Report not found".to_string()),
    };
    
    // Check if report is pending
    if report.status != ReportStatus::Pending {
        return Err(format!("Report is already in {:?} state", report.status));
    }
    
    let submitter_id = report.submitter_id;
    let stake_amount = report.stake_amount;
    
    // Calculate reward based on stake amount and quality
    let base_multiplier = 10;
    let quality_bonus = if report.evidence_count >= 3 { 2 } else { 0 };
    let stake_bonus = if stake_amount >= 50 { 3 } else if stake_amount >= 20 { 1 } else { 0 };
    
    let total_multiplier = base_multiplier + quality_bonus + stake_bonus;
    let reward_amount = stake_amount * total_multiplier;
    
    // Update report status
    let mut updated_report = report;
    updated_report.status = ReportStatus::Approved;
    updated_report.reviewer = Some(authority_id);
    updated_report.review_date = Some(api::time());
    updated_report.review_notes = notes.clone();
    updated_report.reward_amount = reward_amount;
    
    store::update_report(updated_report)?;
    
    // Get submitter
    let submitter = match store::get_user(submitter_id) {
        Some(user) => user,
        None => return Err("Report submitter not found".to_string()),
    };
    
    // Update submitter's token balance (return stake + add reward)
    let mut updated_submitter = submitter;
    updated_submitter.token_balance += stake_amount + reward_amount;
    updated_submitter.stakes_active -= stake_amount;
    updated_submitter.rewards_earned += reward_amount;
    
    store::create_or_update_user(updated_submitter);
    
    // Add system message
    let message = Message {
        id: 0,
        report_id,
        sender: MessageSender::System,
        content: format!(
            "Report has been verified and approved! {} tokens returned + {} tokens reward = {} total tokens added to your account.{}",
            stake_amount,
            reward_amount,
            stake_amount + reward_amount,
            notes.map(|n| format!(" Authority notes: {}", n)).unwrap_or_default()
        ),
        timestamp: api::time(),
        attachment: None,
    };
    
    store::create_message(&message);
    
    // Update authority stats
    let mut stats = store::get_authority_stats();
    stats.total_rewards_distributed += reward_amount;
    store::update_authority_stats(stats);
    
    // Update authority's review record
    if let Some(mut authority) = store::get_authority(authority_id) {
        authority.reports_reviewed.push(report_id);
        authority.approval_rate = calculate_approval_rate(&authority.reports_reviewed);
        store::update_authority(authority);
    }
    
    Ok(())
}

// Helper function to calculate approval rate
fn calculate_approval_rate(reviewed_reports: &[u64]) -> f64 {
    if reviewed_reports.is_empty() {
        return 0.0;
    }
    
    let approved_count = reviewed_reports.iter()
        .filter_map(|&id| store::get_report(id))
        .filter(|r| r.status == ReportStatus::Approved)
        .count();
    
    approved_count as f64 / reviewed_reports.len() as f64 * 100.0
}

// Reject a report (for authority)

pub fn reject_report(report_id: u64, notes: Option<String>) -> Result<(), String> {
    let authority_id = ensure_authority()?;
    
    // Ensure rejection notes are provided
    if notes.is_none() || notes.as_ref().unwrap().trim().is_empty() {
        return Err("Rejection reason must be provided".to_string());
    }
    
    // Get the report
    let report = match store::get_report(report_id) {
        Some(report) => report,
        None => return Err("Report not found".to_string()),
    };
    
    // Check if report is pending
    if report.status != ReportStatus::Pending {
        return Err(format!("Report is already in {:?} state", report.status));
    }
    
    let submitter_id = report.submitter_id;
    let stake_amount = report.stake_amount;
    
    // Update report status
    let mut updated_report = report;
    updated_report.status = ReportStatus::Rejected;
    updated_report.reviewer = Some(authority_id);
    updated_report.review_date = Some(api::time());
    updated_report.review_notes = notes.clone();
    
    store::update_report(updated_report)?;
    
    // Get submitter
    let submitter = match store::get_user(submitter_id) {
        Some(user) => user,
        None => return Err("Report submitter not found".to_string()),
    };
    
    // Update submitter's stakes (stake is lost)
    let mut updated_submitter = submitter;
    updated_submitter.stakes_active -= stake_amount;
    updated_submitter.stakes_lost += stake_amount;
    
    store::create_or_update_user(updated_submitter);
    
    // Add system message
    let message = Message {
        id: 0,
        report_id,
        sender: MessageSender::System,
        content: format!(
            "Report has been reviewed and rejected. Your staked {} tokens have been forfeited. Reason: {}",
            stake_amount,
            notes.unwrap_or_default()
        ),
        timestamp: api::time(),
        attachment: None,
    };
    
    store::create_message(&message);
    
    // Update authority's review record
    if let Some(mut authority) = store::get_authority(authority_id) {
        authority.reports_reviewed.push(report_id);
        authority.approval_rate = calculate_approval_rate(&authority.reports_reviewed);
        store::update_authority(authority);
    }
    
    Ok(())
}

// Put report under review (for authority)

pub fn put_under_review(report_id: u64, notes: Option<String>) -> Result<(), String> {
    let authority_id = ensure_authority()?;
    
    // Get the report
    let report = match store::get_report(report_id) {
        Some(report) => report,
        None => return Err("Report not found".to_string()),
    };
    
    // Check if report is pending
    if report.status != ReportStatus::Pending {
        return Err(format!("Report is already in {:?} state", report.status));
    }
    
    // Update report status
    let mut updated_report = report;
    updated_report.status = ReportStatus::UnderReview;
    updated_report.reviewer = Some(authority_id);
    updated_report.review_notes = notes.clone();
    
    store::update_report(updated_report)?;
    
    // Add system message
    let message = Message {
        id: 0,
        report_id,
        sender: MessageSender::System,
        content: format!(
            "Your report is now under review by authorities.{}",
            notes.map(|n| format!(" Authority notes: {}", n)).unwrap_or_default()
        ),
        timestamp: api::time(),
        attachment: None,
    };
    
    store::create_message(&message);
    
    Ok(())
}

pub async fn upload_evidence(
    report_id: u64,
    file_name: String,
    file_type: String,
    file_data: Vec<u8>,
) -> Result<u64, String> {
    let caller = ensure_authenticated()?;

    if file_data.is_empty() {
        return Err("Evidence file cannot be empty".to_string());
    }

    if file_data.len() > MAX_EVIDENCE_BYTES {
        return Err(format!("Evidence file exceeds {} bytes limit", MAX_EVIDENCE_BYTES));
    }

    let report = store::get_report(report_id).ok_or_else(|| "Report not found".to_string())?;

    if report.submitter_id != caller {
        return Err("You can only upload evidence for your own reports".to_string());
    }

    let evidence = EvidenceFile {
        id: 0,
        name: file_name.trim().to_string(),
        file_type: file_type.trim().to_string(),
        data: file_data,
        upload_date: api::time(),
        ipfs_cid: None,
    };

    let evidence_id = store::add_evidence_file(&evidence);

    let mut updated_report = report;
    updated_report.evidence_files.push(evidence_id);
    updated_report.evidence_count = updated_report.evidence_files.len() as u32;
    store::update_report(updated_report)?;

    match ipfs::pin_evidence_blob(report_id, &evidence).await {
        Ok(cid) => {
            let _ = store::set_evidence_ipfs_cid(evidence_id, cid);
        }
        Err(err) => {
            ic_cdk::api::print(format!("Failed to pin evidence {evidence_id} for report {report_id}: {err}"));
        }
    }

    if let Some(latest_report) = store::get_report(report_id) {
        if let Ok(cid) = ipfs::pin_report_snapshot(&latest_report).await {
            let _ = store::set_report_ipfs_metadata(report_id, cid, api::time());
        }
    }

    Ok(evidence_id)
}

// Send a message as authority

pub fn send_message_as_authority(report_id: u64, content: String) -> Result<(), String> {
    let authority_id = ensure_authority()?;
    
    if content.trim().is_empty() {
        return Err("Message content cannot be empty".to_string());
    }
    
    if content.len() > 2000 {
        return Err("Message too long (max 2000 characters)".to_string());
    }
    
    // Check if report exists
    if store::get_report(report_id).is_none() {
        return Err("Report not found".to_string());
    }
    
    // Create message
    let message = Message {
        id: 0,
        report_id,
        sender: MessageSender::Authority(authority_id),
        content: content.trim().to_string(),
        timestamp: api::time(),
        attachment: None,
    };
    
    store::create_message(&message);
    
    Ok(())
}

// Send a message as informer

pub fn send_message_as_reporter(report_id: u64, content: String) -> Result<(), String> {
    let caller = ensure_authenticated()?;
    
    if content.trim().is_empty() {
        return Err("Message content cannot be empty".to_string());
    }
    
    if content.len() > 2000 {
        return Err("Message too long (max 2000 characters)".to_string());
    }
    
    // Check if report exists and caller is the submitter
    let report = match store::get_report(report_id) {
        Some(report) => report,
        None => return Err("Report not found".to_string()),
    };
    
    if report.submitter_id != caller {
        return Err("You can only send messages for your own reports".to_string());
    }
    
    // Create message
    let message = Message {
        id: 0,
        report_id,
        sender: MessageSender::Reporter(caller),
        content: content.trim().to_string(),
        timestamp: api::time(),
        attachment: None,
    };
    
    store::create_message(&message);
    
    Ok(())
}

// Get messages for a report

pub fn get_messages(report_id: u64) -> Vec<Message> {
    let caller = caller();
    
    // Check if report exists
    let report = match store::get_report(report_id) {
        Some(report) => report,
        None => return vec![],
    };
    
    // Check if caller is authorized to see messages
    if report.submitter_id != caller && !store::is_authority(caller) {
        return vec![];
    }
    
    store::get_report_messages(report_id)
}

// Get user token balance

pub fn get_user_balance() -> u64 {
    let caller = caller();
    
    if caller == Principal::anonymous() {
        return 0;
    }
    
    match store::get_user(caller) {
        Some(user) => user.token_balance,
        None => {
            // Create new user with initial 100 tokens
            let new_user = User {
                id: caller,
                token_balance: 100,
                reports_submitted: Vec::new(),
                rewards_earned: 0,
                stakes_active: 0,
                stakes_lost: 0,
            };
            store::create_or_update_user(new_user);
            100
        }
    }
}

// Get authority stats

pub fn get_authority_statistics() -> Result<AuthorityStats, String> {
    ensure_authority()?;
    Ok(store::get_authority_stats())
}

// Add a new authority (only for existing authorities)

pub fn add_new_authority(id: Principal) -> Result<(), String> {
    ensure_authority()?;
    
    if store::is_authority(id) {
        return Err("Principal is already an authority".to_string());
    }
    
    let authority = Authority {
        id,
        reports_reviewed: Vec::new(),
        approval_rate: 0.0,
    };
    
    store::add_authority(authority);
    
    Ok(())
}

pub fn configure_ipfs_credentials(api_key: String, api_secret: String, jwt: String) -> Result<(), String> {
    ensure_authority()?;

    if api_key.trim().is_empty() || api_secret.trim().is_empty() || jwt.trim().is_empty() {
        return Err("IPFS credentials cannot be empty".to_string());
    }

    let config = IpfsConfig {
        api_key: api_key.trim().to_string(),
        api_secret: api_secret.trim().to_string(),
        jwt: jwt.trim().to_string(),
    };

    store::set_ipfs_config(config);
    Ok(())
}

// Remove authority (only for existing authorities)

pub fn remove_authority(id: Principal) -> Result<(), String> {
    ensure_authority()?;
    
    if !store::is_authority(id) {
        return Err("Principal is not an authority".to_string());
    }
    
    // Cannot remove yourself
    if id == caller() {
        return Err("Cannot remove yourself as authority".to_string());
    }
    
    store::remove_authority(id);
    
    Ok(())
}

// Get all authorities (for authorities only)
pub fn get_all_authorities() -> Result<Vec<Authority>, String> {
    ensure_authority()?;
    Ok(store::get_all_authorities())
}

// For development: Reset to initial state with mock data

pub fn reset_to_mock_data() -> Result<(), String> {
    ensure_authority()?;
    
    // This would be implemented to clear existing data and reinitialize mock data
    // For brevity, we'll just call initialize again
    store::initialize_mock_data();
    
    Ok(())
}

// Bulk operations for efficiency

pub fn bulk_verify_reports(report_ids: Vec<u64>, notes: Option<String>) -> Result<Vec<u64>, String> {
    ensure_authority()?;
    
    if report_ids.len() > 10 {
        return Err("Cannot bulk verify more than 10 reports at once".to_string());
    }
    
    let mut successfully_verified = Vec::new();
    
    for report_id in report_ids {
        match verify_report(report_id, notes.clone()) {
            Ok(_) => successfully_verified.push(report_id),
            Err(_) => {} // Skip failed verifications
        }
    }
    
    Ok(successfully_verified)
}

// Advanced search functionality - optimized with indexed lookups

pub fn search_reports(
    keyword: Option<String>,
    category: Option<String>,
    status: Option<ReportStatus>,
    date_from: Option<u64>,
    date_to: Option<u64>,
    min_stake: Option<u64>,
    max_stake: Option<u64>,
) -> Result<Vec<Report>, String> {
    ensure_authority()?;
    
    let mut used_status_index = false;
    let mut used_category_index = false;
    
    // Start with the most restrictive filter to minimize dataset
    let mut filtered_reports: Vec<Report> = if let Some(ref stat) = status {
        used_status_index = true;
        store::get_reports_by_status(stat.clone())
    } else if let Some(ref cat) = category {
        used_category_index = true;
        store::get_reports_by_category(cat)
    } else {
        store::get_all_reports()
    };
    
    // Apply remaining filters
    if let Some(keyword) = keyword {
        let keyword_lower = keyword.to_lowercase();
        filtered_reports.retain(|r| {
            r.title.to_lowercase().contains(&keyword_lower) ||
            r.description.to_lowercase().contains(&keyword_lower)
        });
    }
    
    // If category was not used as initial filter, apply it now
    if !used_category_index {
        if let Some(ref cat) = category {
            let cat_lower = cat.to_lowercase();
            filtered_reports.retain(|r| r.category.to_lowercase() == cat_lower);
        }
    }
    
    // If status was not used as initial filter, apply it now
    if !used_status_index {
        if let Some(stat) = status {
            filtered_reports.retain(|r| r.status == stat);
        }
    }
    
    if let Some(from) = date_from {
        filtered_reports.retain(|r| r.date_submitted >= from);
    }
    
    if let Some(to) = date_to {
        filtered_reports.retain(|r| r.date_submitted <= to);
    }
    
    if let Some(min) = min_stake {
        filtered_reports.retain(|r| r.stake_amount >= min);
    }
    
    if let Some(max) = max_stake {
        filtered_reports.retain(|r| r.stake_amount <= max);
    }
    
    Ok(filtered_reports)
}