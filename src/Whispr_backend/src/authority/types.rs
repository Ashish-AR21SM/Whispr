use candid::{CandidType, Deserialize, Principal};
use ic_stable_structures::{storable::Bound, Storable};
use serde::Serialize;
use std::borrow::Cow;

// Report status enum
#[derive(Clone, Debug, CandidType, Deserialize, Serialize, PartialEq, Eq, Hash)]
pub enum ReportStatus {
    Pending,
    UnderReview,
    Approved,
    Rejected,
}

// Evidence file
#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct EvidenceFile {
    pub id: u64,
    pub name: String,
    pub file_type: String,
    pub data: Vec<u8>,
    pub upload_date: u64,
    pub ipfs_cid: Option<String>,
}

impl Storable for EvidenceFile {
    fn to_bytes(&self) -> Cow<[u8]> {
        let bytes = candid::encode_one(self).unwrap();
        Cow::Owned(bytes)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

// Location data
#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct Location {
    pub address: Option<String>,
    pub latitude: f64,
    pub longitude: f64,
}

// Report structure
#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct Report {
    pub id: u64,
    pub title: String,
    pub description: String,
    pub category: String,
    pub date_submitted: u64,
    pub incident_date: Option<String>,
    pub location: Option<Location>,
    pub submitter_id: Principal,
    pub evidence_count: u32,
    pub evidence_files: Vec<u64>, // IDs of evidence files
    pub stake_amount: u64,
    pub reward_amount: u64,
    pub status: ReportStatus,
    pub reviewer: Option<Principal>,
    pub review_date: Option<u64>,
    pub review_notes: Option<String>,
    pub ipfs_cid: Option<String>,
    pub ipfs_pinned_at: Option<u64>,
}

impl Storable for Report {
    fn to_bytes(&self) -> Cow<[u8]> {
        let bytes = candid::encode_one(self).unwrap();
        Cow::Owned(bytes)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

// Message for communication between authority and informer
#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct Message {
    pub id: u64,
    pub report_id: u64,
    pub sender: MessageSender,
    pub content: String,
    pub timestamp: u64,
    pub attachment: Option<Vec<u8>>,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub enum MessageSender {
    Authority(Principal),
    Reporter(Principal),
    System,
}

impl Storable for Message {
    fn to_bytes(&self) -> Cow<[u8]> {
        let bytes = candid::encode_one(self).unwrap();
        Cow::Owned(bytes)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

// User structure
#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct User {
    pub id: Principal,
    pub token_balance: u64,
    pub reports_submitted: Vec<u64>,
    pub rewards_earned: u64,
    pub stakes_active: u64,
    pub stakes_lost: u64,
}

impl Storable for User {
    fn to_bytes(&self) -> Cow<[u8]> {
        let bytes = candid::encode_one(self).unwrap();
        Cow::Owned(bytes)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

// Authority structure with permissions
#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct Authority {
    pub id: Principal,
    pub reports_reviewed: Vec<u64>,
    pub approval_rate: f64,
}

impl Storable for Authority {
    fn to_bytes(&self) -> Cow<[u8]> {
        let bytes = candid::encode_one(self).unwrap();
        Cow::Owned(bytes)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

// Configuration for token rewards
#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct RewardConfig {
    pub reward_multiplier: u64,  // Multiplier for rewards (e.g., 10x stake)
    pub min_stake_amount: u64,   // Minimum amount to stake
    pub max_stake_amount: u64,   // Maximum amount to stake
}

// Configuration for IPFS connectivity
#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct IpfsConfig {
    pub api_key: String,
    pub api_secret: String,
    pub jwt: String,
}

impl Storable for IpfsConfig {
    fn to_bytes(&self) -> Cow<[u8]> {
        let bytes = candid::encode_one(self).unwrap();
        Cow::Owned(bytes)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

// Statistics for authority dashboard
#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct AuthorityStats {
    pub reports_pending: u64,
    pub reports_verified: u64,
    pub reports_rejected: u64,
    pub total_rewards_distributed: u64,
}

// Detailed analytics for comprehensive dashboard
#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct DetailedAnalytics {
    pub total_reports: u64,
    pub pending_reports: u64,
    pub approved_reports: u64,
    pub rejected_reports: u64,
    pub category_breakdown: std::collections::HashMap<String, (u64, u64, u64)>, // (pending, approved, rejected)
    pub monthly_submission_trend: std::collections::HashMap<u64, u64>, // month -> count
    pub average_stake_amount: f64,
    pub total_staked_amount: u64,
    pub total_rewards_distributed: u64,
}

// System health status
#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct SystemHealth {
    pub status: String,
    pub total_reports: u64,
    pub pending_reports: u64,
    pub system_time: u64,
    pub memory_usage: u64,
}

// Search and filter parameters
#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct ReportFilter {
    pub status: Option<ReportStatus>,
    pub category: Option<String>,
    pub date_range: Option<(u64, u64)>, // (start_date, end_date)
    pub submitter: Option<Principal>,
    pub min_stake: Option<u64>,
    pub max_stake: Option<u64>,
}

// Pagination parameters
#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct PaginationParams {
    pub page: u64,
    pub page_size: u64,
    pub sort_by: Option<String>,
    pub sort_order: Option<String>, // "asc" or "desc"
}