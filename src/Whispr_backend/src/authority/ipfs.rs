use crate::authority::store;
use crate::authority::types::{EvidenceFile, IpfsConfig, Location, Report, ReportStatus};
use base64::engine::general_purpose::STANDARD as BASE64_STANDARD;
use base64::Engine;
use candid::Principal;
use ic_cdk::api::management_canister::http_request::{self, CanisterHttpRequestArgument, HttpHeader, HttpMethod, HttpResponse};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

const PINATA_JSON_ENDPOINT: &str = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
const HTTP_CALL_CYCLES: u128 = 25_000_000_000;
const MAX_RESPONSE_BYTES: u64 = 2_000_000;

pub async fn pin_report_snapshot(report: &Report) -> Result<String, String> {
    let config = store::get_ipfs_config().ok_or("IPFS configuration missing".to_string())?;
    let payload = ReportSnapshot::from(report);
    let name = format!("report-{}", report.id);
    pin_json(&config, &name, &payload).await
}

pub async fn pin_evidence_blob(report_id: u64, evidence: &EvidenceFile) -> Result<String, String> {
    let config = store::get_ipfs_config().ok_or("IPFS configuration missing".to_string())?;
    let payload = EvidenceSnapshot::new(report_id, evidence);
    let name = format!("report-{report_id}-evidence-{}", evidence.name);
    pin_json(&config, &name, &payload).await
}

async fn pin_json<T: Serialize>(config: &IpfsConfig, name: &str, payload: &T) -> Result<String, String> {
    let request_body = serde_json::to_vec(&PinJsonRequest {
        pinata_options: PinataOptions { cid_version: 1 },
        pinata_metadata: PinataMetadata { name },
        pinata_content: payload,
    }).map_err(|err| format!("Failed to serialize IPFS payload: {err}"))?;

    let headers = vec![
        HttpHeader { name: "Content-Type".to_string(), value: "application/json".to_string() },
        HttpHeader { name: "Accept".to_string(), value: "application/json".to_string() },
        HttpHeader { name: "Authorization".to_string(), value: format!("Bearer {}", config.jwt) },
        HttpHeader { name: "pinata_api_key".to_string(), value: config.api_key.clone() },
        HttpHeader { name: "pinata_secret_api_key".to_string(), value: config.api_secret.clone() },
    ];

    let request = CanisterHttpRequestArgument {
        url: PINATA_JSON_ENDPOINT.to_string(),
        method: HttpMethod::POST,
        headers,
        body: Some(request_body),
        max_response_bytes: Some(MAX_RESPONSE_BYTES),
        transform: None,
    };

    let (response,) = http_request::http_request(request, HTTP_CALL_CYCLES)
        .await
        .map_err(|(code, msg)| format!("IPFS request failed ({code:?}): {msg}"))?;

    parse_pinata_response(response)
}

fn parse_pinata_response(response: HttpResponse) -> Result<String, String> {
    let status_code = response_status_code(&response)?;

    if (200..300).contains(&status_code) {
        let body = String::from_utf8(response.body)
            .map_err(|err| format!("Invalid UTF-8 from Pinata response: {err}"))?;
        let parsed: PinJsonResponse = serde_json::from_str(&body)
            .map_err(|err| format!("Failed to parse Pinata response: {err}. Body: {body}"))?;
        Ok(parsed.ipfs_hash)
    } else {
        Err(format!(
            "Pinata returned status {} with body {:?}",
            status_code,
            response.body
        ))
    }
}

fn response_status_code(response: &HttpResponse) -> Result<u64, String> {
    response
        .status
        .0
        .to_string()
        .parse::<u64>()
        .map_err(|err| format!("Failed to parse HTTP status code: {err}"))
}

#[derive(Serialize)]
struct PinJsonRequest<'a, T: Serialize> {
    #[serde(rename = "pinataOptions")]
    pinata_options: PinataOptions,
    #[serde(rename = "pinataMetadata")]
    pinata_metadata: PinataMetadata<'a>,
    #[serde(rename = "pinataContent")]
    pinata_content: &'a T,
}

#[derive(Serialize)]
struct PinataOptions {
    #[serde(rename = "cidVersion")]
    cid_version: u8,
}

#[derive(Serialize)]
struct PinataMetadata<'a> {
    name: &'a str,
}

#[derive(Deserialize)]
struct PinJsonResponse {
    #[serde(rename = "IpfsHash")]
    ipfs_hash: String,
}

#[derive(Serialize, Deserialize, Clone)]
struct ReportSnapshot {
    report_id: u64,
    title: String,
    description: String,
    category: String,
    stake_amount: u64,
    reward_amount: u64,
    evidence_count: u32,
    location: Option<Location>,
    incident_date: Option<String>,
    status: ReportStatus,
    submitted_at: u64,
    submitter_hash: String,
}

impl From<&Report> for ReportSnapshot {
    fn from(report: &Report) -> Self {
        Self {
            report_id: report.id,
            title: report.title.clone(),
            description: report.description.clone(),
            category: report.category.clone(),
            stake_amount: report.stake_amount,
            reward_amount: report.reward_amount,
            evidence_count: report.evidence_count,
            location: report.location.clone(),
            incident_date: report.incident_date.clone(),
            status: report.status.clone(),
            submitted_at: report.date_submitted,
            submitter_hash: hash_principal(report.submitter_id),
        }
    }
}

#[derive(Serialize, Deserialize, Clone)]
struct EvidenceSnapshot {
    report_id: u64,
    file_name: String,
    file_type: String,
    uploaded_at: u64,
    base64_data: String,
}

impl EvidenceSnapshot {
    fn new(report_id: u64, evidence: &EvidenceFile) -> Self {
        Self {
            report_id,
            file_name: evidence.name.clone(),
            file_type: evidence.file_type.clone(),
            uploaded_at: evidence.upload_date,
            base64_data: BASE64_STANDARD.encode(&evidence.data),
        }
    }
}

fn hash_principal(principal: Principal) -> String {
    let mut hasher = Sha256::new();
    hasher.update(principal.as_slice());
    hex::encode(hasher.finalize())
}

// Retrieve data from IPFS using CID
pub async fn retrieve_from_ipfs(cid: &str) -> Result<Vec<u8>, String> {
    let gateway_url = format!("https://gateway.pinata.cloud/ipfs/{}", cid);
    
    let request = CanisterHttpRequestArgument {
        url: gateway_url,
        method: HttpMethod::GET,
        headers: vec![
            HttpHeader { 
                name: "Accept".to_string(), 
                value: "application/json".to_string() 
            },
        ],
        body: None,
        max_response_bytes: Some(MAX_RESPONSE_BYTES),
        transform: None,
    };

    let (response,) = http_request::http_request(request, HTTP_CALL_CYCLES)
        .await
        .map_err(|(code, msg)| format!("Failed to retrieve from IPFS ({code:?}): {msg}"))?;

    let status_code = response_status_code(&response)?;

    if (200..300).contains(&status_code) {
        Ok(response.body)
    } else {
        Err(format!(
            "IPFS gateway returned status {} for CID {}",
            status_code, cid
        ))
    }
}
