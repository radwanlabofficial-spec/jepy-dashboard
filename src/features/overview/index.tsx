/**
 * Overview — Jepy Bold v4 design.
 *
 * Read-only except for the alert links. Opens on the numbers, not a salutation.
 * Every figure maps to a field in the API contract. A null renders as a dash.
 */

import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Clock, Database, RefreshCw, Sparkles, Users, Zap } from 'lucide-react';
import { api } from '../../lib/api';
import { BD_DAILY_GUARD, BD_MONTHLY_PCT_LINE, POLLING } from '../../lib/constants';
import { formatMicro, formatNumber, relativeTime } from '../../lib/format';
import { useQuery } from '../../hooks/useApi';
import type { CreditPoint, DirectorySource, ErrorLogEntry, ImportRun, JobMeta, LeadStats, ProviderAccount } from '../../lib/types';
import LeadStream from './LeadStream';

const errorMessages: Record<string, string> = {
  E_PROVIDER_ERROR: 'provider side failure — retried automatically',
  E_CREDENTIAL_INVALID: 'credential rejected — test it in Vault',
  E_COMPLIANCE_BLOCK: 'compliance block — see reason',
  E_NO_CANDIDATE: 'no eligible provider after 3 hops',
  E_TIMEOUT: 'adapter exceeded its budget',
  E_AI_CAP: 'daily AI scoring cap reached',
  E_VALIDATION: 'invalid payload',
  E_FORBIDDEN: 'refused by policy',
  E_QUOTA_EXHAUSTED: 'account quota exhausted',
  E_LICENSE_BLOCK: 'export refused on licence terms',
  E_TIER_GATE: 'action limited to HOT leads',
  E_INTERNAL: 'unexpected internal failure',
};

import Skeleton from '../../components/common/Skeleton';

function KpiCard({ label, children, hint, accent = 'emerald', index = 0, loading = false, to }: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  accent?: 'emerald' | 'amber' | 'violet' | 'rose';
  index?: number;
  loading?: boolean;
  to?: string;
}) {
  const accents = {
    emerald: 'from-[#10b981] to-[#34d399]',
    amber: 'from-[#f59e0b] to-[#fbbf24]',
    violet: 'from-[#8b5cf6] to-[#a78bfa]',
    rose: 'from-[#f43f5e] to-[#fb7185]',
  };
  const card = (
    <div
      className={`jepy-card jepy-enter relative overflow-hidden p-4 ${to ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
      style={{ animationDelay: `${index * 70}ms` }}
      data-component="kpi-card"
      onClick={to ? () => window.location.href = to : undefined}
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accents[accent]}`} />
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[var(--text-3)]">{label}</p>
      <div className="jepy-kpi mt-2 text-[30px] leading-none text-[var(--text)]">
        {loading ? <Skeleton className="h-[30px] w-24" /> : children}
      </div>
      {hint && !loading ? <p className="mt-2 text-[11px] text-[var(--text-3)]">{hint}</p> : null}
    </div>
  );
}

function BurnChart({ points }: { points: CreditPoint[] }) {
  const max = points.reduce((peak, point) => Math.max(peak, point.credits), 0) || 1;
  const MAX_BAR_PX = 88;
  return (
    <div data-component="burn-chart" className="flex items-end gap-1.5">
      {points.map((point) => {
        const height = Math.max(4, Math.round((point.credits / max) * MAX_BAR_PX));
        const guarded = point.credits >= BD_DAILY_GUARD;
        return (
          <div key={`${point.day}-${point.account_label}-${point.unit_type}`} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              title={`${point.day} · ${formatNumber(point.credits)} credits`}
              className={`w-full rounded-md transition-all duration-300 hover:scale-y-105 ${
                guarded
                  ? 'bg-gradient-to-t from-[#be123c] to-[#fb7185]'
                  : 'bg-gradient-to-t from-[#047857] to-[#34d399]'
              }`}
              style={{ height: `${height}px` }}
            />
            <span className="font-mono text-[10px] text-[var(--text-3)]">{point.day.slice(8)}</span>
          </div>
        );
      })}
    </div>
  );
}

function SectionCard({ title, subtitle, action, children, index = 0 }: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  index?: number;
}) {
  return (
    <section className="jepy-card jepy-enter p-6" style={{ animationDelay: `${index * 80}ms` }}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-bold tracking-tight text-[var(--text)]" style={{ fontFamily: 'var(--disp)' }}>{title}</h2>
          {subtitle ? <p className="mt-0.5 text-[12px] text-[var(--text-3)]">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function OverviewPage() {
  const stats = useQuery<LeadStats>('leads:stats', () => api.leads.stats(), {
    staleTime: 5_000,
    pollMs: POLLING.overview,
  });
  const meta = useQuery<JobMeta>('jobs:meta', () => api.jobs.meta(), { staleTime: 5_000, pollMs: POLLING.overview });
  const credits = useQuery('providers:credits', () => api.providers.credits(), { staleTime: 30_000 });
  const errors = useQuery<ErrorLogEntry[]>('settings:errors', () => api.settings.errors(), { staleTime: 30_000 });
  const imports = useQuery<ImportRun[]>('sources:imports', () => api.sources.imports(), { staleTime: 30_000 });
  const accounts = useQuery<ProviderAccount[]>('providers:accounts', () => api.providers.accounts(), { staleTime: 30_000 });
  const directories = useQuery<DirectorySource[]>('sources:directories', () => api.sources.directories(), { staleTime: 30_000 });

  const s = stats.data;
  const invalidCredentials = (accounts.data ?? []).filter((account) => account.status === 'invalid');
  const expiringQuota = (accounts.data ?? []).filter(
    (account) => account.quota_expires_at !== null && account.quota_expires_at - Date.now() / 1000 < 7 * 86_400,
  );
  const brokenSources = (directories.data ?? []).filter((source) => source.health === 'broken');
  const gateTightened = s !== undefined && s !== null && s.gate_threshold > 55;

  const hotCount = s?.by_tier.HOT ?? null;
  const hasAlerts = invalidCredentials.length > 0 || (meta.data?.open_circuits ?? 0) > 0 ||
    expiringQuota.length > 0 || brokenSources.length > 0 || gateTightened;

  return (
    <div data-component="overview-page" className="space-y-6">
      {/* Hero — command deck */}
      <div
        className="jepy-enter relative overflow-hidden rounded-[var(--radius)] p-8 pb-20 text-white shadow-[var(--shadow-lg)]"
        style={{ background: 'linear-gradient(135deg, #0b1122 0%, #131c33 50%, #0b2b1f 100%)' }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{ background: 'radial-gradient(600px 200px at 80% 0%, rgba(16,185,129,.25), transparent), radial-gradient(400px 200px at 10% 100%, rgba(139,92,246,.2), transparent)' }}
          aria-hidden="true"
        />
        <p className="absolute bottom-[68px] left-8 font-mono text-[9.5px] uppercase tracking-[0.22em] text-emerald-300/70" aria-hidden="true">
          ● live lead stream
        </p>
        <LeadStream />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-xl">
            <p className="mb-2 flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.18em] text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Command deck · all systems live
            </p>
            <h1 className="text-[28px] font-bold leading-tight tracking-tight" style={{ fontFamily: 'var(--disp)' }}>
              Your pipeline scored{' '}
              <span className="bg-gradient-to-r from-emerald-300 to-lime-300 bg-clip-text text-transparent">
                {formatNumber(s?.scored_today ?? null)}
              </span>{' '}
              while you were away
            </h1>
            <p className="mt-2 text-[13.5px] leading-relaxed text-slate-300">
              {formatNumber(hotCount)} hot leads queued · Apify pool live · extension capturing pages.
              Hit <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono text-[11px]">⌘K</kbd> to command everything.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                stats.refetch();
                meta.refetch();
                credits.refetch();
              }}
              className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-[13.5px] font-semibold text-white backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/15"
              title="Manually refresh all data"
            >
              <RefreshCw size={16} aria-hidden="true" />
              Refresh
            </button>
            <Link
              to="/leads"
              className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-[13.5px] font-semibold text-white backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/15"
            >
              <Sparkles size={16} aria-hidden="true" />
              Take the tour
            </Link>
            <Link
              to="/scoring"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#d946ef] px-5 py-3 text-[13.5px] font-semibold text-white shadow-[0_8px_24px_rgba(139,92,246,.4)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(139,92,246,.5)]"
            >
              <Zap size={16} aria-hidden="true" />
              Open scoring
            </Link>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {hasAlerts ? (
        <div data-component="alert-row" className="jepy-enter flex flex-wrap items-center gap-2">
          {invalidCredentials.length > 0 ? (
            <Link to="/vault" className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-[var(--rose-soft)] px-3 py-1.5 text-[13px] font-medium text-[var(--rose-deep)] transition-all hover:-translate-y-px">
              <AlertTriangle size={13} aria-hidden="true" />
              {invalidCredentials.length} credential{invalidCredentials.length > 1 ? 's' : ''} rejected
              <ArrowRight size={13} aria-hidden="true" />
            </Link>
          ) : null}
          {(meta.data?.open_circuits ?? 0) > 0 ? (
            <Link to="/jobs" className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-[var(--rose-soft)] px-3 py-1.5 text-[13px] font-medium text-[var(--rose-deep)] transition-all hover:-translate-y-px">
              <AlertTriangle size={13} aria-hidden="true" />
              {meta.data?.open_circuits} circuit open
              <ArrowRight size={13} aria-hidden="true" />
            </Link>
          ) : null}
          {expiringQuota.length > 0 ? (
            <Link to="/providers" className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-[var(--amber-soft)] px-3 py-1.5 text-[13px] font-medium text-[var(--amber-deep)] transition-all hover:-translate-y-px">
              <Clock size={13} aria-hidden="true" />
              {expiringQuota.length} quota expiring within 7 days
              <ArrowRight size={13} aria-hidden="true" />
            </Link>
          ) : null}
          {brokenSources.length > 0 ? (
            <Link to="/sources" className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-[var(--rose-soft)] px-3 py-1.5 text-[13px] font-medium text-[var(--rose-deep)] transition-all hover:-translate-y-px">
              <Database size={13} aria-hidden="true" />
              {brokenSources.length} source broken
              <ArrowRight size={13} aria-hidden="true" />
            </Link>
          ) : null}
          {gateTightened ? (
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-[var(--amber-soft)] px-3 py-1.5 text-[13px] font-medium text-[var(--amber-deep)]">
              AI gate tightened to {s?.gate_threshold}
            </span>
          ) : null}
        </div>
      ) : null}

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard label="Total leads" hint={`${formatNumber(s?.new_today ?? null)} new today`} accent="emerald" index={0} loading={stats.loading && !s} to="/leads">
          {formatNumber(s?.total ?? null)}
        </KpiCard>
        <KpiCard label="Hot leads" hint="tier HOT · ready for outreach" accent="rose" index={1} loading={stats.loading && !s} to="/leads?tier=HOT">
          <span className="flex items-center gap-2">
            {formatNumber(hotCount)}
            <Users size={16} className="text-[var(--text-3)]" aria-hidden="true" />
          </span>
        </KpiCard>
        <KpiCard label="Queue depth" hint={meta.data ? `oldest pending ${relativeTime(Date.now() / 1000 - meta.data.oldest_pending_sec)}` : undefined} accent="violet" index={2} loading={meta.loading && !meta.data} to="/jobs">
          {formatNumber(meta.data?.queue_depth ?? null)}
        </KpiCard>
        <KpiCard label="MTD spend" hint={`guard trips at ${formatMicro(60_000_000, 0)}`} accent="amber" index={3} loading={stats.loading && !s} to="/providers">
          {formatMicro(s?.mtd_cost_micro ?? null)}
        </KpiCard>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SectionCard
          title="BrightData credit burn"
          subtitle={`daily guard ${formatNumber(BD_DAILY_GUARD)} · monthly line ${BD_MONTHLY_PCT_LINE}%`}
          index={0}
        >
          {credits.data ? <BurnChart points={credits.data.series.slice(-14)} /> : <div className="h-24 animate-pulse rounded-xl bg-[var(--border-soft)]" />}
        </SectionCard>

        <SectionCard
          title="Recent failures"
          subtitle="last 24 hours"
          action={<Link to="/settings" className="text-[13px] font-medium text-[var(--text-2)] transition-colors hover:text-[var(--emerald-deep)]">error log →</Link>}
          index={1}
        >
          <ul className="divide-y divide-[var(--border-soft)]">
            {(errors.data ?? []).slice(0, 6).map((entry) => (
              <li key={entry.id} className="flex items-start justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-[var(--text)]">{errorMessages[entry.code] ?? entry.message}</p>
                  <p className="font-mono text-[10.5px] text-[var(--text-3)]">
                    {entry.code}
                    {entry.reason ? ` · ${entry.reason}` : ''}
                    {entry.provider ? ` · ${entry.provider}` : ''}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] text-[var(--text-3)]">{relativeTime(entry.at)}</span>
              </li>
            ))}
            {(errors.data ?? []).length === 0 ? (
              <li className="py-6 text-center text-[13px] text-[var(--text-3)]">No failures in the last 24 hours.</li>
            ) : null}
          </ul>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SectionCard
          title="Recent imports"
          action={<Link to="/sources" className="text-[13px] font-medium text-[var(--text-2)] transition-colors hover:text-[var(--emerald-deep)]">open Sources →</Link>}
          index={2}
        >
          <ul className="divide-y divide-[var(--border-soft)]">
            {(imports.data ?? []).slice(0, 5).map((run) => (
              <li key={run.id} className="flex items-center justify-between gap-3 py-2.5">
                <div>
                  <p className="text-[13px] font-medium text-[var(--text)]">
                    {run.dataset} <span className="font-mono text-[10.5px] font-normal text-[var(--text-3)]">{run.release_version}</span>
                  </p>
                  <p className="text-[11px] text-[var(--text-3)]">
                    scanned {formatNumber(run.rows_scanned)} · kept {formatNumber(run.rows_ingested)} · merged {formatNumber(run.rows_merged)}
                  </p>
                </div>
                <span className={`rounded-lg px-2 py-1 text-[11px] font-semibold ${
                  run.status === 'done' ? 'bg-[var(--emerald-soft)] text-[var(--emerald-deep)]'
                  : run.status === 'running' ? 'bg-[var(--amber-soft)] text-[var(--amber-deep)]'
                  : 'bg-[var(--rose-soft)] text-[var(--rose-deep)]'
                }`}>
                  {run.status}
                </span>
              </li>
            ))}
            {(imports.data ?? []).length === 0 ? (
              <li className="py-6 text-center text-[13px] text-[var(--text-3)]">No imports yet.</li>
            ) : null}
          </ul>
        </SectionCard>

        <SectionCard
          title="Provider pool"
          subtitle="the pool is a floor, not a ceiling"
          action={<Link to="/vault" className="text-[13px] font-medium text-[var(--text-2)] transition-colors hover:text-[var(--emerald-deep)]">add account →</Link>}
          index={3}
        >
          <ul className="space-y-3">
            {(accounts.data ?? []).slice(0, 5).map((account) => (
              <li key={account.id} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[13px] font-medium text-[var(--text)]">{account.account_label}</span>
                  <span className={`rounded-lg px-2 py-0.5 text-[11px] font-semibold ${
                    account.status === 'active' ? 'bg-[var(--emerald-soft)] text-[var(--emerald-deep)]'
                    : 'bg-[var(--rose-soft)] text-[var(--rose-deep)]'
                  }`}>
                    {account.status}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[var(--border-soft)]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#10b981] to-[#34d399] transition-all duration-700"
                    style={{ width: `${account.quota_limit ? Math.min(100, ((account.quota_used ?? 0) / account.quota_limit) * 100) : 0}%` }}
                  />
                </div>
              </li>
            ))}
            {(accounts.data ?? []).length === 0 ? (
              <li className="py-6 text-center text-[13px] text-[var(--text-3)]">No provider accounts yet.</li>
            ) : null}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
