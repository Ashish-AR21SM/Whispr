export const idlFactory = ({ IDL }) => {
  const Result_2 = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text });
  const Result_4 = IDL.Variant({ 'Ok' : IDL.Vec(IDL.Nat64), 'Err' : IDL.Text });
  const Authority = IDL.Record({
    'id' : IDL.Principal,
    'reports_reviewed' : IDL.Vec(IDL.Nat64),
    'approval_rate' : IDL.Float64,
  });
  const Result_7 = IDL.Variant({ 'Ok' : IDL.Vec(Authority), 'Err' : IDL.Text });
  const ReportStatus = IDL.Variant({
    'UnderReview' : IDL.Null,
    'Approved' : IDL.Null,
    'Rejected' : IDL.Null,
    'Pending' : IDL.Null,
  });
  const Location = IDL.Record({
    'latitude' : IDL.Float64,
    'longitude' : IDL.Float64,
    'address' : IDL.Opt(IDL.Text),
  });
  const Report = IDL.Record({
    'id' : IDL.Nat64,
    'status' : ReportStatus,
    'title' : IDL.Text,
    'evidence_files' : IDL.Vec(IDL.Nat64),
    'reward_amount' : IDL.Nat64,
    'description' : IDL.Text,
    'evidence_count' : IDL.Nat32,
    'date_submitted' : IDL.Nat64,
    'category' : IDL.Text,
    'incident_date' : IDL.Opt(IDL.Text),
    'reviewer' : IDL.Opt(IDL.Principal),
    'review_notes' : IDL.Opt(IDL.Text),
    'stake_amount' : IDL.Nat64,
    'ipfs_pinned_at' : IDL.Opt(IDL.Nat64),
    'review_date' : IDL.Opt(IDL.Nat64),
    'location' : IDL.Opt(Location),
    'ipfs_cid' : IDL.Opt(IDL.Text),
    'submitter_id' : IDL.Principal,
  });
  const Result_1 = IDL.Variant({ 'Ok' : IDL.Vec(Report), 'Err' : IDL.Text });
  const AuthorityStats = IDL.Record({
    'reports_verified' : IDL.Nat64,
    'total_rewards_distributed' : IDL.Nat64,
    'reports_pending' : IDL.Nat64,
    'reports_rejected' : IDL.Nat64,
  });
  const Result_3 = IDL.Variant({ 'Ok' : AuthorityStats, 'Err' : IDL.Text });
  const DetailedAnalytics = IDL.Record({
    'monthly_submission_trend' : IDL.Vec(IDL.Tuple(IDL.Nat64, IDL.Nat64)),
    'category_breakdown' : IDL.Vec(
      IDL.Tuple(IDL.Text, IDL.Tuple(IDL.Nat64, IDL.Nat64, IDL.Nat64))
    ),
    'total_reports' : IDL.Nat64,
    'total_staked_amount' : IDL.Nat64,
    'average_stake_amount' : IDL.Float64,
    'rejected_reports' : IDL.Nat64,
    'total_rewards_distributed' : IDL.Nat64,
    'pending_reports' : IDL.Nat64,
    'approved_reports' : IDL.Nat64,
  });
  const Result_5 = IDL.Variant({ 'Ok' : DetailedAnalytics, 'Err' : IDL.Text });
  const EvidenceFile = IDL.Record({
    'id' : IDL.Nat64,
    'data' : IDL.Vec(IDL.Nat8),
    'name' : IDL.Text,
    'file_type' : IDL.Text,
    'upload_date' : IDL.Nat64,
    'ipfs_cid' : IDL.Opt(IDL.Text),
  });
  const MessageSender = IDL.Variant({
    'System' : IDL.Null,
    'Authority' : IDL.Principal,
    'Reporter' : IDL.Principal,
  });
  const Message = IDL.Record({
    'id' : IDL.Nat64,
    'report_id' : IDL.Nat64,
    'content' : IDL.Text,
    'sender' : MessageSender,
    'timestamp' : IDL.Nat64,
    'attachment' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const Result_6 = IDL.Variant({
    'Ok' : IDL.Tuple(IDL.Vec(Report), IDL.Nat64),
    'Err' : IDL.Text,
  });
  const User = IDL.Record({
    'id' : IDL.Principal,
    'stakes_lost' : IDL.Nat64,
    'rewards_earned' : IDL.Nat64,
    'reports_submitted' : IDL.Vec(IDL.Nat64),
    'stakes_active' : IDL.Nat64,
    'token_balance' : IDL.Nat64,
  });
  const SystemHealth = IDL.Record({
    'status' : IDL.Text,
    'total_reports' : IDL.Nat64,
    'system_time' : IDL.Nat64,
    'pending_reports' : IDL.Nat64,
    'memory_usage' : IDL.Nat64,
  });
  const Result_8 = IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text });
  const Result = IDL.Variant({ 'Ok' : IDL.Nat64, 'Err' : IDL.Text });
  return IDL.Service({
    'add_new_authority' : IDL.Func([IDL.Principal], [Result_2], []),
    'add_tokens_to_user' : IDL.Func([IDL.Principal, IDL.Nat64], [Result_2], []),
    'bulk_verify_reports' : IDL.Func(
        [IDL.Vec(IDL.Nat64), IDL.Opt(IDL.Text)],
        [Result_4],
        [],
      ),
    'configure_ipfs_credentials' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text],
        [Result_2],
        [],
      ),
    'get_all_authorities' : IDL.Func([], [Result_7], ['query']),
    'get_all_reports' : IDL.Func([], [Result_1], ['query']),
    'get_authority_statistics' : IDL.Func([], [Result_3], ['query']),
    'get_detailed_analytics' : IDL.Func([], [Result_5], ['query']),
    'get_evidence' : IDL.Func([IDL.Nat64], [IDL.Opt(EvidenceFile)], ['query']),
    'get_messages' : IDL.Func([IDL.Nat64], [IDL.Vec(Message)], ['query']),
    'get_report' : IDL.Func([IDL.Nat64], [IDL.Vec(Report)], ['query']),
    'get_report_evidence' : IDL.Func(
        [IDL.Nat64],
        [IDL.Vec(EvidenceFile)],
        ['query'],
      ),
    'get_reports_by_category' : IDL.Func([IDL.Text], [Result_1], ['query']),
    'get_reports_by_date_range' : IDL.Func(
        [IDL.Nat64, IDL.Nat64],
        [Result_1],
        ['query'],
      ),
    'get_reports_by_status' : IDL.Func([ReportStatus], [Result_1], ['query']),
    'get_reports_paginated' : IDL.Func(
        [IDL.Nat64, IDL.Nat64],
        [Result_6],
        ['query'],
      ),
    'get_user_balance' : IDL.Func([], [IDL.Nat64], ['query']),
    'get_user_info' : IDL.Func([], [IDL.Opt(User)], ['query']),
    'get_user_reports' : IDL.Func([], [IDL.Vec(Report)], ['query']),
    'health_check' : IDL.Func([], [SystemHealth], ['query']),
    'initialize_system' : IDL.Func([], [Result_2], []),
    'is_authority' : IDL.Func([], [IDL.Bool], ['query']),
    'put_under_review' : IDL.Func(
        [IDL.Nat64, IDL.Opt(IDL.Text)],
        [Result_2],
        [],
      ),
    'register_as_authority' : IDL.Func([], [Result_8], []),
    'reject_report' : IDL.Func([IDL.Nat64, IDL.Opt(IDL.Text)], [Result_2], []),
    'remove_authority' : IDL.Func([IDL.Principal], [Result_2], []),
    'reset_to_mock_data' : IDL.Func([], [Result_2], []),
    'retrieve_evidence_from_ipfs' : IDL.Func([IDL.Text], [Result_8], []),
    'retrieve_report_from_ipfs' : IDL.Func([IDL.Text], [Result_8], []),
    'search_reports' : IDL.Func(
        [
          IDL.Opt(IDL.Text),
          IDL.Opt(IDL.Text),
          IDL.Opt(ReportStatus),
          IDL.Opt(IDL.Nat64),
          IDL.Opt(IDL.Nat64),
          IDL.Opt(IDL.Nat64),
          IDL.Opt(IDL.Nat64),
        ],
        [Result_1],
        ['query'],
      ),
    'send_message_as_authority' : IDL.Func(
        [IDL.Nat64, IDL.Text],
        [Result_2],
        [],
      ),
    'send_message_as_reporter' : IDL.Func(
        [IDL.Nat64, IDL.Text],
        [Result_2],
        [],
      ),
    'submit_report' : IDL.Func(
        [
          IDL.Text,
          IDL.Text,
          IDL.Text,
          IDL.Opt(Location),
          IDL.Opt(IDL.Text),
          IDL.Nat64,
          IDL.Nat32,
        ],
        [Result],
        [],
      ),
    'transfer_tokens' : IDL.Func([IDL.Principal, IDL.Nat64], [Result_2], []),
    'upload_evidence' : IDL.Func(
        [IDL.Nat64, IDL.Text, IDL.Text, IDL.Vec(IDL.Nat8)],
        [Result],
        [],
      ),
    'verify_report' : IDL.Func([IDL.Nat64, IDL.Opt(IDL.Text)], [Result_2], []),
  });
};
export const init = ({ IDL }) => { return []; };
