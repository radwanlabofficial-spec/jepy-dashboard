/**
 * Response and entity types.
 *
 * Mirrors `11-api-contract.md` v7.1 exactly. The error enum is CLOSED at the
 * nineteen codes below; anything else is expressed through `error.detail.reason`
 * (see `constants.ts`). Branch on `error.code`, never on `error.message`.
 */

export type ErrorCode =
  | 'E_VALIDATION'
  | 'E_UNAUTHENTICATED'
  | 'E_FORBIDDEN'
  | 'E_NOT_FOUND'
  | 'E_CONFLICT'
  | 'E_RATE_LIMIT'
  | 'E_QUOTA_EXHAUSTED'
  | 'E_BUDGET_GUARD'
  | 'E_AI_CAP'
  | 'E_YELP_GATE'
  | 'E_TIER_GATE'
  | 'E_COMPLIANCE_BLOCK'
  | 'E_LICENSE_BLOCK'
  | 'E_PROVIDER_POLICY'
  | 'E_NO_CANDIDATE'
  | 'E_CREDENTIAL_INVALID'
  | 'E_PROVIDER_ERROR'
  | 'E_TIMEOUT'
  | 'E_INTERNAL';

/** Second-level nuance. Never a code, never branched on as one. */
export type Reason =
  | 'class_x'
  | 'manual_only'
  | 'robots'
  | 'login_wall'
  | 'geo'
  | 'cold_email'
  | 'yelp_discovery'
  | 'admin_only'
  | 'device_scope'
  | 'mode_b_disabled'
  | 'adr_required'
  | 'counter_readonly'
  | 'setting_locked'
  | 'pack_immutable'
  | 'idempotency_replay'
  | 'weight_range'
  | 'pack_mismatch'
  | 'label_format'
  | 'label_reused'
  | 'unknown_provider'
  | 'quota_zero'
  | 'unit_mismatch'
  | 'yelp_single_account'
  | 'unknown_account'
  | 'circuit_open';

export interface ApiError {
  code: ErrorCode;
  message: string;
  detail?: { reason?: Reason } & Record<string, unknown>;
}

export type ApiEnvelope<T> = { ok: true; data: T } | { ok: false; error: ApiError };

/* ---------------------------------------------------------------- leads ---- */

export type Tier = 'HOT' | 'WARM' | 'COLD';
export type LeadStatus = 'new' | 'scored' | 'contacted' | 'converted' | 'discarded';
export type EmailStatus = 'none' | 'L1' | 'L2' | 'L3' | 'bounced' | 'suppressed';

export interface Lead {
  id: string;
  name: string;
  domain: string | null;
  city: string | null;
  country_code: string;
  niche: string;
  tier: Tier | null;
  /** Null exactly when `is_provisional` is true: probing is still running. */
  final_score: number | null;
  rule_score: number | null;
  ai_score: number | null;
  is_provisional: 0 | 1;
  tier_pinned: 0 | 1;
  status: LeadStatus;
  email: string | null;
  email_status: EmailStatus;
  is_manual_edited: 0 | 1;
  yelp_business_id: string | null;
  source_url: string;
  lawful_basis: string;
  updated_at: number;
}

export interface LeadSignal {
  id: string;
  signal_key: string;
  label: string;
  /** null = never probed; 0 = probed, empty result. The UI must not merge them. */
  value: number | null;
  value_text: string | null;
  collected_at: number;
  expires_at: number | null;
  expired: 0 | 1;
  weight: number;
  contribution: number;
}

export interface ScoreBreakdown {
  lead_id: string;
  rule_score: number | null;
  ai_score: number | null;
  final_score: number | null;
  gate_passed: 0 | 1;
  gate_reason: string;
  coverage_pct: number;
  score_version: number;
  weights_version: number;
  ai_reason: string | null;
  ai_angle: string | null;
  signals: LeadSignal[];
}

export interface ProvenanceEntry {
  field: string;
  source: string;
  src: string;
  captured_at: number;
  locked: 0 | 1;
}

export interface ActivityEntry {
  id: string;
  at: number;
  actor: string;
  action: string;
  detail: string;
}

export interface LeadStats {
  total: number;
  by_tier: { HOT: number; WARM: number; COLD: number; provisional: number };
  new_today: number;
  verified_email: number;
  queue_depth: number;
  oldest_pending_sec: number;
  bd_credits_today: number;
  bd_daily_guard: number;
  mtd_cost_micro: number;
  mtd_budget_micro: number;
  errors_24h: number;
  ai_requests_today: number;
  ai_daily_cap: number;
  gate_threshold: number;
}

export interface LeadFilter {
  tier?: string;
  status?: string;
  city?: string;
  niche?: string;
  min_score?: string;
  has_email?: string;
  q?: string;
  cursor?: string;
}

/* ----------------------------------------------------------------- jobs ---- */

export type JobStatus = 'queued' | 'claimed' | 'running' | 'done' | 'failed' | 'cancelled';
export type HopOutcome = 'ok' | 'empty' | 'failed' | 'skipped' | 'timeout';

export interface Job {
  id: string;
  job_type: string;
  target_type: string;
  payload_summary: string;
  status: JobStatus;
  priority: number;
  attempts: number;
  max_attempts: number;
  hop_count: number;
  claimed_by: string | null;
  provider: string | null;
  adapter: string | null;
  run_after: number;
  created_at: number;
  last_error: ErrorCode | null;
}

export interface HopAttempt {
  hop: number;
  provider: string;
  account_label: string;
  adapter: string;
  /** Never hidden, even when null — the only way to trace a selector heal. */
  pack_version: number | null;
  outcome: HopOutcome;
  http_status: number;
  records_count: number;
  unit_type: 'request' | 'record' | 'page' | 'mb' | null;
  units: number | null;
  cost_micro: number | null;
  latency_ms: number;
  circuit_scope: string | null;
  score_milli: number | null;
}

export interface RejectedCandidate {
  provider: string;
  account_label: string;
  score_milli: number | null;
  filter: string;
  reason: string;
}

export interface JobMeta {
  queue_depth: number;
  oldest_pending_sec: number;
  dead_count: number;
  running: number;
  open_circuits: number;
}

/* ------------------------------------------------------------ providers ---- */

export type ProviderStatus =
  | 'active'
  | 'failed'
  | 'invalid'
  | 'rate_limited'
  | 'exhausted'
  | 'disabled'
  | 'untested';

export interface ProviderAccount {
  id: string;
  provider: string;
  account_label: string;
  quota_limit: number;
  quota_used: number;
  quota_period: 'day' | 'month' | 'total';
  quota_reset_at: number | null;
  quota_expires_at: number | null;
  daily_limit: number | null;
  daily_used: number | null;
  status: ProviderStatus;
  cooldown_until: number | null;
  consecutive_errors: number;
  enabled: 0 | 1;
  priority: number;
}

export interface CapabilityRow {
  target_type: string;
  provider: string;
  cost_micro_per_unit: number;
  unit_type: 'request' | 'record' | 'page' | 'mb' | null;
  quality: number;
  avg_latency_ms: number;
  max_records: number;
  runner: string;
  requires_credential: 0 | 1;
  enabled: 0 | 1;
}

export interface CreditPoint {
  day: string;
  account_label: string;
  unit_type: 'request' | 'record' | 'page' | 'mb';
  units: number;
  credits: number;
}

export interface ProviderPool {
  provider: string;
  account_count: number;
  quota_total: number;
  quota_used: number;
  unit_type: string | null;
  keyless: 0 | 1;
  single_account: 0 | 1;
}

/* ------------------------------------------------------------------ vault -- */

export interface Credential {
  id: string;
  provider: string;
  account_label: string;
  key_name: string;
  /** The only fragment of a key that ever leaves the server. */
  last4: string;
  test_status: 'ok' | 'failed' | 'untested' | 'rate_limited';
  last_tested_at: number | null;
  rotated_at: number | null;
  quota_expires_at: number | null;
  has_credential: 0 | 1;
}

/* ---------------------------------------------------------------- sources -- */

export interface DirectorySource {
  source_key: string;
  display_name: string;
  base_url: string;
  target_type: string;
  adapter: string;
  rate_limit_rpm: number;
  url_template: string | null;
  pagination_mode: string | null;
  pagination_param: string | null;
  max_pages: number | null;
  enabled: 0 | 1;
  health: 'ok' | 'degraded' | 'broken';
  consecutive_failures: number;
  last_ok_at: number | null;
  active_pack_version: number | null;
}

export interface SelectorPack {
  id: string;
  source_key: string;
  version: number;
  status: 'draft' | 'active' | 'rejected' | 'broken';
  field_count: number;
  success_rate: number | null;
  runs: number;
  empty_runs: number;
  generated_by: 'seed' | 'heal' | 'manual' | 'ai';
  heal_reason: string | null;
  sample_ref: string | null;
  approved_by: string | null;
  approved_at: number | null;
  created_at: number;
  selector_preview: { field: string; selector: string }[];
}

export interface ManualSource {
  source_key: string;
  display_name: string;
  block_reason: string;
  why_manual: string;
  manual_url_template: string;
  attribution_html: string | null;
  override_ack: 0 | 1;
  override_reason: string | null;
}

export interface BlockedSource {
  source_key: string;
  display_name: string;
  block_reason: string;
  explanation: string;
}

export interface ImportRun {
  id: string;
  dataset: string;
  release_version: string;
  rows_scanned: number;
  rows_ingested: number;
  rows_merged: number;
  rows_skipped: number;
  min_confidence: number;
  duration_sec: number;
  status: 'done' | 'running' | 'failed';
  started_at: number;
}

/* ------------------------------------------------------------------- email -- */

export interface Campaign {
  id: string;
  name: string;
  esp: 'resend' | 'cold_esp';
  status: 'draft' | 'sending' | 'paused' | 'done';
  warmup_stage: string | null;
  sent: number;
  replies: number;
  bounce_rate: number;
  complaint_rate: number;
  created_at: number;
}

export interface SuppressionEntry {
  id: number;
  email_masked: string;
  reason: 'bounce' | 'complaint' | 'manual' | 'unsubscribe' | 'dsr';
  created_at: number;
}

export interface DsrRequest {
  id: string;
  subject_masked: string;
  kind: 'erase' | 'access' | 'object';
  received_at: number;
  due_at: number;
  status: 'open' | 'done';
}

/* ---------------------------------------------------------------- scoring -- */

export interface WeightRow {
  signal_key: string;
  label: string;
  weight: number;
  weights_version: number;
  updated_at: number;
  sample_size: number;
}

export interface WeightHistoryPoint {
  week_key: string;
  signal_key: string;
  lift: number;
  sample_size: number;
  applied: 0 | 1;
}

export interface AiUsage {
  account_label: string;
  requests: number;
  cost_micro: number;
  share_pct: number;
}

export interface AiUsageSummary {
  daily_cap: number;
  requests_today: number;
  requests_mtd: number;
  by_account: AiUsage[];
}

/* --------------------------------------------------------------- settings -- */

export interface Device {
  id: string;
  device_label: string;
  mode: 'a' | 'b' | 'both';
  current_directive: 'run' | 'pause' | 'drain' | 'revoke';
  status: 'active' | 'stale' | 'revoked';
  last_heartbeat_at: number | null;
  jobs_completed: number;
  captures_committed: number;
  created_at: number;
}

export interface RegisteredDevice {
  id: string;
  device_label: string;
  /** Shown exactly once. The server stores only a SHA-256 hash. */
  token: string;
}

export interface AuditEntry {
  id: number;
  at: number;
  actor_email: string;
  entity_type: 'credential' | 'selector_pack' | 'manual_source' | 'device' | 'provider_account';
  entity_id: string;
  action: string;
  result: 'ok' | 'denied' | 'failed';
  detail: string | null;
}

export interface ErrorLogEntry {
  id: number;
  at: number;
  code: ErrorCode;
  reason: Reason | null;
  job_id: string | null;
  provider: string | null;
  message: string;
}

export interface Me {
  email: string;
  env: string;
  demo: 0 | 1;
}
