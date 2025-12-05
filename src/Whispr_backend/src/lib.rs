mod authority;

use candid::Principal;
use ic_cdk_macros::*;

#[init]
fn init() {
    authority::handlers::init();
}

#[post_upgrade]
fn post_upgrade() {
    authority::handlers::post_upgrade();
}

// Debug function to check storage state
#[query]
fn debug_storage_state() -> String {
    let reports_count = authority::store::get_all_reports_for_debug();
    let authorities = authority::store::get_all_authorities();
    let auth_ids: Vec<String> = authorities.iter().map(|a| a.id.to_text()).collect();
    format!(
        "Reports: {}, Authorities: {}, Authority IDs: {:?}",
        reports_count, authorities.len(), auth_ids
    )
}

// Debug is_authority check
#[query]
fn debug_is_authority(id: Principal) -> String {
    let (result, size, keys) = authority::store::is_authority_debug(id);
    format!(
        "is_authority({}) = {}, map_size = {}, stored_keys = {:?}",
        id.to_text(), result, size, keys
    )
}
#[update]
async fn submit_report(
    title: String,
    description: String,
    category: String,
    location: Option<authority::types::Location>,
    incident_date: Option<String>,
    stake_amount: u64,
    evidence_count: u32,
) -> Result<u64, String> {
    authority::handlers::submit_report(title, description, category, location, incident_date, stake_amount, evidence_count).await
}

#[query]
fn get_all_reports() -> Result<Vec<authority::types::Report>, String> {
    authority::handlers::get_all_reports()
}

#[query]
fn get_reports_by_status(status: authority::types::ReportStatus) -> Result<Vec<authority::types::Report>, String> {
    authority::handlers::get_reports_by_status(status)
}

#[query]
fn get_report(id: u64) -> Vec<authority::types::Report> {
    authority::handlers::get_report(id)
}

#[query]
fn get_user_reports() -> Vec<authority::types::Report> {
    authority::handlers::get_user_reports()
}

#[update]
fn verify_report(report_id: u64, notes: Option<String>) -> Result<(), String> {
    authority::handlers::verify_report(report_id, notes)
}

#[update]
fn reject_report(report_id: u64, notes: Option<String>) -> Result<(), String> {
    authority::handlers::reject_report(report_id, notes)
}

#[update]
fn put_under_review(report_id: u64, notes: Option<String>) -> Result<(), String> {
    authority::handlers::put_under_review(report_id, notes)
}

#[update]
fn bulk_verify_reports(report_ids: Vec<u64>, notes: Option<String>) -> Result<Vec<u64>, String> {
    authority::handlers::bulk_verify_reports(report_ids, notes)
}

#[update]
fn send_message_as_authority(report_id: u64, content: String) -> Result<(), String> {
    authority::handlers::send_message_as_authority(report_id, content)
}

#[update]
fn send_message_as_reporter(report_id: u64, content: String) -> Result<(), String> {
    authority::handlers::send_message_as_reporter(report_id, content)
}

#[query]
fn get_messages(report_id: u64) -> Vec<authority::types::Message> {
    authority::handlers::get_messages(report_id)
}

#[query]
fn get_user_balance() -> u64 {
    authority::handlers::get_user_balance()
}

#[query]
fn get_user_info() -> Option<authority::types::User> {
    let caller = ic_cdk::caller();
    if caller == Principal::anonymous() {
        return None;
    }
    authority::store::get_user(caller)
}

#[update]
fn transfer_tokens(to: Principal, amount: u64) -> Result<(), String> {
    let caller = ic_cdk::caller();
    
    if caller == Principal::anonymous() {
        return Err("Anonymous callers cannot transfer tokens".to_string());
    }
    
    authority::store::transfer_tokens(caller, to, amount)
}

#[update]
fn add_tokens_to_user(user_id: Principal, amount: u64) -> Result<(), String> {
    if !authority::store::is_authority(ic_cdk::caller()) {
        return Err("Only authorities can add tokens".to_string());
    }
    
    let user = match authority::store::get_user(user_id) {
        Some(mut user) => {
            user.token_balance += amount;
            user
        },
        None => authority::types::User {
            id: user_id,
            token_balance: amount,
            reports_submitted: Vec::new(),
            rewards_earned: 0,
            stakes_active: 0,
            stakes_lost: 0,
        },
    };
    
    authority::store::create_or_update_user(user);
    Ok(())
}

#[update]
fn configure_ipfs_credentials(api_key: String, api_secret: String, jwt: String) -> Result<(), String> {
    authority::handlers::configure_ipfs_credentials(api_key, api_secret, jwt)
}

#[query]
fn is_authority() -> bool {
    let caller = ic_cdk::caller();
    if caller == Principal::anonymous() {
        return false;
    }
    authority::store::is_authority(caller)
}

// Debug function to check if a specific principal is an authority
#[query]
fn check_authority_status(principal_text: String) -> Result<bool, String> {
    let principal = Principal::from_text(&principal_text)
        .map_err(|_| format!("Invalid principal: {}", principal_text))?;
    Ok(authority::store::is_authority(principal))
}

// Register the caller as an authority - RESTRICTED to specific authorized principal only
// Only the hardcoded AUTHORIZED_PRINCIPAL can register as authority
#[update]
fn register_as_authority() -> Result<String, String> {
    let caller = ic_cdk::caller();
    
    if caller == Principal::anonymous() {
        return Err("Anonymous callers cannot be registered as authority".to_string());
    }
    
    // Only allow the specific authorized principal to register as authority
    const AUTHORIZED_PRINCIPAL: &str = "d27x5-vpdgv-xg4ve-woszp-ulej4-4hlq4-xrlwz-nyedm-rtjsa-a2d2z-oqe";
    let authorized = Principal::from_text(AUTHORIZED_PRINCIPAL).unwrap();
    
    if caller != authorized {
        return Err("Only the authorized principal can register as authority".to_string());
    }
    
    if authority::store::is_authority(caller) {
        return Ok(format!("Already registered as authority: {}", caller.to_text()));
    }
    
    let authority = authority::types::Authority {
        id: caller,
        reports_reviewed: Vec::new(),
        approval_rate: 0.0,
    };
    
    authority::store::add_authority(authority);
    Ok(format!("Registered as authority: {}", caller.to_text()))
}

// Initialize the hardcoded authority - can be called by controllers
// Force adds regardless of existing state to fix storage issues
#[update]
fn initialize_hardcoded_authority() -> Result<String, String> {
    const AUTHORIZED_PRINCIPAL: &str = "d27x5-vpdgv-xg4ve-woszp-ulej4-4hlq4-xrlwz-nyedm-rtjsa-a2d2z-oqe";
    
    let authorized = Principal::from_text(AUTHORIZED_PRINCIPAL)
        .map_err(|_| "Invalid authorized principal".to_string())?;
    
    // Force add the authority regardless of current state
    let auth = authority::types::Authority {
        id: authorized,
        reports_reviewed: Vec::new(),
        approval_rate: 0.0,
    };
    authority::store::add_authority(auth.clone());
    
    // Verify it was added
    let is_auth = authority::store::is_authority(authorized);
    let all_auths = authority::store::get_all_authorities();
    
    Ok(format!(
        "Force registered authority: {}. Verification: is_authority={}, total_authorities={}",
        AUTHORIZED_PRINCIPAL, is_auth, all_auths.len()
    ))
}

// Cleanup function: Remove all authorities except the hardcoded authorized principal
// This is a one-time fix function to clean up accidentally registered authorities
#[update]
fn cleanup_unauthorized_authorities() -> Result<u64, String> {
    let caller = ic_cdk::caller();
    
    // Hardcoded authorized principal and the canister deployer/controller
    const AUTHORIZED_PRINCIPAL: &str = "d27x5-vpdgv-xg4ve-woszp-ulej4-4hlq4-xrlwz-nyedm-rtjsa-a2d2z-oqe";
    const CONTROLLER_PRINCIPAL: &str = "hf7uc-glbhb-eoag6-ebhuc-k3y5f-3wp7c-4kvdw-wfgah-j2om5-tw57e-gqe";
    
    let authorized = Principal::from_text(AUTHORIZED_PRINCIPAL)
        .map_err(|_| "Invalid authorized principal".to_string())?;
    let controller = Principal::from_text(CONTROLLER_PRINCIPAL)
        .map_err(|_| "Invalid controller principal".to_string())?;
    
    // Allow the authorized principal, controller, or existing authorities to call this
    if caller != authorized && caller != controller && !authority::store::is_authority(caller) {
        return Err("Only the authorized principal or controller can perform cleanup".to_string());
    }
    
    let all_authorities = authority::store::get_all_authorities();
    let mut removed_count: u64 = 0;
    
    for auth in all_authorities {
        if auth.id != authorized {
            authority::store::remove_authority(auth.id);
            removed_count += 1;
        }
    }
    
    // Make sure the authorized principal is an authority
    if !authority::store::is_authority(authorized) {
        let auth = authority::types::Authority {
            id: authorized,
            reports_reviewed: Vec::new(),
            approval_rate: 0.0,
        };
        authority::store::add_authority(auth);
    }
    
    Ok(removed_count)
}

#[update]
fn add_new_authority(id: Principal) -> Result<(), String> {
    authority::handlers::add_new_authority(id)
}

#[update]
fn remove_authority(id: Principal) -> Result<(), String> {
    authority::handlers::remove_authority(id)
}

#[query]
fn get_all_authorities() -> Result<Vec<authority::types::Authority>, String> {
    authority::handlers::get_all_authorities()
}

#[query]
fn get_authority_statistics() -> Result<authority::types::AuthorityStats, String> {
    authority::handlers::get_authority_statistics()
}

#[query]
fn get_detailed_analytics() -> Result<authority::types::DetailedAnalytics, String> {
    if !authority::store::is_authority(ic_cdk::caller()) {
        return Err("Unauthorized".to_string());
    }
    
    let all_reports = authority::store::get_all_reports();
    let mut category_stats = std::collections::HashMap::new();
    let mut monthly_stats = std::collections::HashMap::new();
    
    let current_time = ic_cdk::api::time();
    let month_in_ns = 30 * 24 * 60 * 60 * 1_000_000_000u64;
    
    for report in &all_reports {
        let category_entry = category_stats.entry(report.category.clone()).or_insert((0u64, 0u64, 0u64));
        match report.status {
            authority::types::ReportStatus::Pending => category_entry.0 += 1,
            authority::types::ReportStatus::Approved => category_entry.1 += 1,
            authority::types::ReportStatus::Rejected => category_entry.2 += 1,
            _ => {},
        }
        
        let months_ago = (current_time - report.date_submitted) / month_in_ns;
        if months_ago < 12 {
            let month_entry = monthly_stats.entry(months_ago).or_insert(0u64);
            *month_entry += 1;
        }
    }
    
    let analytics = authority::types::DetailedAnalytics {
        total_reports: all_reports.len() as u64,
        pending_reports: all_reports.iter().filter(|r| r.status == authority::types::ReportStatus::Pending).count() as u64,
        approved_reports: all_reports.iter().filter(|r| r.status == authority::types::ReportStatus::Approved).count() as u64,
        rejected_reports: all_reports.iter().filter(|r| r.status == authority::types::ReportStatus::Rejected).count() as u64,
        category_breakdown: category_stats,
        monthly_submission_trend: monthly_stats,
        average_stake_amount: if all_reports.is_empty() { 0.0 } else { 
            all_reports.iter().map(|r| r.stake_amount as f64).sum::<f64>() / all_reports.len() as f64 
        },
        total_staked_amount: all_reports.iter().map(|r| r.stake_amount).sum(),
        total_rewards_distributed: authority::store::get_authority_stats().total_rewards_distributed,
    };
    
    Ok(analytics)
}

#[query]
fn health_check() -> authority::types::SystemHealth {
    let all_reports = authority::store::get_all_reports();
    let stats = authority::store::get_authority_stats();
    
    authority::types::SystemHealth {
        status: "healthy".to_string(),
        total_reports: all_reports.len() as u64,
        pending_reports: stats.reports_pending,
        system_time: ic_cdk::api::time(),
        memory_usage: 0,
    }
}

#[query]
fn get_reports_paginated(page: u64, page_size: u64) -> Result<(Vec<authority::types::Report>, u64), String> {
    if !authority::store::is_authority(ic_cdk::caller()) {
        return Err("Unauthorized".to_string());
    }
    
    let mut all_reports = authority::store::get_all_reports();
    let total_count = all_reports.len() as u64;
    
    // Sort by date_submitted descending (newest first) for better UX
    all_reports.sort_by(|a, b| b.date_submitted.cmp(&a.date_submitted));
    
    let start_index = (page * page_size) as usize;
    let end_index = std::cmp::min(start_index + page_size as usize, all_reports.len());
    
    if start_index >= all_reports.len() {
        return Ok((vec![], total_count));
    }
    
    let page_reports = all_reports[start_index..end_index].to_vec();
    Ok((page_reports, total_count))
}

#[query]
fn get_reports_by_category(category: String) -> Result<Vec<authority::types::Report>, String> {
    if !authority::store::is_authority(ic_cdk::caller()) {
        return Err("Unauthorized".to_string());
    }
    
    // O(1) lookup using category index instead of O(n) iteration
    Ok(authority::store::get_reports_by_category(&category))
}

#[query]
fn get_reports_by_date_range(start_date: u64, end_date: u64) -> Result<Vec<authority::types::Report>, String> {
    if !authority::store::is_authority(ic_cdk::caller()) {
        return Err("Unauthorized".to_string());
    }
    
    let all_reports = authority::store::get_all_reports();
    let filtered_reports: Vec<authority::types::Report> = all_reports
        .into_iter()
        .filter(|report| report.date_submitted >= start_date && report.date_submitted <= end_date)
        .collect();
    
    Ok(filtered_reports)
}

#[query]
fn search_reports(
    keyword: Option<String>,
    category: Option<String>,
    status: Option<authority::types::ReportStatus>,
    date_from: Option<u64>,
    date_to: Option<u64>,
    min_stake: Option<u64>,
    max_stake: Option<u64>,
) -> Result<Vec<authority::types::Report>, String> {
    authority::handlers::search_reports(keyword, category, status, date_from, date_to, min_stake, max_stake)
}

#[update]
async fn upload_evidence(
    report_id: u64,
    file_name: String,
    file_type: String,
    file_data: Vec<u8>,
) -> Result<u64, String> {
    authority::handlers::upload_evidence(report_id, file_name, file_type, file_data).await
}

#[query]
fn get_evidence(evidence_id: u64) -> Option<authority::types::EvidenceFile> {
    let caller = ic_cdk::caller();
    
    if caller == Principal::anonymous() {
        return None;
    }
    
    let evidence = authority::store::get_evidence_file(evidence_id)?;
    
    let all_reports = authority::store::get_all_reports();
    let report = all_reports.iter().find(|r| r.evidence_files.contains(&evidence_id))?;
    
    if report.submitter_id == caller || authority::store::is_authority(caller) {
        Some(evidence)
    } else {
        None
    }
}

#[query]
fn get_report_evidence(report_id: u64) -> Vec<authority::types::EvidenceFile> {
    let caller = ic_cdk::caller();
    
    if caller == Principal::anonymous() {
        return Vec::new();
    }
    
    let all_reports = authority::store::get_all_reports();
    let report = match all_reports.iter().find(|r| r.id == report_id) {
        Some(r) => r,
        None => return Vec::new(),
    };
    
    // Only submitter or authority can view evidence
    if report.submitter_id != caller && !authority::store::is_authority(caller) {
        return Vec::new();
    }
    
    report.evidence_files.iter()
        .filter_map(|id| authority::store::get_evidence_file(*id))
        .collect()
}

#[update]
async fn retrieve_report_from_ipfs(cid: String) -> Result<String, String> {
    let caller = ic_cdk::caller();
    
    if caller == Principal::anonymous() {
        return Err("Anonymous callers not allowed".to_string());
    }
    
    if !authority::store::is_authority(caller) {
        return Err("Only authorities can retrieve from IPFS".to_string());
    }
    
    let data = authority::ipfs::retrieve_from_ipfs(&cid).await?;
    String::from_utf8(data).map_err(|e| format!("Invalid UTF-8: {}", e))
}

#[update]
async fn retrieve_evidence_from_ipfs(cid: String) -> Result<String, String> {
    let caller = ic_cdk::caller();
    
    if caller == Principal::anonymous() {
        return Err("Anonymous callers not allowed".to_string());
    }
    
    let data = authority::ipfs::retrieve_from_ipfs(&cid).await?;
    String::from_utf8(data).map_err(|e| format!("Invalid UTF-8: {}", e))
}

#[update]
fn reset_to_mock_data() -> Result<(), String> {
    let authorities = authority::store::get_all_authorities();
    if !authorities.is_empty() && !authority::store::is_authority(ic_cdk::caller()) {
        return Err("Only authorities can reset data".to_string());
    }
    
    authority::handlers::reset_to_mock_data()
}

#[update]
fn initialize_system() -> Result<(), String> {
    let caller = ic_cdk::caller();
    if caller == Principal::anonymous() {
        return Err("Anonymous callers cannot initialize system".to_string());
    }
    
    let authorities = authority::store::get_all_authorities();
    if !authorities.is_empty() {
        return Err("System already initialized".to_string());
    }
    
    let authority = authority::types::Authority {
        id: caller,
        reports_reviewed: Vec::new(),
        approval_rate: 0.0,
    };
    
    authority::store::add_authority(authority);
    
    let specified_authority = authority::types::Authority {
        id: Principal::from_text("d27x5-vpdgv-xg4ve-woszp-ulej4-4hlq4-xrlwz-nyedm-rtjsa-a2d2z-oqe")
            .unwrap_or_else(|_| Principal::anonymous()),
        reports_reviewed: Vec::new(),
        approval_rate: 0.0,
    };
    
    authority::store::add_authority(specified_authority);
    
    authority::store::initialize_mock_data();
    
    Ok(())
}