/**
 * Overview.
 *
 * Read-only except for the alert links. There is no welcome message and no
 * greeting — an operator console opens on the numbers, not on a salutation.
 *
 * Every figure below maps to a field in the API contract. Nothing is computed
 * here that the API does not already define, and a null renders as a dash rather
 * than a zero.
 */

import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Clock, Database, Users } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Num from '../../components/common/Num';
import QuotaBar from '../../components/common/QuotaBar';
import StatusPill from '../../components/common/StatusPill';
import { api } from '../../lib/api';
import { BD_DAILY_GUARD, BD_MONTHLY_PCT_LINE, POLLING } from '../../lib/constants';
import { formatMicro, formatNumber, relativeTime } from '../../lib/format';
import { useQuery } from '../../hooks/useApi';
import type { CreditPoint, DirectorySource, ErrorLogEntry, ImportRun, JobMeta, LeadStats, ProviderAccount } from '../../lib/types';

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

const errorStatus: Record<string, string> = {
  E_PROVIDER_ERROR: 'failed',
  E_CREDENTIAL_INVALID: 'failed',
  E_COMPLIANCE_BLOCK: 'blocked',
  E_NO_CANDIDATE: 'warn',
  E_TIMEOUT: 'warn',
  E_AI_CAP: 'warn',
  E_VALIDATION: 'warn',
  E_FORBIDDEN: 'blocked',
  E_QUOTA_EXHAUSTED: 'failed',
  E_LICENSE_BLOCK: 'blocked',
  E_TIER_GATE: 'blocked',
  E_INTERNAL: 'failed',
};

function KpiCard({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div data-component="kpi-card" className="rounded-md border border-zinc-800 bg-zinc-900 p-3">
      <p className="text-[10px] uppercase tracking-wide text-zinc-400">{label}</p>
      <div className="mt-1.5 flex items-baseline justify-between gap-2">{children}</div>
      {hint ? <p className="mt-1 text-[10px] text-zinc-500">{hint}</p> : null}
    </div>
  );
}

function BurnChart({ points }: { points: CreditPoint[] }) {
  const max = points.reduce((peak, point) => Math.max(peak, point.credits), 0) || 1;
  // Heights are computed in pixels: a percentage height needs a parent with a
  // resolved height, and inside a flex column the bars silently collapse to zero.
  const MAX_BAR_PX = 88;
  return (
    <div data-component="burn-chart" className="flex items-end gap-1">
      {points.map((point) => {
        const height = Math.max(4, Math.round((point.credits / max) * MAX_BAR_PX));
        const guarded = point.credits >= BD_DAILY_GUARD;
        return (
          <div key={`${point.day}-${point.account_label}-${point.unit_type}`} className="flex flex-1 flex-col items-center gap-1">
            <div
              title={`${point.day} · ${formatNumber(point.credits)} credits`}
              className={`w-full rounded-sm ${guarded ? 'bg-red-400' : 'bg-zinc-700'}`}
              style={{ height: `${height}px` }}
            />
            <span className="font-mono text-[10px] text-zinc-600">{point.day.slice(8)}</span>
          </div>
        );
      })}
    </div>
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

  return (
    <div data-component="overview-page" className="space-y-4">
      <PageHeader
        title="Overview"
        description="Pipeline health at a glance. Queue and credit figures refresh on their own."
        polling={meta.refreshing || stats.refreshing}
      />

      {(invalidCredentials.length > 0 || (meta.data?.open_circuits ?? 0) > 0 || expiringQuota.length > 0 || brokenSources.length > 0 || gateTightened) ? (
        <div data-component="alert-row" className="flex flex-wrap items-center gap-2">
          {invalidCredentials.length > 0 ? (
            <Link to="/vault" className="inline-flex items-center gap-1.5 rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1 text-[13px] text-red-400">
              <AlertTriangle size={12} aria-hidden="true" />
              {invalidCredentials.length} credential{invalidCredentials.length > 1 ? 's' : ''} rejected
              <ArrowRight size={12} aria-hidden="true" />
            </Link>
          ) : null}
          {(meta.data?.open_circuits ?? 0) > 0 ? (
            <Link to="/jobs" className="inline-flex items-center gap-1.5 rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1 text-[13px] text-red-400">
              <AlertTriangle size={12} aria-hidden="true" />
              {meta.data?.open_circuits} circuit open
              <ArrowRight size={12} aria-hidden="true" />
            </Link>
          ) : null}
          {expiringQuota.length > 0 ? (
            <Link to="/providers" className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[13px] text-amber-400">
              <Clock size={12} aria-hidden="true" />
              {expiringQuota.length} quota expiring within 7 days
              <ArrowRight size={12} aria-hidden="true" />
            </Link>
          ) : null}
          {brokenSources.length > 0 ? (
            <Link to="/sources" className="inline-flex items-center gap-1.5 rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1 text-[13px] text-red-400">
              <Database size={12} aria-hidden="true" />
              {brokenSources.length} source broken
              <ArrowRight size={12} aria-hidden="true" />
            </Link>
          ) : null}
          {gateTightened ? (
            <span
              className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[13px] text-amber-400"
              title="The AI gate tightens itself when the monthly budget crosses 70%. It happens silently, so it is surfaced."
            >
              AI gate tightened to {s?.gate_threshold}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-4 gap-3">
        <KpiCard label="Total leads" hint={`${formatNumber(s?.new_today ?? null)} new today`}>
          <Num value={s?.total ?? null} format={formatNumber} className="text-base" />
          <Users size={13} className="text-zinc-600" aria-hidden="true" />
        </KpiCard>
        <KpiCard label="Tier split" hint={`${formatNumber(s?.by_tier.provisional ?? null)} provisional (no tier yet)`}>
          <span className="font-mono text-[13px] tabular-nums">
            <span className="text-rose-400">{formatNumber(s?.by_tier.HOT ?? null)}</span>
            <span className="text-zinc-600"> / </span>
            <span className="text-amber-400">{formatNumber(s?.by_tier.WARM ?? null)}</span>
            <span className="text-zinc-600"> / </span>
            <span className="text-zinc-400">{formatNumber(s?.by_tier.COLD ?? null)}</span>
          </span>
        </KpiCard>
        <KpiCard label="Verified email (L3)" hint="ZeroBounce pool: 2,000/month">
          <Num value={s?.verified_email ?? null} format={formatNumber} className="text-base" />
        </KpiCard>
        <KpiCard label="Errors (24h)" hint="see Settings → Error log">
          <Num value={s?.errors_24h ?? null} format={formatNumber} className="text-base" />
        </KpiCard>
        <KpiCard label="Queue depth" hint={meta.data ? `oldest pending ${relativeTime(Date.now() / 1000 - meta.data.oldest_pending_sec)}` : undefined}>
          <Num value={meta.data?.queue_depth ?? null} format={formatNumber} className="text-base" />
          <span className="text-[10px] text-zinc-500">{meta.data ? `${meta.data.running} running` : ''}</span>
        </KpiCard>
        <KpiCard label="BrightData credits today" hint={`daily guard ${formatNumber(BD_DAILY_GUARD)}`}>
          <Num value={s?.bd_credits_today ?? null} format={formatNumber} className="text-base" />
        </KpiCard>
        <KpiCard label="Month-to-date spend" hint={`guard trips at ${formatMicro(60_000_000, 0)}`}>
          <Num value={s?.mtd_cost_micro ?? null} format={(value) => formatMicro(value)} className="text-base" />
        </KpiCard>
        <KpiCard
          label="Provisional"
          hint="coverage below 60% — a score exists, a tier does not"
        >
          <Num value={s?.by_tier.provisional ?? null} format={formatNumber} className="text-base" />
        </KpiCard>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card
          title="BrightData credit burn"
          subtitle={`daily guard ${formatNumber(BD_DAILY_GUARD)} · monthly line ${BD_MONTHLY_PCT_LINE}%`}
          action={<StatusPill status={s && s.bd_credits_today >= BD_DAILY_GUARD ? 'warn' : 'ok'} label={s ? `${formatNumber(s.bd_credits_today)} today` : '—'} />}
        >
          {credits.data ? <BurnChart points={credits.data.series.slice(-14)} /> : <div className="h-24 animate-pulse rounded bg-zinc-800" />}
          <p className="mt-2 text-[10px] text-zinc-500">
            Grey bars are ordinary days. A bar turns red only when the daily guard is crossed, because the operator
            is scanning for the exception, not admiring the trend.
          </p>
        </Card>

        <Card
          title="Recent failures"
          subtitle="last 24 hours"
          action={
            <Link to="/settings" className="text-[13px] text-zinc-400 transition-colors duration-150 hover:text-zinc-100">
              error log
            </Link>
          }
        >
          <ul className="divide-y divide-zinc-800">
            {(errors.data ?? []).slice(0, 6).map((entry) => (
              <li key={entry.id} className="flex items-start justify-between gap-3 py-1.5">
                <div className="min-w-0">
                  <p className="truncate text-[13px] text-zinc-100">{errorMessages[entry.code] ?? entry.message}</p>
                  <p className="font-mono text-[10px] text-zinc-500">
                    {entry.code}
                    {entry.reason ? ` · ${entry.reason}` : ''}
                    {entry.provider ? ` · ${entry.provider}` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusPill status={errorStatus[entry.code] ?? 'warn'} label={entry.code.replace('E_', '').toLowerCase()} />
                  <span className="text-[10px] text-zinc-500">{relativeTime(entry.at)}</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card title="Recent imports" action={<Link to="/sources" className="text-[13px] text-zinc-400 hover:text-zinc-100">open Sources</Link>}>
          <ul className="divide-y divide-zinc-800">
            {(imports.data ?? []).slice(0, 5).map((run) => (
              <li key={run.id} className="flex items-center justify-between gap-3 py-1.5">
                <div>
                  <p className="text-[13px] text-zinc-100">
                    {run.dataset} <span className="font-mono text-[10px] text-zinc-500">{run.release_version}</span>
                  </p>
                  <p className="text-[10px] text-zinc-500">
                    scanned {formatNumber(run.rows_scanned)} · kept {formatNumber(run.rows_ingested)} · merged{' '}
                    {formatNumber(run.rows_merged)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill status={run.status === 'done' ? 'done' : run.status === 'running' ? 'running' : 'failed'} />
                  <span className="text-[10px] text-zinc-500">{relativeTime(run.started_at)}</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Provider pool" subtitle="the pool is a floor, not a ceiling" action={<Link to="/vault" className="text-[13px] text-zinc-400 hover:text-zinc-100">add account</Link>}>
          <ul className="space-y-2">
            {(accounts.data ?? []).slice(0, 5).map((account) => (
              <li key={account.id} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[13px] text-zinc-100">{account.account_label}</span>
                  <StatusPill status={account.status} />
                </div>
                <QuotaBar used={account.quota_used} limit={account.quota_limit} compact />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
