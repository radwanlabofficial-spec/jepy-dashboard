/**
 * Leads.
 *
 * Filters live in the URL query rather than component state, so a shared link
 * reproduces exactly the view the sender was looking at, and a refresh does not
 * silently reset the operator's work. Nothing is persisted locally.
 *
 * The detail view is a slide-over panel, not a route — the operator keeps the
 * list context while reading one record.
 */

import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Download, ShieldCheck } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import DataTable, { type Column } from '../../components/common/DataTable';
import Num from '../../components/common/Num';
import Tier from '../../components/common/Tier';
import Button from '../../components/common/Button';
import StatusPill from '../../components/common/StatusPill';
import Tooltip from '../../components/common/Tooltip';
import { useToast } from '../../components/common/Toast';
import { api } from '../../lib/api';
import { formatNumber, relativeTime } from '../../lib/format';
import { useMutation, useQuery } from '../../hooks/useApi';
import { useErrorMessage } from '../../hooks/useErrorMessage';
import type { Lead, LeadFilter } from '../../lib/types';

const EMAIL_STATUS: Record<string, string> = {
  none: 'disabled',
  L1: 'blocked',
  L2: 'blocked',
  L3: 'ok',
  bounced: 'failed',
  suppressed: 'blocked',
};

export default function LeadsPage() {
  const [params, setParams] = useSearchParams();
  const toast = useToast();

  const filter: LeadFilter = useMemo(
    () => ({
      tier: params.get('tier') ?? undefined,
      status: params.get('status') ?? undefined,
      city: params.get('city') ?? undefined,
      niche: params.get('niche') ?? undefined,
      min_score: params.get('min_score') ?? undefined,
      has_email: params.get('has_email') ?? undefined,
      q: params.get('q') ?? undefined,
    }),
    [params],
  );

  const filterKey = params.toString();
  const leads = useQuery(`leads:list:${filterKey}`, () => api.leads.list(filter), { staleTime: 30_000 });
  const exportCsv = useMutation(api.leads.exportCsv, {
    onSuccess: (result) => toast.push(`Export ready — ${result.row_count} rows`),
  });

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value === '') next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const filtered = filterKey.length > 0;
  const error = useErrorMessage(leads.error ?? exportCsv.error);

  const columns: Column<Lead>[] = [
    {
      key: 'name',
      header: 'Name',
      width: '22%',
      render: (lead) => (
        <div className="min-w-0">
          <Link
            to={`/leads/${lead.id}`}
            className="block truncate text-zinc-100 underline decoration-zinc-700 underline-offset-2 transition-colors duration-150 hover:text-green-400"
          >
            {lead.name}
          </Link>
          <span className="block truncate font-mono text-[10px] text-zinc-500">
            {lead.domain ?? 'no website'}
          </span>
        </div>
      ),
    },
    { key: 'city', header: 'City', width: '10%', render: (lead) => <span className="text-zinc-400">{lead.city ?? '—'}</span> },
    { key: 'niche', header: 'Niche', width: '10%', render: (lead) => <span className="text-zinc-400">{lead.niche}</span> },
    {
      key: 'tier',
      header: 'Tier',
      width: '10%',
      render: (lead) => <Tier tier={lead.tier} isProvisional={lead.is_provisional === 1} pinned={lead.tier_pinned === 1} />,
    },
    {
      key: 'score',
      header: 'Score',
      align: 'right',
      width: '8%',
      render: (lead) => <Num value={lead.final_score} />,
    },
    {
      key: 'rule',
      header: 'Rule',
      align: 'right',
      width: '8%',
      render: (lead) => <Num value={lead.rule_score} className="text-zinc-400" />,
    },
    {
      key: 'email',
      header: 'Email',
      width: '10%',
      render: (lead) => <StatusPill status={EMAIL_STATUS[lead.email_status] ?? 'disabled'} label={lead.email_status} />,
    },
    {
      key: 'status',
      header: 'Status',
      width: '10%',
      render: (lead) => (
        <span className="inline-flex items-center gap-1.5">
          <StatusPill status={lead.status === 'converted' ? 'done' : lead.status === 'discarded' ? 'disabled' : 'pending'} label={lead.status} />
          {lead.is_manual_edited === 1 ? (
            <Tooltip label="Manually edited — the next import will not overwrite this field (R7)">
              <ShieldCheck size={12} className="text-amber-400" aria-hidden="true" />
            </Tooltip>
          ) : null}
        </span>
      ),
    },
    { key: 'updated', header: 'Updated', align: 'right', width: '10%', render: (lead) => <span className="text-[10px] text-zinc-500">{relativeTime(lead.updated_at)}</span> },
  ];

  return (
    <div data-component="leads-page" className="space-y-3">
      <PageHeader
        title="Leads"
        description="Server-paginated, 200 rows per page. Filters are in the URL, so this view is shareable."
        actions={
          <>
            <Button
              variant="secondary"
              icon={<Download size={12} aria-hidden="true" />}
              onClick={() => void exportCsv.run(filter)}
            >
              Export CSV
            </Button>
            <Button variant="primary" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
              Clear filters
            </Button>
          </>
        }
      />

      <Card padding="compact" title="Filters" subtitle="URL-backed — refresh keeps them">
        <div className="grid grid-cols-6 gap-2">
          <input
            className="col-span-2 h-7 rounded-md border border-zinc-700 bg-zinc-800 px-2 text-[13px] text-zinc-100 placeholder:text-zinc-500 focus-visible:border-zinc-700 focus-visible:ring-1 focus-visible:ring-green-400"
            placeholder="Free text — name, domain, city"
            value={filter.q ?? ''}
            onChange={(event) => setFilter('q', event.target.value)}
          />
          <select
            className="h-7 rounded-md border border-zinc-700 bg-zinc-800 px-2 text-[13px] text-zinc-100 focus-visible:ring-1 focus-visible:ring-green-400"
            value={filter.tier ?? ''}
            onChange={(event) => setFilter('tier', event.target.value)}
          >
            <option value="">All tiers</option>
            <option value="HOT">HOT</option>
            <option value="WARM">WARM</option>
            <option value="COLD">COLD</option>
          </select>
          <select
            className="h-7 rounded-md border border-zinc-700 bg-zinc-800 px-2 text-[13px] text-zinc-100 focus-visible:ring-1 focus-visible:ring-green-400"
            value={filter.status ?? ''}
            onChange={(event) => setFilter('status', event.target.value)}
          >
            <option value="">All statuses</option>
            <option value="new">new</option>
            <option value="scored">scored</option>
            <option value="contacted">contacted</option>
            <option value="converted">converted</option>
            <option value="discarded">discarded</option>
          </select>
          <input
            className="h-7 rounded-md border border-zinc-700 bg-zinc-800 px-2 text-[13px] text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-green-400"
            placeholder="Min score"
            inputMode="numeric"
            value={filter.min_score ?? ''}
            onChange={(event) => setFilter('min_score', event.target.value.replace(/[^0-9]/g, ''))}
          />
          <label className="flex h-7 items-center gap-2 text-[13px] text-zinc-400">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 rounded border-zinc-700 bg-zinc-800 focus-visible:ring-1 focus-visible:ring-green-400"
              checked={filter.has_email === '1'}
              onChange={(event) => setFilter('has_email', event.target.checked ? '1' : '')}
            />
            has email
          </label>
        </div>
      </Card>

      <Card
        padding="none"
        title={`Results${leads.data ? ` — ${formatNumber(leads.data.total)}` : ''}`}
        subtitle="click a name to open the lead"
      >
        <DataTable<Lead>
          columns={columns}
          rows={leads.data?.rows ?? []}
          rowKey={(lead) => lead.id}
          loading={leads.loading}
          error={error}
          onRetry={leads.refetch}
          filtered={filtered}
          filteredTitle="No lead matches these filters"
          filteredHint="Widen the tier or score filter, or clear the filters to see the full list."
          onClearFilters={() => setParams(new URLSearchParams(), { replace: true })}
          emptyTitle="No leads imported yet"
          emptyHint="Nothing has been ingested yet — start the first import from Sources → Imports."
        />
      </Card>

      <p className="text-[10px] text-zinc-500">
        A missing signal shows as “—” and never as 0: “not probed yet” and “probed, empty result” are different facts,
        and the whole provisional-tier rule depends on keeping them apart.
      </p>
    </div>
  );
}
