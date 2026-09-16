/**
 * The single API boundary.
 *
 * Every network call in this application goes through this file: envelope
 * unwrapping, `credentials: 'include'` for the Cloudflare Access cookie,
 * `Idempotency-Key` generation, and error normalisation all happen here and
 * nowhere else. `fetch(` must not appear anywhere under `src/` except below.
 */

import * as demo from './demo';
import type {
  ActivityEntry, AiUsageSummary, ApiEnvelope, ApiError, AuditEntry, BlockedSource, Campaign,
  CapabilityRow, Credential, CreditPoint, Device, DirectorySource, DsrRequest, ErrorLogEntry,
  ErrorCode, HopAttempt, ImportRun, Job, JobMeta, Lead, LeadFilter, LeadStats, ManualSource, Me,
  ProviderAccount, ProviderPool, ProvenanceEntry, Reason, RejectedCandidate, RegisteredDevice,
  ScoreBreakdown, SelectorPack, SuppressionEntry, WeightHistoryPoint, WeightRow,
} from './types';

const API_BASE = (import.meta.env.VITE_API_BASE ?? '').trim();

/**
 * True when no API origin is configured. The console then reads bundled
 * fixtures and shows a permanent "Demo data" chip, so a reviewer can never
 * mistake demo rows for pipeline output.
 */
export const isDemoMode = API_BASE.length === 0;

export class ApiFailure extends Error {
  readonly code: ErrorCode;
  readonly detail: ({ reason?: Reason } & Record<string, unknown>) | undefined;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'ApiFailure';
    this.code = error.code;
    this.detail = error.detail;
  }
}

type UnauthenticatedHandler = () => void;
let onUnauthenticated: UnauthenticatedHandler | null = null;

/** Registered once by the app shell to swap in the session-expired screen. */
export function setUnauthenticatedHandler(handler: UnauthenticatedHandler): void {
  onUnauthenticated = handler;
}

/** RFC 4122 v4. Idempotent endpoints must reuse the key on retry, never remint it. */
export function newIdempotencyKey(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  return `k_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  idempotencyKey?: string;
  signal?: AbortSignal;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (options.idempotencyKey) headers['Idempotency-Key'] = options.idempotencyKey;

  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    credentials: 'include',
    signal: options.signal,
  });

  let envelope: ApiEnvelope<T>;
  try {
    envelope = (await response.json()) as ApiEnvelope<T>;
  } catch {
    throw new ApiFailure({ code: 'E_INTERNAL', message: 'response was not valid JSON' });
  }

  if (!envelope.ok) {
    if (envelope.error.code === 'E_UNAUTHENTICATED' && onUnauthenticated) onUnauthenticated();
    throw new ApiFailure(envelope.error);
  }
  return envelope.data;
}

/* --------------------------------------------------------------- endpoints -- */

export const api = {
  me: (): Promise<Me> => (isDemoMode ? Promise.resolve(demo.me) : request<Me>('/api/me')),

  leads: {
    stats: (): Promise<LeadStats> => (isDemoMode ? Promise.resolve(demo.leadStats()) : request<LeadStats>('/api/leads/stats')),
    list: (filter: LeadFilter = {}): Promise<{ rows: Lead[]; total: number }> => {
      if (!isDemoMode) {
        const qs = new URLSearchParams(
          Object.entries(filter).filter(([, v]) => v !== undefined && v !== '') as [string, string][],
        ).toString();
        return request<{ rows: Lead[]; total: number }>(`/api/leads${qs ? `?${qs}` : ''}`);
      }
      const rows = demo.leads.filter((lead) => {
        if (filter.tier && lead.tier !== filter.tier) return false;
        if (filter.status && lead.status !== filter.status) return false;
        if (filter.city && lead.city !== filter.city) return false;
        if (filter.niche && lead.niche !== filter.niche) return false;
        if (filter.min_score && (lead.final_score ?? 0) < Number(filter.min_score)) return false;
        if (filter.has_email === '1' && !lead.email) return false;
        if (filter.q) {
          const needle = filter.q.toLowerCase();
          const haystack = `${lead.name} ${lead.domain ?? ''} ${lead.city ?? ''} ${lead.niche}`.toLowerCase();
          if (!haystack.includes(needle)) return false;
        }
        return true;
      });
      return Promise.resolve({ rows, total: rows.length });
    },
    get: (id: string): Promise<Lead> => {
      if (!isDemoMode) return request<Lead>(`/api/leads/${id}`);
      const found = demo.leads.find((lead) => lead.id === id);
      if (!found) return Promise.reject(new ApiFailure({ code: 'E_NOT_FOUND', message: 'lead not found' }));
      return Promise.resolve(found);
    },
    breakdown: (id: string): Promise<ScoreBreakdown> =>
      (isDemoMode ? Promise.resolve({ ...demo.scoreBreakdown, lead_id: id }) : request<ScoreBreakdown>(`/api/scoring/leads/${id}/breakdown`)),
    signals: (id: string): Promise<LeadSignalList> =>
      (isDemoMode ? Promise.resolve({ lead_id: id, coverage_pct: 86, rows: demo.signals }) : request<LeadSignalList>(`/api/leads/${id}/signals`)),
    provenance: (id: string): Promise<ProvenanceEntry[]> =>
      (isDemoMode ? Promise.resolve(demo.provenance) : request<ProvenanceEntry[]>(`/api/leads/${id}/provenance`)),
    activity: (id: string): Promise<ActivityEntry[]> =>
      (isDemoMode ? Promise.resolve(demo.activity) : request<ActivityEntry[]>(`/api/leads/${id}/activity`)),
    patch: (id: string, body: Record<string, unknown>): Promise<Lead> => {
      if (!isDemoMode) return request<Lead>(`/api/leads/${id}`, { method: 'PATCH', body });
      const found = demo.leads.find((lead) => lead.id === id);
      if (!found) return Promise.reject(new ApiFailure({ code: 'E_NOT_FOUND', message: 'lead not found' }));
      return Promise.resolve({ ...found, ...(body as Partial<Lead>), is_manual_edited: 1 });
    },
    enrich: (id: string): Promise<{ job_id: string }> =>
      (isDemoMode ? Promise.resolve({ job_id: 'jb_demo_enrich' }) : request<{ job_id: string }>(`/api/leads/${id}/enrich`, { method: 'POST', idempotencyKey: newIdempotencyKey() })),
    verifyYelp: (id: string): Promise<{ yelp_business_id: string; cached_at: number; rating: number; review_count: number; categories: string[]; business_url: string }> => {
      if (!isDemoMode) return request(`/api/leads/${id}/verify-yelp`, { method: 'POST' });
      const lead = demo.leads.find((row) => row.id === id);
      if (!lead || (lead.rule_score ?? 0) < 55) {
        return Promise.reject(new ApiFailure({ code: 'E_YELP_GATE', message: 'rule score below 55' }));
      }
      return Promise.resolve({
        yelp_business_id: lead.yelp_business_id ?? 'demo-business',
        cached_at: Math.floor(Date.now() / 1000) - 3600,
        rating: 4.4, review_count: 128, categories: ['Dentists', 'Cosmetic Dentists'],
        business_url: 'https://www.yelp.example/biz/demo-business',
      });
    },
    exportCsv: (filter: LeadFilter): Promise<{ url: string; row_count: number }> => {
      if (!isDemoMode) return request('/api/leads/export', { method: 'POST', body: filter, idempotencyKey: newIdempotencyKey() });
      return Promise.resolve({ url: '#', row_count: 8 });
    },
  },

  jobs: {
    meta: (): Promise<JobMeta> => (isDemoMode ? Promise.resolve(demo.jobMeta) : request<JobMeta>('/api/jobs/meta')),
    list: (): Promise<Job[]> => (isDemoMode ? Promise.resolve(demo.jobs) : request<Job[]>('/api/jobs')),
    hops: (id: string): Promise<{ hops: HopAttempt[]; rejected: RejectedCandidate[] }> =>
      (isDemoMode
        ? Promise.resolve({ hops: demo.hops, rejected: demo.rejected })
        : request<{ hops: HopAttempt[]; rejected: RejectedCandidate[] }>(`/api/jobs/${id}/attempts`)),
    retry: (id: string): Promise<{ job_id: string }> =>
      (isDemoMode ? Promise.resolve({ job_id: `${id}_retry` }) : request<{ job_id: string }>(`/api/jobs/${id}/retry`, { method: 'POST', idempotencyKey: newIdempotencyKey() })),
    cancel: (id: string): Promise<{ ok: true }> =>
      (isDemoMode ? Promise.resolve({ ok: true as const }) : request<{ ok: true }>(`/api/jobs/${id}/cancel`, { method: 'POST' })),
    enqueue: (body: { target_type: string; payload: Record<string, unknown> }): Promise<{ job_id: string }> =>
      (isDemoMode ? Promise.resolve({ job_id: 'jb_demo_new' }) : request<{ job_id: string }>('/api/jobs', { method: 'POST', body, idempotencyKey: newIdempotencyKey() })),
  },

  providers: {
    pools: (): Promise<ProviderPool[]> => (isDemoMode ? Promise.resolve(demo.pools) : request<ProviderPool[]>('/api/providers/pools')),
    accounts: (): Promise<ProviderAccount[]> => (isDemoMode ? Promise.resolve(demo.providerAccounts) : request<ProviderAccount[]>('/api/providers/accounts')),
    capability: (): Promise<CapabilityRow[]> => (isDemoMode ? Promise.resolve(demo.capability) : request<CapabilityRow[]>('/api/providers/capability')),
    credits: (): Promise<{ series: CreditPoint[]; by_unit: CreditPoint[] }> =>
      (isDemoMode ? Promise.resolve({ series: demo.credits, by_unit: demo.creditsByUnit }) : request('/api/providers/credits/brightdata')),
    patchAccount: (id: string, body: { enabled?: 0 | 1; priority?: number }): Promise<ProviderAccount> => {
      if (!isDemoMode) return request(`/api/providers/accounts/${id}`, { method: 'PATCH', body });
      const found = demo.providerAccounts.find((row) => row.id === id);
      if (!found) return Promise.reject(new ApiFailure({ code: 'E_NOT_FOUND', message: 'account not found' }));
      return Promise.resolve({ ...found, ...body });
    },
    /** Quota is server-owned: the UI must never offer the field. */
    setQuota: (id: string): Promise<never> => {
      if (!isDemoMode) return Promise.reject(new ApiFailure({ code: 'E_FORBIDDEN', message: 'quota is read-only', detail: { reason: 'counter_readonly' } }));
      void id;
      return Promise.reject(new ApiFailure({ code: 'E_FORBIDDEN', message: 'quota is read-only', detail: { reason: 'counter_readonly' } }));
    },
    createAccount: (body: { provider: string; account_label: string; quota_limit: number; quota_period: string; quota_expires_at?: number | null }): Promise<ProviderAccount> => {
      if (!isDemoMode) return request<ProviderAccount>('/api/providers/accounts', { method: 'POST', body });
      if (body.provider === 'yelp') {
        return Promise.reject(new ApiFailure({ code: 'E_FORBIDDEN', message: 'one Yelp account, forever', detail: { reason: 'yelp_single_account' } }));
      }
      if (!/^[a-z0-9_]+-\d+$/.test(body.account_label)) {
        return Promise.reject(new ApiFailure({ code: 'E_VALIDATION', message: 'bad label', detail: { reason: 'label_format' } }));
      }
      if (body.quota_limit === 0) {
        return Promise.reject(new ApiFailure({ code: 'E_VALIDATION', message: 'quota zero', detail: { reason: 'quota_zero' } }));
      }
      return Promise.resolve({
        id: `pa_new_${Date.now()}`, provider: body.provider, account_label: body.account_label,
        quota_limit: body.quota_limit, quota_used: 0, quota_period: body.quota_period as ProviderAccount['quota_period'],
        quota_reset_at: null, quota_expires_at: body.quota_expires_at ?? null, daily_limit: null, daily_used: null,
        status: 'untested', cooldown_until: null, consecutive_errors: 0, enabled: 1, priority: 3,
      });
    },
    nextLabel: (provider: string): Promise<{ account_label: string; unit_type: string | null }> => {
      if (!isDemoMode) return request(`/api/providers/accounts/next-label?provider=${encodeURIComponent(provider)}`);
      const used = demo.providerAccounts.filter((row) => row.provider === provider).length;
      const unit = provider === 'apify' ? 'USD' : provider === 'zerobounce' ? 'verifications' : null;
      return Promise.resolve({ account_label: `${provider}-${String(used + 1).padStart(2, '0')}`, unit_type: unit });
    },
  },

  vault: {
    credentials: (): Promise<Credential[]> => (isDemoMode ? Promise.resolve(demo.credentials) : request<Credential[]>('/api/vault/credentials')),
    create: (body: { account_label: string; key_name: string; secret: string }): Promise<{ id: string; test_status: Credential['test_status'] }> => {
      if (!isDemoMode) return request('/api/vault/credentials', { method: 'POST', body });
      const account = demo.providerAccounts.find((row) => row.account_label === body.account_label);
      if (!account) {
        return Promise.reject(new ApiFailure({ code: 'E_NOT_FOUND', message: 'unknown account', detail: { reason: 'unknown_account' } }));
      }
      return Promise.resolve({ id: `cr_new_${Date.now()}`, test_status: 'ok' });
    },
    test: (id: string): Promise<{ test_status: Credential['test_status']; message: string }> => {
      if (!isDemoMode) return request(`/api/vault/credentials/${id}/test`, { method: 'POST' });
      const found = demo.credentials.find((row) => row.id === id);
      if (!found) return Promise.reject(new ApiFailure({ code: 'E_NOT_FOUND', message: 'credential not found' }));
      if (found.account_label === 'brightdata-11') {
        return Promise.reject(new ApiFailure({ code: 'E_CREDENTIAL_INVALID', message: 'HTTP 401 from provider' }));
      }
      return Promise.resolve({ test_status: 'ok', message: 'provider accepted the credential' });
    },
    rotate: (id: string, secret: string): Promise<{ vault_epoch: number }> => {
      if (!isDemoMode) return request(`/api/vault/credentials/${id}/rotate`, { method: 'POST', body: { secret } });
      void secret;
      return Promise.resolve({ vault_epoch: Number(demo.settings.vault_epoch) + 1 });
    },
    remove: (id: string): Promise<{ ok: true }> =>
      (isDemoMode ? Promise.resolve({ ok: true as const }) : request<{ ok: true }>(`/api/vault/credentials/${id}`, { method: 'DELETE' })),
  },

  sources: {
    directories: (): Promise<DirectorySource[]> => (isDemoMode ? Promise.resolve(demo.directories) : request<DirectorySource[]>('/api/sources/directories')),
    packs: (sourceKey?: string): Promise<SelectorPack[]> => {
      if (!isDemoMode) return request<SelectorPack[]>(`/api/sources/directories/${sourceKey ?? ''}/selector-packs`);
      const rows = sourceKey ? demo.selectorPacks.filter((row) => row.source_key === sourceKey) : demo.selectorPacks;
      return Promise.resolve(rows);
    },
    manual: (): Promise<ManualSource[]> => (isDemoMode ? Promise.resolve(demo.manualSources) : request<ManualSource[]>('/api/sources/manual')),
    blocked: (): Promise<BlockedSource[]> => (isDemoMode ? Promise.resolve(demo.blockedSources) : request<BlockedSource[]>('/api/sources/blocked')),
    imports: (): Promise<ImportRun[]> => (isDemoMode ? Promise.resolve(demo.imports) : request<ImportRun[]>('/api/sources/imports')),
    heal: (sourceKey: string, packId: string): Promise<{ ok: boolean; records_ok: number; fill_pct: number; draft_pack_id: string | null; message: string }> => {
      if (!isDemoMode) return request(`/api/sources/directories/${sourceKey}/heal`, { method: 'POST', body: { pack_id: packId } });
      if (sourceKey === 'brownbook') {
        return Promise.resolve({ ok: false, records_ok: 2, fill_pct: 41, draft_pack_id: null, message: 'dry-run needed ≥5 valid records and ≥80% fill; draft not created' });
      }
      return Promise.resolve({ ok: true, records_ok: 7, fill_pct: 92, draft_pack_id: `sp_draft_${Date.now()}`, message: 'dry-run passed; draft pack created and awaiting approval' });
    },
    approvePack: (packId: string): Promise<{ ok: true }> =>
      (isDemoMode ? Promise.resolve({ ok: true as const }) : request<{ ok: true }>(`/api/sources/selector-packs/${packId}/approve`, { method: 'POST' })),
    rejectPack: (packId: string): Promise<{ ok: true }> =>
      (isDemoMode ? Promise.resolve({ ok: true as const }) : request<{ ok: true }>(`/api/sources/selector-packs/${packId}/reject`, { method: 'POST' })),
    override: (sourceKey: string, reason: string): Promise<{ ok: true; audit_id: number; note: string }> => {
      if (sourceKey === 'yelp') {
        return Promise.reject(new ApiFailure({ code: 'E_COMPLIANCE_BLOCK', message: 'hard blocked', detail: { reason: 'class_x' } }));
      }
      if (!isDemoMode) return request(`/api/sources/manual/${sourceKey}/override`, { method: 'POST', body: { reason } });
      return Promise.resolve({ ok: true as const, audit_id: 92, note: 'override recorded; capture starts after ADR-035' });
    },
    patchDirectory: (sourceKey: string, body: Record<string, unknown>): Promise<DirectorySource> => {
      if (!isDemoMode) return request<DirectorySource>(`/api/sources/directories/${sourceKey}`, { method: 'PATCH', body });
      const found = demo.directories.find((row) => row.source_key === sourceKey);
      if (!found) return Promise.reject(new ApiFailure({ code: 'E_NOT_FOUND', message: 'source not found' }));
      if ('selector_json' in body || 'pack_version' in body) {
        return Promise.reject(new ApiFailure({ code: 'E_VALIDATION', message: 'selectors are not transport', detail: { reason: 'pack_immutable' } }));
      }
      return Promise.resolve({ ...found, ...(body as Partial<DirectorySource>) });
    },
    startImport: (body: { dataset: string; geo: string; min_confidence: number; dry_run: boolean }): Promise<{ import_id: string; dry_run: boolean }> => {
      if (!isDemoMode) return request('/api/sources/imports', { method: 'POST', body, idempotencyKey: newIdempotencyKey() });
      return Promise.resolve({ import_id: `im_demo_${Date.now()}`, dry_run: body.dry_run });
    },
    health: (): Promise<{ day: string; source_key: string; block_rate: number; avg_latency_ms: number }[]> =>
      (isDemoMode
        ? Promise.resolve([
            { day: '2026-09-14', source_key: 'yellowpages', block_rate: 0.4, avg_latency_ms: 2_180 },
            { day: '2026-09-14', source_key: 'hotfrog', block_rate: 6.2, avg_latency_ms: 3_640 },
            { day: '2026-09-14', source_key: 'brownbook', block_rate: 38.5, avg_latency_ms: 4_120 },
          ])
        : request('/api/sources/health')),
  },

  scoring: {
    weights: (): Promise<WeightRow[]> => (isDemoMode ? Promise.resolve(demo.weights) : request<WeightRow[]>('/api/scoring/weights')),
    history: (): Promise<WeightHistoryPoint[]> => (isDemoMode ? Promise.resolve(demo.weightHistory) : request<WeightHistoryPoint[]>('/api/scoring/history')),
    aiUsage: (): Promise<AiUsageSummary> => (isDemoMode ? Promise.resolve(demo.aiUsage) : request<AiUsageSummary>('/api/scoring/ai-usage')),
    newVersion: (weightsPayload: { signal_key: string; weight: number }[]): Promise<{ weights_version: number }> => {
      const bad = weightsPayload.find((row) => row.weight < 0.5 || row.weight > 1.5);
      if (bad) {
        return Promise.reject(new ApiFailure({ code: 'E_VALIDATION', message: 'weight out of range', detail: { reason: 'weight_range', signal_key: bad.signal_key } }));
      }
      if (!isDemoMode) return request('/api/scoring/weights', { method: 'POST', body: { weights: weightsPayload } });
      return Promise.resolve({ weights_version: 5 });
    },
    rescore: (filter: Record<string, unknown>): Promise<{ job_id: string; leads_queued: number }> => {
      if (!isDemoMode) return request('/api/scoring/rescore', { method: 'POST', body: filter, idempotencyKey: newIdempotencyKey() });
      return Promise.resolve({ job_id: 'jb_demo_rescore', leads_queued: 412 });
    },
  },

  email: {
    campaigns: (): Promise<Campaign[]> => (isDemoMode ? Promise.resolve(demo.campaigns) : request<Campaign[]>('/api/email/campaigns')),
    suppression: (): Promise<SuppressionEntry[]> => (isDemoMode ? Promise.resolve(demo.suppression) : request<SuppressionEntry[]>('/api/email/suppression')),
    addSuppression: (email: string, reason: SuppressionEntry['reason']): Promise<{ ok: true }> =>
      (isDemoMode ? Promise.resolve({ ok: true as const }) : request<{ ok: true }>('/api/email/suppression', { method: 'POST', body: { email, reason } })),
    dsr: (): Promise<DsrRequest[]> => (isDemoMode ? Promise.resolve(demo.dsr) : request<DsrRequest[]>('/api/email/dsr')),
    /** Cold prospecting is not offered, in any state (ADR-037). */
    sendColdCampaign: (): Promise<never> =>
      Promise.reject(new ApiFailure({ code: 'E_PROVIDER_POLICY', message: 'cold email is not permitted on Resend', detail: { reason: 'cold_email' } })),
  },

  settings: {
    devices: (): Promise<Device[]> => (isDemoMode ? Promise.resolve(demo.devices) : request<Device[]>('/api/devices')),
    registerDevice: (deviceLabel: string): Promise<RegisteredDevice> => {
      if (!isDemoMode) return request<RegisteredDevice>('/api/devices', { method: 'POST', body: { device_label: deviceLabel } });
      const bytes = new Uint8Array(32);
      globalThis.crypto.getRandomValues(bytes);
      const token = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
      return Promise.resolve({ id: `dev_${Date.now()}`, device_label: deviceLabel, token });
    },
    setDirective: (id: string, directive: Device['current_directive']): Promise<{ ok: true }> =>
      (isDemoMode ? Promise.resolve({ ok: true as const }) : request<{ ok: true }>(`/api/devices/${id}/directive`, { method: 'POST', body: { directive } })),
    revokeDevice: (id: string): Promise<{ ok: true }> =>
      (isDemoMode ? Promise.resolve({ ok: true as const }) : request<{ ok: true }>(`/api/devices/${id}`, { method: 'DELETE' })),
    audit: (): Promise<AuditEntry[]> => (isDemoMode ? Promise.resolve(demo.audit) : request<AuditEntry[]>('/api/audit')),
    errors: (since?: number): Promise<ErrorLogEntry[]> =>
      (isDemoMode ? Promise.resolve(demo.errorLog) : request<ErrorLogEntry[]>(`/api/admin/errors${since ? `?since=${since}` : ''}`)),
    get: (): Promise<Record<string, string | number | boolean>> =>
      (isDemoMode ? Promise.resolve(demo.settings) : request<Record<string, string | number | boolean>>('/api/settings')),
    routerWeights: (): Promise<Record<string, number>> =>
      (isDemoMode ? Promise.resolve(demo.routerWeights) : request<Record<string, number>>('/api/settings/router-weights')),
    patchSetting: (key: string, value: string | number | boolean): Promise<{ ok: true }> => {
      if (key === 'cache_epoch' || key === 'vault_epoch') {
        return Promise.reject(new ApiFailure({ code: 'E_FORBIDDEN', message: 'system-managed setting', detail: { reason: 'setting_locked' } }));
      }
      if (key === 'router_weights_json' || key === 'gate_threshold') {
        return Promise.reject(new ApiFailure({ code: 'E_FORBIDDEN', message: 'this setting needs an ADR', detail: { reason: 'adr_required' } }));
      }
      if (!isDemoMode) return request<{ ok: true }>(`/api/settings/${key}`, { method: 'PATCH', body: { value } });
      return Promise.resolve({ ok: true as const });
    },
    geoTargets: (): Promise<{ id: string; label: string; country_code: string; niche_count: number; enabled: 0 | 1 }[]> =>
      (isDemoMode ? Promise.resolve(demo.geoTargets) : request('/api/settings/geo-targets')),
    niches: (): Promise<string[]> => (isDemoMode ? Promise.resolve(demo.niches) : request<string[]>('/api/settings/niches')),
    backfill: (): Promise<{ backup_id: string; started_at: number }> =>
      (isDemoMode ? Promise.resolve({ backup_id: 'bk_demo_01', started_at: Math.floor(Date.now() / 1000) }) : request('/api/admin/backup', { method: 'POST' })),
  },
};

/** Signals arrive wrapped with the coverage number the UI displays above them. */
export interface LeadSignalList {
  lead_id: string;
  coverage_pct: number;
  rows: ScoreBreakdown['signals'];
}
