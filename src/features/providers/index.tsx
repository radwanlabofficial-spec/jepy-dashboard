/**
 * Providers — monitoring only.
 *
 * There is no key input anywhere on this page, by design: credentials are entered
 * in exactly one place (Vault → Add credential) and nowhere else. This page links
 * to it rather than offering a form, because a second entry point is a second
 * place for a half-configured account to appear.
 *
 * Quota is server-owned. The field is not rendered at all, rather than shown
 * disabled, so the operator is never invited to try.
 */

import { Link } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import DataTable, { type Column } from '../../components/common/DataTable';
import Num from '../../components/common/Num';
import QuotaBar from '../../components/common/QuotaBar';
import StatusPill from '../../components/common/StatusPill';
import Tooltip from '../../components/common/Tooltip';
import ErrorState from '../../components/common/ErrorState';
import { useToast } from '../../components/common/Toast';
import { api } from '../../lib/api';
import { BD_DAILY_GUARD, BD_MONTHLY_PCT_LINE } from '../../lib/constants';
import { formatMicro, formatNumber, formatUtc, relativeTime } from '../../lib/format';
import { invalidate, useMutation, useQuery } from '../../hooks/useApi';
import { useErrorMessage } from '../../hooks/useErrorMessage';
import type { CapabilityRow, CreditPoint, ProviderAccount, ProviderPool } from '../../lib/types';

export default function ProvidersPage() {
  const toast = useToast();
  const accounts = useQuery<ProviderAccount[]>('providers:accounts', () => api.providers.accounts(), { staleTime: 30_000 });
  const capability = useQuery<CapabilityRow[]>('providers:capability', () => api.providers.capability(), { staleTime: 60_000 });
  const credits = useQuery<{ series: CreditPoint[]; by_unit: CreditPoint[] }>('providers:credits', () => api.providers.credits(), { staleTime: 60_000 });
  const pools = useQuery<ProviderPool[]>('providers:pools', () => api.providers.pools(), { staleTime: 60_000 });

  const toggle = useMutation(api.providers.patchAccount, {
    invalidatePrefix: 'providers:accounts',
    onSuccess: () => toast.push('Account updated'),
  });
  // No quota mutation is wired up: the field is not rendered at all, so there is
  // no control that could produce the refusal in the first place.
  const error = useErrorMessage(accounts.error ?? capability.error ?? credits.error ?? pools.error);

  const accountColumns: Column<ProviderAccount>[] = [
    {
      key: 'label',
      header: 'Account',
      width: '18%',
      render: (account) => (
        <div>
          <span className="font-mono text-[13px] text-zinc-100">{account.account_label}</span>
          <span className="block text-[10px] text-zinc-500">{account.provider} · {account.quota_period}</span>
        </div>
      ),
    },
    { key: 'status', header: 'Status', width: '12%', render: (account) => <StatusPill status={account.status} /> },
    {
      key: 'quota',
      header: 'Quota',
      width: '22%',
      render: (account) => (
        <QuotaBar
          used={account.quota_used}
          limit={account.quota_limit}
          markers={
            account.provider === 'brightdata'
              ? [
                  { atPct: (BD_DAILY_GUARD / account.quota_limit) * 100, label: `daily guard ${formatNumber(BD_DAILY_GUARD)}` },
                  { atPct: BD_MONTHLY_PCT_LINE, label: `${BD_MONTHLY_PCT_LINE}% — the AI gate tightens past this line` },
                ]
              : []
          }
        />
      ),
    },
    {
      key: 'cooldown',
      header: 'Cooldown',
      align: 'right',
      width: '12%',
      render: (account) =>
        account.cooldown_until && account.cooldown_until > Date.now() / 1000 ? (
          <Num value={Math.ceil(account.cooldown_until - Date.now() / 1000)} unit="s" />
        ) : (
          <span className="font-mono text-zinc-500">—</span>
        ),
    },
    {
      key: 'expires',
      header: 'Quota expires',
      align: 'right',
      width: '13%',
      render: (account) => {
        const soon = account.quota_expires_at !== null && account.quota_expires_at - Date.now() / 1000 < 7 * 86_400;
        return (
          <span className={soon ? 'font-mono tabular-nums text-red-400' : 'font-mono tabular-nums text-zinc-400'} title={formatUtc(account.quota_expires_at)}>
            {account.quota_expires_at === null ? '—' : relativeTime(account.quota_expires_at)}
          </span>
        );
      },
    },
    { key: 'errors', header: 'Errors', align: 'right', width: '8%', render: (account) => <Num value={account.consecutive_errors} mutedZero /> },
    {
      key: 'enabled',
      header: 'Enabled',
      align: 'right',
      width: '10%',
      render: (account) => (
        <button
          type="button"
          onClick={() => void toggle.run(account.id, { enabled: account.enabled === 1 ? 0 : 1 })}
          className="text-[13px] text-zinc-400 underline decoration-zinc-700 underline-offset-2 transition-colors duration-150 hover:text-zinc-100"
        >
          {account.enabled === 1 ? 'on' : 'off'}
        </button>
      ),
    },
  ];

  const capabilityColumns: Column<CapabilityRow>[] = [
    { key: 'target', header: 'Target type', width: '22%', render: (row) => <span className="font-mono text-[10px] text-zinc-100">{row.target_type}</span> },
    { key: 'provider', header: 'Provider', width: '16%', render: (row) => <span className="font-mono text-[10px] text-zinc-400">{row.provider}</span> },
    {
      key: 'cost',
      header: 'Cost / unit',
      align: 'right',
      width: '14%',
      render: (row) => (
        <span className="cursor-default font-mono tabular-nums text-zinc-400" title="Read-only: cost and unit changes require an ADR">
          {row.unit_type === null ? 'free' : formatMicro(row.cost_micro_per_unit)}
        </span>
      ),
    },
    { key: 'quality', header: 'Quality', align: 'right', width: '10%', render: (row) => <Num value={row.quality * 100} format={(value) => `${value.toFixed(0)}%`} /> },
    { key: 'latency', header: 'Latency', align: 'right', width: '10%', render: (row) => <Num value={row.avg_latency_ms} format={(value) => `${formatNumber(value)}ms`} className="text-zinc-400" /> },
    { key: 'runner', header: 'Runner', width: '10%', render: (row) => <span className="text-zinc-400">{row.runner}</span> },
    {
      key: 'credential',
      header: 'Credential',
      width: '10%',
      render: (row) =>
        row.requires_credential === 0 ? (
          <Tooltip label="No credential needed — this is the floor that keeps the pipeline alive when keys die">
            <span>
              <StatusPill status="ok" label="keyless" />
            </span>
          </Tooltip>
        ) : (
          <StatusPill status="blocked" label="needs key" />
        ),
    },
    { key: 'enabled', header: 'Enabled', align: 'right', width: '8%', render: (row) => <StatusPill status={row.enabled === 1 ? 'active' : 'disabled'} label={row.enabled === 1 ? 'on' : 'off'} /> },
  ];

  const maxSeries = (credits.data?.series ?? []).reduce((peak, point) => Math.max(peak, point.credits), 0) || 1;

  return (
    <div data-component="providers-page" className="space-y-3">
      <PageHeader
        title="Providers"
        description="Read-only monitoring. Credentials are never entered here."
        actions={
          <Link to="/vault?new=1" className="text-[13px] text-zinc-400 underline decoration-zinc-700 underline-offset-2 transition-colors duration-150 hover:text-zinc-100">
            Add an account in Vault
          </Link>
        }
      />

      {error ? <ErrorState error={error} onRetry={accounts.refetch} compact /> : null}

      <Card title="Pool" subtitle="The account pool is a floor, not a ceiling: adding a partner's key is routine, not an exception.">
        <div className="grid grid-cols-5 gap-3">
          {(pools.data ?? []).map((pool) => (
            <div key={pool.provider} className="rounded-md border border-zinc-800 bg-zinc-950/40 p-2">
              <p className="font-mono text-[13px] text-zinc-100">{pool.provider}</p>
              <p className="mt-0.5 text-[10px] text-zinc-500">
                {pool.keyless === 1 ? 'keyless' : `${formatNumber(pool.account_count)} accounts`}
                {pool.single_account === 1 ? ' · single, forever' : ''}
              </p>
              <p className="mt-1 font-mono text-[10px] tabular-nums text-zinc-400">
                {formatNumber(pool.quota_used)} / {formatNumber(pool.quota_total)} {pool.unit_type ?? ''}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card padding="none" title="Accounts" subtitle="Quota is server-owned and read-only; only enabled and priority can be changed.">
        <DataTable<ProviderAccount>
          columns={accountColumns}
          rows={accounts.data ?? []}
          rowKey={(account) => account.id}
          loading={accounts.loading}
          emptyTitle="No provider accounts"
          emptyHint="Add the first account from Vault → + New account."
        />
      </Card>

      <Card
        title="BrightData credits"
        subtitle={`daily guard ${formatNumber(BD_DAILY_GUARD)} · monthly ${BD_MONTHLY_PCT_LINE}% line tightens the AI gate`}
      >
        <div className="flex items-end gap-1">
          {(credits.data?.series ?? []).slice(-14).map((point) => (
            <div key={`${point.day}-${point.account_label}-${point.unit_type}`} className="flex flex-1 flex-col items-center gap-1">
              <div
                title={`${point.day} · ${point.account_label} · ${formatNumber(point.units)} ${point.unit_type} = ${formatNumber(point.credits)} credits`}
                className={`w-full rounded-sm ${point.credits >= BD_DAILY_GUARD ? 'bg-red-400' : 'bg-zinc-700'}`}
                style={{ height: `${Math.max(4, Math.round((point.credits / maxSeries) * 104))}px` }}
              />
              <span className="font-mono text-[10px] text-zinc-600">{point.day.slice(8)}</span>
            </div>
          ))}
        </div>
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-zinc-500">
          {(credits.data?.by_unit ?? []).map((point) => (
            <li key={`${point.account_label}-${point.unit_type}`} className="font-mono">
              {point.account_label} · {point.unit_type} · {formatNumber(point.units)} units = {formatNumber(point.credits)} credits
            </li>
          ))}
        </ul>
      </Card>

      <Card padding="none" title="Capability matrix" subtitle="one row per target type and provider; the keyless floor is asserted at seed time">
        <DataTable<CapabilityRow>
          columns={capabilityColumns}
          rows={capability.data ?? []}
          rowKey={(row) => `${row.target_type}-${row.provider}`}
          loading={capability.loading}
          dense
          emptyTitle="No capability rows"
        />
      </Card>

      <p className="text-[10px] text-zinc-500">
        There is no auto-recharge switch on this page and there never will be: a hard stop at zero credits is the only
        billing protection that cannot fail quietly.
      </p>
    </div>
  );
}
