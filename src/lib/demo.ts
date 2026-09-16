/**
 * Demo fixtures.
 *
 * Used ONLY when `VITE_API_BASE` is unset, so the console can be reviewed before
 * the Worker exists. Every business name here is a canonical fictitious sample
 * name and every domain sits under the RFC 2606 reserved `example.com`, so no
 * record can be mistaken for a real company or a real contact. The UI shows a
 * permanent "Demo data" chip whenever this module is the active source.
 */

import type {
  ActivityEntry,
  AiUsageSummary,
  AuditEntry,
  BlockedSource,
  Campaign,
  CapabilityRow,
  Credential,
  CreditPoint,
  Device,
  DirectorySource,
  DsrRequest,
  ErrorLogEntry,
  HopAttempt,
  ImportRun,
  Job,
  JobMeta,
  Lead,
  LeadSignal,
  LeadStats,
  ManualSource,
  Me,
  ProviderAccount,
  ProviderPool,
  ProvenanceEntry,
  RejectedCandidate,
  ScoreBreakdown,
  SelectorPack,
  SuppressionEntry,
  WeightHistoryPoint,
  WeightRow,
} from './types';

// Live clock: relative timestamps ("19m ago") must read correctly, otherwise a
// reviewer sees every event dated weeks in the past and cannot judge recency.
const NOW = Math.floor(Date.now() / 1000);
const H = 3600;
const D = 86_400;

export const me: Me = { email: 'operator@jepy.test', env: 'demo', demo: 1 };

/* ------------------------------------------------------------------ leads -- */

export const leads: Lead[] = [
  {
    id: 'ld_01H8X2K4', name: 'Contoso Dental', domain: 'contoso-dental.example.com', city: 'Manchester',
    country_code: 'GB', niche: 'dental', tier: 'HOT', final_score: 86, rule_score: 92, ai_score: 78,
    is_provisional: 0, tier_pinned: 0, status: 'scored', email: 'info@contoso-dental.example.com',
    email_status: 'L3', is_manual_edited: 0, yelp_business_id: 'contoso-dental-manchester',
    source_url: 'https://overturemaps.org/release/2026-08-19', lawful_basis: 'legitimate_interest',
    updated_at: NOW - 40 * 60,
  },
  {
    id: 'ld_01H8X2K5', name: 'Northwind HVAC', domain: null, city: 'Leeds', country_code: 'GB',
    niche: 'hvac', tier: 'HOT', final_score: 91, rule_score: 95, ai_score: 85, is_provisional: 0,
    tier_pinned: 0, status: 'new', email: null, email_status: 'none', is_manual_edited: 0,
    yelp_business_id: null, source_url: 'https://overturemaps.org/release/2026-08-19',
    lawful_basis: 'legitimate_interest', updated_at: NOW - 2 * H,
  },
  {
    id: 'ld_01H8X2K6', name: 'Fabrikam Legal', domain: 'fabrikam-legal.example.com', city: 'Bristol',
    country_code: 'GB', niche: 'legal', tier: 'WARM', final_score: 61, rule_score: 58, ai_score: 66,
    is_provisional: 0, tier_pinned: 0, status: 'scored', email: 'hello@fabrikam-legal.example.com',
    email_status: 'L2', is_manual_edited: 0, yelp_business_id: null,
    source_url: 'https://location.foursquare.com/places', lawful_basis: 'legitimate_interest',
    updated_at: NOW - 5 * H,
  },
  {
    id: 'ld_01H8X2K7', name: 'Adventure Works Plumbing', domain: 'adventureworks-plumb.example.com',
    city: 'Dublin', country_code: 'IE', niche: 'plumbing', tier: 'WARM', final_score: 54,
    rule_score: 47, ai_score: 64, is_provisional: 0, tier_pinned: 1, status: 'contacted', email: null,
    email_status: 'none', is_manual_edited: 1, yelp_business_id: null,
    source_url: 'https://overturemaps.org/release/2026-08-19', lawful_basis: 'legitimate_interest',
    updated_at: NOW - 9 * H,
  },
  {
    id: 'ld_01H8X2K8', name: 'Tailspin Toys', domain: 'tailspin-toys.example.com', city: 'Cork',
    country_code: 'IE', niche: 'retail', tier: 'COLD', final_score: 22, rule_score: 18, ai_score: 28,
    is_provisional: 0, tier_pinned: 0, status: 'discarded', email: null, email_status: 'none',
    is_manual_edited: 0, yelp_business_id: null, source_url: 'https://overturemaps.org/release/2026-08-19',
    lawful_basis: 'legitimate_interest', updated_at: NOW - 26 * H,
  },
  {
    id: 'ld_01H8X2K9', name: 'Litware Salon', domain: null, city: 'Glasgow', country_code: 'GB',
    niche: 'beauty', tier: null, final_score: null, rule_score: 71, ai_score: null, is_provisional: 1,
    tier_pinned: 0, status: 'new', email: null, email_status: 'none', is_manual_edited: 0,
    yelp_business_id: null, source_url: 'https://location.foursquare.com/places',
    lawful_basis: 'legitimate_interest', updated_at: NOW - 12 * 60,
  },
  {
    id: 'ld_01H8X2KA', name: 'Proseware Roofing', domain: 'proseware-roof.example.com', city: 'Birmingham',
    country_code: 'GB', niche: 'roofing', tier: 'HOT', final_score: 78, rule_score: 81, ai_score: 74,
    is_provisional: 0, tier_pinned: 0, status: 'scored', email: 'contact@proseware-roof.example.com',
    email_status: 'L3', is_manual_edited: 0, yelp_business_id: null,
    source_url: 'https://overturemaps.org/release/2026-08-19', lawful_basis: 'legitimate_interest',
    updated_at: NOW - 3 * H,
  },
  {
    id: 'ld_01H8X2KB', name: 'Fourth Coffee', domain: 'fourth-coffee.example.com', city: 'Lyon',
    country_code: 'FR', niche: 'hospitality', tier: 'WARM', final_score: 44, rule_score: 41, ai_score: 48,
    is_provisional: 0, tier_pinned: 0, status: 'scored', email: null, email_status: 'L1',
    is_manual_edited: 0, yelp_business_id: null, source_url: 'https://location.foursquare.com/places',
    lawful_basis: 'legitimate_interest', updated_at: NOW - 20 * H,
  },
];

export function leadStats(): LeadStats {
  return {
    total: 12_480,
    by_tier: { HOT: 1_240, WARM: 4_980, COLD: 5_910, provisional: 350 },
    new_today: 412,
    verified_email: 1_186,
    queue_depth: 268,
    oldest_pending_sec: 1_140,
    bd_credits_today: 1_284,
    bd_daily_guard: 1800,
    mtd_cost_micro: 58_400_000,
    mtd_budget_micro: 70_000_000,
    errors_24h: 17,
    ai_requests_today: 138,
    ai_daily_cap: 200,
    gate_threshold: 55,
  };
}

export const signals: LeadSignal[] = [
  { id: 'sg_1', signal_key: 'no_website', label: 'No website at all', value: 1, value_text: null, collected_at: NOW - 4 * H, expires_at: null, expired: 0, weight: 1.42, contribution: 26 },
  { id: 'sg_2', signal_key: 'psi_performance', label: 'PageSpeed performance', value: 31, value_text: null, collected_at: NOW - 4 * H, expires_at: NOW + 26 * D, expired: 0, weight: 1.18, contribution: 19 },
  { id: 'sg_3', signal_key: 'ssl_valid', label: 'SSL certificate valid', value: 0, value_text: 'expired 2026-06-11', collected_at: NOW - 4 * H, expires_at: NOW + 26 * D, expired: 0, weight: 1.05, contribution: 14 },
  { id: 'sg_4', signal_key: 'wayback_freshness', label: 'Last site update', value: 640, value_text: '21 months', collected_at: NOW - 4 * H, expires_at: null, expired: 0, weight: 0.92, contribution: 11 },
  { id: 'sg_5', signal_key: 'job_posting', label: 'Hiring now', value: 1, value_text: '3 openings', collected_at: NOW - 26 * H, expires_at: NOW - 2 * H, expired: 1, weight: 0.74, contribution: 0 },
  { id: 'sg_6', signal_key: 'meta_ad_active', label: 'Running Meta ads', value: null, value_text: null, collected_at: NOW - 4 * H, expires_at: null, expired: 0, weight: 1.10, contribution: 0 },
  { id: 'sg_7', signal_key: 'nap_mismatch', label: 'NAP mismatch', value: 0, value_text: null, collected_at: NOW - 4 * H, expires_at: null, expired: 0, weight: 0.68, contribution: 0 },
];

export const scoreBreakdown: ScoreBreakdown = {
  lead_id: 'ld_01H8X2K4', rule_score: 92, ai_score: 78, final_score: 86, gate_passed: 1,
  gate_reason: 'rule_score 92 ≥ gate 55', coverage_pct: 86, score_version: 7, weights_version: 4,
  ai_reason: 'No website plus an expired certificate and a 21-month-old site: the operator is paying for hosting that no longer converts.',
  ai_angle: 'Lead with a same-week fix offer; reference their current certificate expiry date.',
  signals,
};

export const provenance: ProvenanceEntry[] = [
  { field: 'name', source: 'overture', src: 'places/name', captured_at: NOW - 4 * H, locked: 0 },
  { field: 'domain', source: 'manual_capture', src: 'sources/directories/yellowpages', captured_at: NOW - 3 * H, locked: 0 },
  { field: 'city', source: 'overture', src: 'places/addresses[0].locality', captured_at: NOW - 4 * H, locked: 0 },
  { field: 'email', source: 'pattern_guess', src: 'guessed:info@domain', captured_at: NOW - 4 * H, locked: 0 },
  { field: 'niche', source: 'manual', src: 'operator', captured_at: NOW - 30 * H, locked: 1 },
];

export const activity: ActivityEntry[] = [
  { id: 'ac_1', at: NOW - 40 * 60, actor: 'dispatcher', action: 'scored', detail: 'Pass 1 complete · final 86 · HOT' },
  { id: 'ac_2', at: NOW - 3 * H, actor: 'dispatcher', action: 'enriched', detail: 'domain + email pattern from directory capture' },
  { id: 'ac_3', at: NOW - 4 * H, actor: 'dispatcher', action: 'verified', detail: 'ZeroBounce L3 · valid' },
  { id: 'ac_4', at: NOW - 4 * H, actor: 'dispatcher', action: 'probed', detail: 'PSI 31 · SSL expired · wayback 21mo' },
  { id: 'ac_5', at: NOW - 30 * H, actor: 'operator@jepy.test', action: 'edited', detail: 'niche set manually (locked)' },
  { id: 'ac_6', at: NOW - 4 * D, actor: 'importer', action: 'imported', detail: 'overture 2026-08-19 · confidence 0.72' },
];

/* ------------------------------------------------------------------- jobs -- */

export const jobs: Job[] = [
  { id: 'jb_7f31c9', job_type: 'adapter_run', target_type: 'directory_html', payload_summary: 'yellowpages · HVAC · GB · page 3', status: 'running', priority: 2, attempts: 1, max_attempts: 3, hop_count: 1, claimed_by: 'gha-runner-02', provider: 'gha_runner', adapter: 'directory_html', run_after: NOW - 60, created_at: NOW - 300, last_error: null },
  { id: 'jb_7f31ca', job_type: 'probe', target_type: 'tech_probe', payload_summary: 'psi · adventureworks-plumb.example.com', status: 'claimed', priority: 3, attempts: 1, max_attempts: 3, hop_count: 0, claimed_by: 'worker-a', provider: 'google_psi', adapter: 'tech_probe', run_after: NOW - 30, created_at: NOW - 240, last_error: null },
  { id: 'jb_7f31cb', job_type: 'adapter_run', target_type: 'serp_query', payload_summary: 'serp · "emergency plumber dublin"', status: 'queued', priority: 4, attempts: 0, max_attempts: 3, hop_count: 0, claimed_by: null, provider: null, adapter: 'serp_query', run_after: NOW + 120, created_at: NOW - 180, last_error: null },
  { id: 'jb_7f31cc', job_type: 'verify_email', target_type: 'email_l3', payload_summary: 'zerobounce bulk · 20 HOT leads', status: 'done', priority: 2, attempts: 1, max_attempts: 3, hop_count: 1, claimed_by: 'worker-a', provider: 'zerobounce', adapter: 'api_json', run_after: NOW - 900, created_at: NOW - 1200, last_error: null },
  { id: 'jb_7f31cd', job_type: 'adapter_run', target_type: 'profile_page', payload_summary: 'instagram · litware-salon', status: 'failed', priority: 5, attempts: 3, max_attempts: 3, hop_count: 3, claimed_by: 'apify-04', provider: 'apify', adapter: 'profile_page', run_after: NOW - 1800, created_at: NOW - 7200, last_error: 'E_PROVIDER_ERROR' },
  { id: 'jb_7f31ce', job_type: 'adapter_run', target_type: 'api_json', payload_summary: 'meta ad library · GB · dental', status: 'done', priority: 4, attempts: 1, max_attempts: 3, hop_count: 1, claimed_by: 'worker-b', provider: 'brightdata', adapter: 'serp_query', run_after: NOW - 600, created_at: NOW - 800, last_error: null },
  { id: 'jb_7f31cf', job_type: 'adapter_run', target_type: 'directory_html', payload_summary: 'hotfrog · roofing · GB · page 1', status: 'queued', priority: 6, attempts: 0, max_attempts: 3, hop_count: 0, claimed_by: null, provider: null, adapter: 'directory_html', run_after: NOW + 300, created_at: NOW - 60, last_error: null },
];

export const jobMeta: JobMeta = {
  queue_depth: 268, oldest_pending_sec: 1_140, dead_count: 9, running: 14, open_circuits: 1,
};

export const hops: HopAttempt[] = [
  { hop: 1, provider: 'gha_runner', account_label: 'gha-runner-02', adapter: 'directory_html', pack_version: 4, outcome: 'empty', http_status: 200, records_count: 0, unit_type: null, units: 0, cost_micro: 0, latency_ms: 2_140, circuit_scope: 'gha_runner:directory_html', score_milli: 940 },
  { hop: 2, provider: 'brightdata', account_label: 'brightdata-03', adapter: 'directory_html', pack_version: 4, outcome: 'ok', http_status: 200, records_count: 18, unit_type: 'request', units: 3, cost_micro: 0, latency_ms: 4_820, circuit_scope: 'brightdata:directory_html', score_milli: 810 },
  { hop: 3, provider: 'brightdata', account_label: 'brightdata-07', adapter: 'serp_query', pack_version: null, outcome: 'skipped', http_status: 0, records_count: 0, unit_type: null, units: null, cost_micro: null, latency_ms: 0, circuit_scope: null, score_milli: 620 },
];

export const rejected: RejectedCandidate[] = [
  { provider: 'apify', account_label: 'apify-04', score_milli: 720, filter: 'circuit_open', reason: 'circuit open after 3 consecutive failures (reopens in 12m)' },
  { provider: 'brightdata', account_label: 'brightdata-11', score_milli: 700, filter: 'credential_status', reason: 'credential invalid — test in Vault' },
  { provider: 'brightdata', account_label: 'brightdata-05', score_milli: 690, filter: 'quota', reason: 'monthly credits exhausted' },
  { provider: 'zerobounce', account_label: 'zerobounce-14', score_milli: 540, filter: 'driver_mismatch', reason: 'no runner for target_type serp_query' },
  { provider: 'yelp', account_label: 'yelp-01', score_milli: null, filter: 'compliance', reason: 'class X — never eligible for automated routing' },
];

/* -------------------------------------------------------------- providers -- */

export const providerAccounts: ProviderAccount[] = [
  { id: 'pa_01', provider: 'brightdata', account_label: 'brightdata-01', quota_limit: 5000, quota_used: 1820, quota_period: 'month', quota_reset_at: NOW + 12 * D, quota_expires_at: null, daily_limit: 1800, daily_used: 402, status: 'active', cooldown_until: null, consecutive_errors: 0, enabled: 1, priority: 1 },
  { id: 'pa_02', provider: 'brightdata', account_label: 'brightdata-02', quota_limit: 5000, quota_used: 2410, quota_period: 'month', quota_reset_at: NOW + 12 * D, quota_expires_at: null, daily_limit: 1800, daily_used: 388, status: 'active', cooldown_until: null, consecutive_errors: 0, enabled: 1, priority: 1 },
  { id: 'pa_03', provider: 'brightdata', account_label: 'brightdata-03', quota_limit: 5000, quota_used: 3_960, quota_period: 'month', quota_reset_at: NOW + 12 * D, quota_expires_at: null, daily_limit: 1800, daily_used: 494, status: 'active', cooldown_until: null, consecutive_errors: 0, enabled: 1, priority: 2 },
  { id: 'pa_04', provider: 'brightdata', account_label: 'brightdata-05', quota_limit: 5000, quota_used: 5_000, quota_period: 'month', quota_reset_at: NOW + 12 * D, quota_expires_at: null, daily_limit: 1800, daily_used: 0, status: 'exhausted', cooldown_until: null, consecutive_errors: 0, enabled: 1, priority: 3 },
  { id: 'pa_05', provider: 'brightdata', account_label: 'brightdata-11', quota_limit: 5000, quota_used: 310, quota_period: 'month', quota_reset_at: NOW + 12 * D, quota_expires_at: null, daily_limit: 1800, daily_used: 0, status: 'invalid', cooldown_until: null, consecutive_errors: 2, enabled: 0, priority: 3 },
  { id: 'pa_06', provider: 'apify', account_label: 'apify-04', quota_limit: 100, quota_used: 62, quota_period: 'month', quota_reset_at: NOW + 12 * D, quota_expires_at: null, daily_limit: null, daily_used: null, status: 'rate_limited', cooldown_until: NOW + 12 * 60, consecutive_errors: 3, enabled: 1, priority: 2 },
  { id: 'pa_07', provider: 'apify', account_label: 'apify-09', quota_limit: 100, quota_used: 18, quota_period: 'month', quota_reset_at: NOW + 12 * D, quota_expires_at: null, daily_limit: null, daily_used: null, status: 'active', cooldown_until: null, consecutive_errors: 0, enabled: 1, priority: 1 },
  { id: 'pa_08', provider: 'zerobounce', account_label: 'zerobounce-03', quota_limit: 100, quota_used: 71, quota_period: 'month', quota_reset_at: NOW + 12 * D, quota_expires_at: null, daily_limit: null, daily_used: null, status: 'active', cooldown_until: null, consecutive_errors: 0, enabled: 1, priority: 1 },
  { id: 'pa_09', provider: 'zerobounce', account_label: 'zerobounce-14', quota_limit: 100, quota_used: 0, quota_period: 'month', quota_reset_at: NOW + 12 * D, quota_expires_at: null, daily_limit: null, daily_used: null, status: 'untested', cooldown_until: null, consecutive_errors: 0, enabled: 1, priority: 2 },
  { id: 'pa_10', provider: 'manifest', account_label: 'manifest-01', quota_limit: 10_000, quota_used: 3_240, quota_period: 'month', quota_reset_at: NOW + 12 * D, quota_expires_at: null, daily_limit: 200, daily_used: 138, status: 'active', cooldown_until: null, consecutive_errors: 0, enabled: 1, priority: 1 },
  { id: 'pa_11', provider: 'yelp', account_label: 'yelp-01', quota_limit: 300, quota_used: 42, quota_period: 'day', quota_reset_at: NOW + 9 * H, quota_expires_at: null, daily_limit: 300, daily_used: 42, status: 'active', cooldown_until: null, consecutive_errors: 0, enabled: 1, priority: 1 },
  { id: 'pa_12', provider: 'mapquest', account_label: 'mapquest-01', quota_limit: 50_000, quota_used: 8_400, quota_period: 'total', quota_reset_at: null, quota_expires_at: NOW + 5 * D, daily_limit: null, daily_used: null, status: 'active', cooldown_until: null, consecutive_errors: 0, enabled: 1, priority: 2 },
];

export const capability: CapabilityRow[] = [
  { target_type: 'directory_html', provider: 'gha_runner', cost_micro_per_unit: 0, unit_type: null, quality: 0.78, avg_latency_ms: 2_300, max_records: 500, runner: 'gha', requires_credential: 0, enabled: 1 },
  { target_type: 'directory_html', provider: 'brightdata', cost_micro_per_unit: 0, unit_type: 'request', quality: 0.93, avg_latency_ms: 4_900, max_records: 200, runner: 'worker', requires_credential: 1, enabled: 1 },
  { target_type: 'serp_query', provider: 'brightdata', cost_micro_per_unit: 0, unit_type: 'request', quality: 0.9, avg_latency_ms: 3_100, max_records: 100, runner: 'worker', requires_credential: 1, enabled: 1 },
  { target_type: 'tech_probe', provider: 'google_psi', cost_micro_per_unit: 0, unit_type: null, quality: 0.88, avg_latency_ms: 6_400, max_records: 1, runner: 'worker', requires_credential: 0, enabled: 1 },
  { target_type: 'tech_probe', provider: 'cloudflare_doh', cost_micro_per_unit: 0, unit_type: null, quality: 0.95, avg_latency_ms: 120, max_records: 1, runner: 'worker', requires_credential: 0, enabled: 1 },
  { target_type: 'profile_page', provider: 'apify', cost_micro_per_unit: 60_000, unit_type: 'record', quality: 0.82, avg_latency_ms: 12_000, max_records: 200, runner: 'worker', requires_credential: 1, enabled: 1 },
  { target_type: 'email_l3', provider: 'zerobounce', cost_micro_per_unit: 0, unit_type: 'request', quality: 0.97, avg_latency_ms: 800, max_records: 20, runner: 'worker', requires_credential: 1, enabled: 1 },
  { target_type: 'verify_yelp', provider: 'yelp', cost_micro_per_unit: 0, unit_type: 'request', quality: 0.94, avg_latency_ms: 700, max_records: 1, runner: 'worker', requires_credential: 1, enabled: 1 },
  { target_type: 'ai_score', provider: 'manifest', cost_micro_per_unit: 2_400, unit_type: 'request', quality: 0.86, avg_latency_ms: 9_200, max_records: 10, runner: 'worker', requires_credential: 1, enabled: 1 },
  { target_type: 'funding_news', provider: 'rss', cost_micro_per_unit: 0, unit_type: null, quality: 0.61, avg_latency_ms: 900, max_records: 300, runner: 'gha', requires_credential: 0, enabled: 1 },
];

export const pools: ProviderPool[] = [
  { provider: 'brightdata', account_count: 10, quota_total: 50_000, quota_used: 18_982, unit_type: 'credits', keyless: 0, single_account: 0 },
  { provider: 'apify', account_count: 20, quota_total: 100, quota_used: 62, unit_type: 'USD', keyless: 0, single_account: 0 },
  { provider: 'zerobounce', account_count: 20, quota_total: 2000, quota_used: 1_186, unit_type: 'verifications', keyless: 0, single_account: 0 },
  { provider: 'resend', account_count: 5, quota_total: 15_000, quota_used: 2_140, unit_type: 'emails', keyless: 0, single_account: 0 },
  { provider: 'manifest', account_count: 1, quota_total: 10_000, quota_used: 3_240, unit_type: 'requests', keyless: 0, single_account: 0 },
  { provider: 'yelp', account_count: 1, quota_total: 300, quota_used: 42, unit_type: 'calls/day', keyless: 0, single_account: 1 },
  { provider: 'mapquest', account_count: 1, quota_total: 50_000, quota_used: 8_400, unit_type: 'requests', keyless: 0, single_account: 0 },
  { provider: 'google_psi', account_count: 0, quota_total: 25_000, quota_used: 6_120, unit_type: 'requests/day', keyless: 1, single_account: 0 },
  { provider: 'gha_runner', account_count: 0, quota_total: 0, quota_used: 0, unit_type: null, keyless: 1, single_account: 0 },
];

export const credits: CreditPoint[] = Array.from({ length: 14 }, (_, i) => {
  const day = `2026-09-${String(i + 1).padStart(2, '0')}`;
  const wave = [420, 610, 388, 902, 1_240, 1_510, 1_180, 1_640, 1_720, 1_410, 1_284, 980, 1_060, 1_384][i];
  return { day, account_label: 'brightdata-01', unit_type: 'request' as const, units: wave, credits: wave };
});

export const creditsByUnit: CreditPoint[] = [
  { day: '2026-09-14', account_label: 'brightdata-03', unit_type: 'request', units: 494, credits: 494 },
  { day: '2026-09-14', account_label: 'brightdata-03', unit_type: 'record', units: 210, credits: 210 },
  { day: '2026-09-14', account_label: 'brightdata-07', unit_type: 'page', units: 96, credits: 96 },
  { day: '2026-09-14', account_label: 'brightdata-02', unit_type: 'mb', units: 12, credits: 60 },
];

/* ------------------------------------------------------------------ vault -- */

export const credentials: Credential[] = [
  { id: 'cr_01', provider: 'brightdata', account_label: 'brightdata-01', key_name: 'api_token', last4: '9ae5', test_status: 'ok', last_tested_at: NOW - 3 * H, rotated_at: NOW - 11 * D, quota_expires_at: null, has_credential: 1 },
  { id: 'cr_02', provider: 'brightdata', account_label: 'brightdata-02', key_name: 'api_token', last4: '41c7', test_status: 'ok', last_tested_at: NOW - 3 * H, rotated_at: NOW - 24 * D, quota_expires_at: null, has_credential: 1 },
  { id: 'cr_03', provider: 'brightdata', account_label: 'brightdata-03', key_name: 'api_token', last4: 'bd02', test_status: 'ok', last_tested_at: NOW - 3 * H, rotated_at: null, quota_expires_at: null, has_credential: 1 },
  { id: 'cr_04', provider: 'brightdata', account_label: 'brightdata-11', key_name: 'api_token', last4: '7f10', test_status: 'failed', last_tested_at: NOW - 3 * H, rotated_at: null, quota_expires_at: null, has_credential: 1 },
  { id: 'cr_05', provider: 'apify', account_label: 'apify-04', key_name: 'api_token', last4: 'aa31', test_status: 'rate_limited', last_tested_at: NOW - 3 * H, rotated_at: null, quota_expires_at: null, has_credential: 1 },
  { id: 'cr_06', provider: 'apify', account_label: 'apify-09', key_name: 'api_token', last4: '1c88', test_status: 'ok', last_tested_at: NOW - 3 * H, rotated_at: null, quota_expires_at: null, has_credential: 1 },
  { id: 'cr_07', provider: 'zerobounce', account_label: 'zerobounce-03', key_name: 'api_key', last4: '5d90', test_status: 'ok', last_tested_at: NOW - 3 * H, rotated_at: null, quota_expires_at: null, has_credential: 1 },
  { id: 'cr_08', provider: 'zerobounce', account_label: 'zerobounce-14', key_name: 'api_key', last4: '—', test_status: 'untested', last_tested_at: null, rotated_at: null, quota_expires_at: null, has_credential: 0 },
  { id: 'cr_09', provider: 'manifest', account_label: 'manifest-01', key_name: 'api_key', last4: 'e4b2', test_status: 'ok', last_tested_at: NOW - 3 * H, rotated_at: NOW - 6 * D, quota_expires_at: null, has_credential: 1 },
  { id: 'cr_10', provider: 'yelp', account_label: 'yelp-01', key_name: 'api_key', last4: '31ab', test_status: 'ok', last_tested_at: NOW - 3 * H, rotated_at: null, quota_expires_at: null, has_credential: 1 },
  { id: 'cr_11', provider: 'mapquest', account_label: 'mapquest-01', key_name: 'api_key', last4: '77cd', test_status: 'ok', last_tested_at: NOW - 3 * H, rotated_at: null, quota_expires_at: NOW + 5 * D, has_credential: 1 },
  { id: 'cr_12', provider: 'resend', account_label: 'resend-01', key_name: 'api_key', last4: '9f4e', test_status: 'ok', last_tested_at: NOW - 3 * H, rotated_at: null, quota_expires_at: null, has_credential: 1 },
];

export const audit: AuditEntry[] = [
  { id: 91, at: NOW - 42 * 60, actor_email: 'operator@jepy.test', entity_type: 'credential', entity_id: 'brightdata-01', action: 'test', result: 'ok', detail: 'test_status ok' },
  { id: 90, at: NOW - 3 * H, actor_email: 'scheduler@jepy.test', entity_type: 'credential', entity_id: 'brightdata-11', action: 'test', result: 'failed', detail: 'HTTP 401 from provider' },
  { id: 89, at: NOW - 6 * H, actor_email: 'operator@jepy.test', entity_type: 'selector_pack', entity_id: 'hotfrog:v4', action: 'approve', result: 'ok', detail: 'activated after 5 OK samples / 92% fill' },
  { id: 88, at: NOW - 26 * H, actor_email: 'operator@jepy.test', entity_type: 'manual_source', entity_id: 'bbb', action: 'capture_override', result: 'ok', detail: 'audit only - Mode B gated (ADR-035)' },
  { id: 87, at: NOW - 30 * H, actor_email: 'operator@jepy.test', entity_type: 'provider_account', entity_id: 'apify-21', action: 'account_create', result: 'ok', detail: 'quota 100/mo, auto-recharge off' },
  { id: 86, at: NOW - 2 * D, actor_email: 'operator@jepy.test', entity_type: 'device', entity_id: 'dev_chrome_01', action: 'revoke', result: 'ok', detail: 'token rotated out' },
];

/* ---------------------------------------------------------------- sources -- */

export const directories: DirectorySource[] = [
  { source_key: 'yellowpages', display_name: 'YellowPages', base_url: 'https://www.yellowpages.example', target_type: 'directory_html', adapter: 'directory_html', rate_limit_rpm: 12, url_template: 'https://www.yellowpages.example/search?search_terms={niche}&geo_location_terms={city}&page={page}', pagination_mode: 'page', pagination_param: 'page', max_pages: 10, enabled: 1, health: 'ok', consecutive_failures: 0, last_ok_at: NOW - 42 * 60, active_pack_version: 4 },
  { source_key: 'superpages', display_name: 'Superpages', base_url: 'https://www.superpages.example', target_type: 'directory_html', adapter: 'directory_html', rate_limit_rpm: 10, url_template: 'https://www.superpages.example/search?q={niche}&geo={city}&page={page}', pagination_mode: 'page', pagination_param: 'page', max_pages: 8, enabled: 1, health: 'ok', consecutive_failures: 0, last_ok_at: NOW - 2 * H, active_pack_version: 2 },
  { source_key: 'hotfrog', display_name: 'Hotfrog', base_url: 'https://www.hotfrog.example', target_type: 'directory_html', adapter: 'directory_html', rate_limit_rpm: 8, url_template: 'https://www.hotfrog.example/uk/search/{city}/{niche}', pagination_mode: 'path', pagination_param: null, max_pages: 6, enabled: 1, health: 'degraded', consecutive_failures: 2, last_ok_at: NOW - 6 * H, active_pack_version: 4 },
  { source_key: 'manta', display_name: 'Manta', base_url: 'https://www.manta.example', target_type: 'directory_html', adapter: 'directory_html', rate_limit_rpm: 6, url_template: 'https://www.manta.example/search/{niche}/{city}', pagination_mode: 'page', pagination_param: 'p', max_pages: 5, enabled: 1, health: 'ok', consecutive_failures: 0, last_ok_at: NOW - 9 * H, active_pack_version: 1 },
  { source_key: 'brownbook', display_name: 'Brownbook', base_url: 'https://www.brownbook.example', target_type: 'directory_html', adapter: 'directory_html', rate_limit_rpm: 6, url_template: 'https://www.brownbook.example/uk/{city}/{niche}', pagination_mode: 'none', pagination_param: null, max_pages: 1, enabled: 1, health: 'broken', consecutive_failures: 4, last_ok_at: NOW - 2 * D, active_pack_version: 3 },
  { source_key: 'clutch', display_name: 'Clutch', base_url: 'https://www.clutch.example', target_type: 'directory_html', adapter: 'directory_html', rate_limit_rpm: 8, url_template: 'https://www.clutch.example/{niche}/{city}', pagination_mode: 'page', pagination_param: 'page', max_pages: 6, enabled: 1, health: 'ok', consecutive_failures: 0, last_ok_at: NOW - 4 * H, active_pack_version: 2 },
  { source_key: 'thomasnet', display_name: 'ThomasNet', base_url: 'https://www.thomasnet.example', target_type: 'directory_html', adapter: 'directory_html', rate_limit_rpm: 6, url_template: 'https://www.thomasnet.example/search?q={niche}', pagination_mode: 'page', pagination_param: 'page', max_pages: 6, enabled: 0, health: 'ok', consecutive_failures: 0, last_ok_at: NOW - 5 * D, active_pack_version: 1 },
  { source_key: 'showmelocal', display_name: 'ShowMeLocal', base_url: 'https://www.showmelocal.example', target_type: 'directory_html', adapter: 'directory_html', rate_limit_rpm: 6, url_template: 'https://www.showmelocal.example/search?q={niche}&l={city}', pagination_mode: 'page', pagination_param: 'page', max_pages: 5, enabled: 1, health: 'ok', consecutive_failures: 0, last_ok_at: NOW - 11 * H, active_pack_version: 1 },
];

export const selectorPacks: SelectorPack[] = [
  {
    id: 'sp_1401', source_key: 'hotfrog', version: 4, status: 'active', field_count: 7, success_rate: 0.92,
    runs: 41, empty_runs: 0, generated_by: 'heal', heal_reason: 'business_name selector returned 0 rows for 3 runs',
    sample_ref: 'html_samples/hotfrog-2026-09-13-a41f.html', approved_by: 'operator@jepy.test',
    approved_at: NOW - 6 * H, created_at: NOW - 8 * H,
    selector_preview: [
      { field: 'business_name', selector: 'div.listing-card > h2' },
      { field: 'phone', selector: 'a[href^="tel:"]' },
      { field: 'address', selector: '.listing-card__address' },
      { field: 'city', selector: '.listing-card__address span.locality' },
    ],
  },
  {
    id: 'sp_1400', source_key: 'hotfrog', version: 3, status: 'broken', field_count: 7, success_rate: 0.18,
    runs: 3, empty_runs: 3, generated_by: 'seed', heal_reason: null, sample_ref: null, approved_by: null,
    approved_at: null, created_at: NOW - 40 * D,
    selector_preview: [{ field: 'business_name', selector: 'div.result > h2' }],
  },
  {
    id: 'sp_1512', source_key: 'yellowpages', version: 4, status: 'active', field_count: 9, success_rate: 0.96,
    runs: 188, empty_runs: 1, generated_by: 'seed', heal_reason: null, sample_ref: null,
    approved_by: 'operator@jepy.test', approved_at: NOW - 20 * D, created_at: NOW - 20 * D,
    selector_preview: [
      { field: 'business_name', selector: 'div.search-results a.business-name' },
      { field: 'website', selector: 'a.track-visit-website' },
      { field: 'phone', selector: 'div.phone' },
    ],
  },
  {
    id: 'sp_1513', source_key: 'yellowpages', version: 5, status: 'draft', field_count: 9, success_rate: null,
    runs: 0, empty_runs: 0, generated_by: 'ai', heal_reason: 'operator requested heal after review',
    sample_ref: 'html_samples/yellowpages-2026-09-15-b92c.html', approved_by: null, approved_at: null,
    created_at: NOW - 5 * H,
    selector_preview: [
      { field: 'business_name', selector: 'div.result > div.info > h2 > a' },
      { field: 'website', selector: 'a[data-analytics="visit-website"]' },
      { field: 'address', selector: 'div.adr' },
    ],
  },
  {
    id: 'sp_1420', source_key: 'brownbook', version: 3, status: 'broken', field_count: 6, success_rate: 0.0,
    runs: 4, empty_runs: 4, generated_by: 'heal', heal_reason: 'page structure changed; 0 of 6 fields filled',
    sample_ref: 'html_samples/brownbook-2026-09-14-c11d.html', approved_by: null, approved_at: null,
    created_at: NOW - 26 * H,
    selector_preview: [{ field: 'business_name', selector: 'h1.company-title' }],
  },
];

export const manualSources: ManualSource[] = [
  { source_key: 'crunchbase', display_name: 'Crunchbase', block_reason: 'tos_no_automation', why_manual: 'Automated access breaches their terms; company research only.', manual_url_template: 'https://www.crunchbase.example/org/{slug}', attribution_html: null, override_ack: 1, override_reason: 'company research for HOT lead 1:1' },
  { source_key: 'bbb', display_name: 'Better Business Bureau', block_reason: 'captcha', why_manual: 'Captcha wall on search; not solvable by policy.', manual_url_template: 'https://www.bbb.example/us/{state}/business/{slug}', attribution_html: null, override_ack: 1, override_reason: 'verify accreditation for a HOT lead' },
  { source_key: 'thumbtack', display_name: 'Thumbtack', block_reason: 'login', why_manual: 'Requires a signed-in account to view pros.', manual_url_template: 'https://www.thumbtack.example/pro/{slug}', attribution_html: null, override_ack: 1, override_reason: 'check service area for roofing niche' },
  { source_key: 'angi', display_name: 'Angi', block_reason: 'login', why_manual: 'Requires a signed-in account to view profiles.', manual_url_template: 'https://www.angi.example/company/{slug}', attribution_html: null, override_ack: 0, override_reason: null },
  { source_key: 'healthgrades', display_name: 'Healthgrades', block_reason: 'tos_no_automation', why_manual: 'Automated scraping prohibited by terms.', manual_url_template: 'https://www.healthgrades.example/dr/{slug}', attribution_html: null, override_ack: 0, override_reason: null },
  { source_key: 'zocdoc', display_name: 'Zocdoc', block_reason: 'tos_no_automation', why_manual: 'Automated scraping prohibited by terms.', manual_url_template: 'https://www.zocdoc.example/doctor/{slug}', attribution_html: null, override_ack: 0, override_reason: null },
  { source_key: 'ada_directory', display_name: 'ADA Directory', block_reason: 'robots_disallow', why_manual: 'robots.txt disallows search paths.', manual_url_template: 'https://www.ada.example/find-a-dentist/{slug}', attribution_html: null, override_ack: 0, override_reason: null },
  { source_key: 'findlaw', display_name: 'FindLaw', block_reason: 'tos_no_automation', why_manual: 'Automated scraping prohibited by terms.', manual_url_template: 'https://www.findlaw.example/lawyer/{slug}', attribution_html: null, override_ack: 0, override_reason: null },
];

export const blockedSources: BlockedSource[] = [
  {
    source_key: 'yelp', display_name: 'Yelp (discovery)', block_reason: 'tos_no_storage',
    explanation: 'Yelp terms forbid storing their content and forbid use in a model prompt. Verification is permitted with exactly one account and a 24-hour cache; discovery is permanently closed and cannot be overridden.',
  },
];

export const imports: ImportRun[] = [
  { id: 'im_0412', dataset: 'overture', release_version: '2026-08-19', rows_scanned: 4_820_000, rows_ingested: 96_400, rows_merged: 18_220, rows_skipped: 4_705_380, min_confidence: 0.6, duration_sec: 1_842, status: 'done', started_at: NOW - 4 * D },
  { id: 'im_0413', dataset: 'foursquare', release_version: '2026Q3', rows_scanned: 2_140_000, rows_ingested: 41_800, rows_merged: 12_640, rows_skipped: 2_085_560, min_confidence: 0.7, duration_sec: 1_104, status: 'done', started_at: NOW - 3 * D },
  { id: 'im_0414', dataset: 'overture', release_version: '2026-09-16', rows_scanned: 0, rows_ingested: 0, rows_merged: 0, rows_skipped: 0, min_confidence: 0.6, duration_sec: 0, status: 'running', started_at: NOW - 900 },
  { id: 'im_0409', dataset: 'state_sos', release_version: '2026-08', rows_scanned: 210_400, rows_ingested: 0, rows_merged: 0, rows_skipped: 0, min_confidence: 0.8, duration_sec: 420, status: 'failed', started_at: NOW - 9 * D },
];

/* ---------------------------------------------------------------- scoring -- */

export const weights: WeightRow[] = [
  { signal_key: 'no_website', label: 'No website at all', weight: 1.42, weights_version: 4, updated_at: NOW - 3 * D, sample_size: 184 },
  { signal_key: 'site_slow', label: 'PageSpeed below 50', weight: 1.18, weights_version: 4, updated_at: NOW - 3 * D, sample_size: 212 },
  { signal_key: 'ssl_broken', label: 'SSL missing or expired', weight: 1.05, weights_version: 4, updated_at: NOW - 3 * D, sample_size: 96 },
  { signal_key: 'stale_site', label: 'No update in 12 months', weight: 0.92, weights_version: 4, updated_at: NOW - 3 * D, sample_size: 168 },
  { signal_key: 'hiring', label: 'Hiring now', weight: 0.74, weights_version: 4, updated_at: NOW - 3 * D, sample_size: 61 },
  { signal_key: 'running_ads', label: 'Running paid ads', weight: 1.10, weights_version: 4, updated_at: NOW - 3 * D, sample_size: 74 },
  { signal_key: 'nap_mismatch', label: 'NAP mismatch', weight: 0.68, weights_version: 4, updated_at: NOW - 3 * D, sample_size: 22 },
  { signal_key: 'no_https_redirect', label: 'No HTTP→HTTPS redirect', weight: 0.81, weights_version: 4, updated_at: NOW - 3 * D, sample_size: 47 },
];

export const weightHistory: WeightHistoryPoint[] = [
  { week_key: '2026-W30', signal_key: 'no_website', lift: 1.31, sample_size: 41, applied: 1 },
  { week_key: '2026-W31', signal_key: 'no_website', lift: 1.44, sample_size: 58, applied: 1 },
  { week_key: '2026-W32', signal_key: 'ssl_broken', lift: 1.62, sample_size: 33, applied: 1 },
  { week_key: '2026-W33', signal_key: 'hiring', lift: 0.71, sample_size: 19, applied: 0 },
  { week_key: '2026-W34', signal_key: 'running_ads', lift: 1.09, sample_size: 52, applied: 1 },
  { week_key: '2026-W35', signal_key: 'nap_mismatch', lift: 1.88, sample_size: 12, applied: 0 },
  { week_key: '2026-W36', signal_key: 'site_slow', lift: 1.16, sample_size: 88, applied: 1 },
];

export const aiUsage: AiUsageSummary = {
  daily_cap: 200,
  requests_today: 138,
  requests_mtd: 3_240,
  by_account: [
    { account_label: 'manifest-01', requests: 138, cost_micro: 331_200, share_pct: 100 },
  ],
};

/* ------------------------------------------------------------------ email -- */

export const campaigns: Campaign[] = [
  { id: 'cp_01', name: 'Transactional digest', esp: 'resend', status: 'sending', warmup_stage: null, sent: 2_140, replies: 51, bounce_rate: 0.8, complaint_rate: 0.02, created_at: NOW - 40 * D },
  { id: 'cp_02', name: 'HOT follow-up (manual, out of band)', esp: 'cold_esp', status: 'paused', warmup_stage: 'week 2 of 3 · 25/day', sent: 0, replies: 0, bounce_rate: 0, complaint_rate: 0, created_at: NOW - 12 * D },
];

export const suppression: SuppressionEntry[] = [
  { id: 501, email_masked: 'i••••@contoso-dental.example.com', reason: 'bounce', created_at: NOW - 2 * D },
  { id: 500, email_masked: 'h••••@fabrikam-legal.example.com', reason: 'unsubscribe', created_at: NOW - 4 * D },
  { id: 499, email_masked: 'c••••@tailspin-toys.example.com', reason: 'complaint', created_at: NOW - 6 * D },
  { id: 498, email_masked: 'o••••@fourth-coffee.example.com', reason: 'dsr', created_at: NOW - 9 * D },
];

export const dsr: DsrRequest[] = [
  { id: 'dsr_01', subject_masked: 'o••••@fourth-coffee.example.com', kind: 'erase', received_at: NOW - 9 * D, due_at: NOW + 21 * D, status: 'done' },
  { id: 'dsr_02', subject_masked: 'm••••@proseware-roof.example.com', kind: 'access', received_at: NOW - 5 * D, due_at: NOW + 25 * D, status: 'open' },
];

/* --------------------------------------------------------------- settings -- */

export const devices: Device[] = [
  { id: 'dev_chrome_01', device_label: 'chrome-operator-macbook', mode: 'a', current_directive: 'run', status: 'active', last_heartbeat_at: NOW - 90, jobs_completed: 412, captures_committed: 0, created_at: NOW - 20 * D },
  { id: 'dev_chrome_02', device_label: 'chrome-operator-desktop', mode: 'both', current_directive: 'pause', status: 'stale', last_heartbeat_at: NOW - 3 * D, jobs_completed: 88, captures_committed: 0, created_at: NOW - 30 * D },
  { id: 'dev_chrome_03', device_label: 'chrome-old-laptop', mode: 'a', current_directive: 'revoke', status: 'revoked', last_heartbeat_at: NOW - 14 * D, jobs_completed: 3, captures_committed: 0, created_at: NOW - 60 * D },
];

export const errorLog: ErrorLogEntry[] = [
  { id: 9021, at: NOW - 18 * 60, code: 'E_PROVIDER_ERROR', reason: null, job_id: 'jb_7f31cd', provider: 'apify', message: 'actor run failed: 500 from provider' },
  { id: 9020, at: NOW - 3 * H, code: 'E_CREDENTIAL_INVALID', reason: null, job_id: null, provider: 'brightdata', message: 'HTTP 401 on account brightdata-11' },
  { id: 9019, at: NOW - 5 * H, code: 'E_COMPLIANCE_BLOCK', reason: 'class_x', job_id: null, provider: 'yelp', message: 'automated routing attempted on a class X source' },
  { id: 9018, at: NOW - 8 * H, code: 'E_NO_CANDIDATE', reason: 'circuit_open', job_id: 'jb_7f3190', provider: null, message: 'no eligible provider after 3 hops' },
  { id: 9017, at: NOW - 14 * H, code: 'E_TIMEOUT', reason: null, job_id: 'jb_7f3188', provider: 'brightdata', message: 'adapter exceeded 30s' },
  { id: 9016, at: NOW - 20 * H, code: 'E_AI_CAP', reason: null, job_id: null, provider: 'manifest', message: 'daily AI cap reached (200)' },
  { id: 9015, at: NOW - 26 * H, code: 'E_VALIDATION', reason: 'pack_mismatch', job_id: 'jb_7f3177', provider: null, message: 'device sent pack_version 3 while active is 4' },
  { id: 9014, at: NOW - 30 * H, code: 'E_FORBIDDEN', reason: 'adr_required', job_id: null, provider: null, message: 'router_weights_json patch rejected' },
  { id: 9013, at: NOW - 2 * D, code: 'E_QUOTA_EXHAUSTED', reason: null, job_id: 'jb_7f3160', provider: 'brightdata', message: 'account brightdata-05 exhausted' },
  { id: 9012, at: NOW - 2 * D, code: 'E_LICENSE_BLOCK', reason: null, job_id: null, provider: null, message: 'export refused: ODbL field without share-alike notice' },
  { id: 9011, at: NOW - 3 * D, code: 'E_TIER_GATE', reason: null, job_id: null, provider: 'zerobounce', message: 'L3 requested for a WARM lead' },
  { id: 9010, at: NOW - 3 * D, code: 'E_INTERNAL', reason: null, job_id: 'jb_7f3140', provider: null, message: 'cursor serialization failed' },
];

export const settings: Record<string, string | number | boolean> = {
  cache_epoch: 12,
  vault_epoch: 4,
  dispatcher_paused: false,
  daily_bd_credit_guard: 1800,
  ai_daily_cap: 200,
  gate_threshold: 55,
  active_weights_version: 4,
  d1_daily_write_ceiling: 500_000,
};

export const routerWeights = {
  cost: 0.32,
  quality: 0.28,
  latency: 0.14,
  health: 0.16,
  quota_abundance: 0.10,
};

export const geoTargets = [
  { id: 'gt_1', label: 'United Kingdom', country_code: 'GB', niche_count: 14, enabled: 1 },
  { id: 'gt_2', label: 'Ireland', country_code: 'IE', niche_count: 9, enabled: 1 },
  { id: 'gt_3', label: 'France', country_code: 'FR', niche_count: 7, enabled: 1 },
];

export const niches = [
  'dental', 'hvac', 'plumbing', 'roofing', 'legal', 'beauty', 'hospitality', 'retail',
  'veterinary', 'landscaping', 'electrician', 'physical therapy', 'accounting', 'auto repair',
];
