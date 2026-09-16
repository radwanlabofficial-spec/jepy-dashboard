/**
 * Scoring — lead scoring only.
 *
 * `score_weights` (this page) and `router_weights` (Settings, read-only) are
 * different things with confusingly similar names; conflating them is the easiest
 * mistake in this project, so the distinction is stated on the page itself.
 *
 * Existing rows are never edited: a change produces a new version, which means
 * any historical score can be explained and rolled back.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import DataTable, { type Column } from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Dialog from '../../components/common/Dialog';
import ErrorState from '../../components/common/ErrorState';
import Num from '../../components/common/Num';
import StatusPill from '../../components/common/StatusPill';
import { useToast } from '../../components/common/Toast';
import { api } from '../../lib/api';
import { WEIGHT_MAX, WEIGHT_MIN } from '../../lib/constants';
import { formatMicro, formatNumber, formatUtc, relativeTime } from '../../lib/format';
import { invalidate, useMutation, useQuery } from '../../hooks/useApi';
import { useErrorMessage } from '../../hooks/useErrorMessage';
import type { AiUsageSummary, WeightHistoryPoint, WeightRow } from '../../lib/types';

export default function ScoringPage() {
  const toast = useToast();
  const [versionOpen, setVersionOpen] = useState(false);
  const [draft, setDraft] = useState<Record<string, number>>({});

  const weights = useQuery<WeightRow[]>('scoring:weights', () => api.scoring.weights(), { staleTime: 30_000 });
  const history = useQuery<WeightHistoryPoint[]>('scoring:history', () => api.scoring.history(), { staleTime: 30_000 });
  const usage = useQuery<AiUsageSummary>('scoring:aiUsage', () => api.scoring.aiUsage(), { staleTime: 30_000 });

  const newVersion = useMutation(api.scoring.newVersion, {
    invalidatePrefix: 'scoring:',
    onSuccess: (result) => {
      toast.push(`Weights version ${result.weights_version} created`);
      setVersionOpen(false);
      setDraft({});
    },
  });
  const rescore = useMutation(api.scoring.rescore, { onSuccess: (result) => toast.push(`Re-scoring queued for ${formatNumber(result.leads_queued)} leads`) });

  const error = useErrorMessage(weights.error ?? history.error ?? usage.error ?? newVersion.error ?? rescore.error);

  const weightColumns: Column<WeightRow>[] = [
    { key: 'signal', header: 'Signal', width: '24%', render: (row) => <span className="font-mono text-[13px] text-zinc-100">{row.signal_key}</span> },
    { key: 'label', header: 'Meaning', width: '30%', render: (row) => <span className="text-zinc-400">{row.label}</span> },
    { key: 'weight', header: 'Weight', align: 'right', width: '12%', render: (row) => <Num value={row.weight} format={(value) => value.toFixed(2)} className="text-zinc-100" /> },
    { key: 'version', header: 'Version', align: 'right', width: '10%', render: (row) => <Num value={row.weights_version} format={(value) => `v${value}`} /> },
    { key: 'sample', header: 'Sample', align: 'right', width: '10%', render: (row) => <Num value={row.sample_size} format={formatNumber} /> },
    { key: 'updated', header: 'Updated', align: 'right', width: '14%', render: (row) => <span className="text-[10px] text-zinc-500" title={formatUtc(row.updated_at)}>{relativeTime(row.updated_at)}</span> },
  ];

  return (
    <div data-component="scoring-page" className="space-y-3">
      <PageHeader
        title="Scoring"
        description="Lead scoring weights. Provider selection weights are a separate setting, and they live in Settings."
        actions={
          <>
            <Button variant="secondary" onClick={() => void rescore.run({ tier: 'all' })} loading={rescore.loading}>
              Re-score
            </Button>
            <Button variant="primary" icon={<Plus size={12} aria-hidden="true" />} onClick={() => setVersionOpen(true)}>
              New version
            </Button>
          </>
        }
      />

      {error ? <ErrorState error={error} onRetry={weights.refetch} compact /> : null}

      <Card
        padding="none"
        title={`Active weights${weights.data?.[0] ? ` — v${weights.data[0].weights_version}` : ''}`}
        subtitle="Rows are immutable. There is no edit control on any row; corrections arrive as a new version."
      >
        <DataTable<WeightRow>
          columns={weightColumns}
          rows={weights.data ?? []}
          rowKey={(row) => `${row.signal_key}-${row.weights_version}`}
          loading={weights.loading}
          emptyTitle="No weights defined"
          emptyHint="Seed the first weights version before scoring any lead."
        />
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card title="Weight history" subtitle={`samples below 30 are never applied — the point is greyed out and labelled`}>
          <ul className="divide-y divide-zinc-800">
            {(history.data ?? []).map((point) => (
              <li key={`${point.week_key}-${point.signal_key}`} className="flex items-center justify-between gap-3 py-1.5">
                <div className="min-w-0">
                  <p className={`truncate text-[13px] ${point.applied === 1 ? 'text-zinc-100' : 'text-zinc-500'}`}>
                    {point.signal_key}
                  </p>
                  <p className="font-mono text-[10px] text-zinc-500">
                    {point.week_key} · sample {formatNumber(point.sample_size)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Num value={point.lift} format={(value) => `×${value.toFixed(2)}`} className={point.applied === 1 ? 'text-zinc-100' : 'text-zinc-500'} />
                  <StatusPill status={point.applied === 1 ? 'ok' : 'disabled'} label={point.applied === 1 ? 'applied' : 'not applied'} />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[10px] text-zinc-500">
            A large lift on a dozen records is noise, so it is shown but not applied — the clamp is {WEIGHT_MIN}–{WEIGHT_MAX}.
          </p>
        </Card>

        <Card
          title="AI usage"
          subtitle={usage.data ? `${formatNumber(usage.data.requests_today)} of ${formatNumber(usage.data.daily_cap)} today · ${formatNumber(usage.data.requests_mtd)} month-to-date` : undefined}
          action={<Link to="/settings" className="text-[13px] text-zinc-400 hover:text-zinc-100">cap setting</Link>}
        >
          <table className="w-full">
            <thead>
              <tr>
                {['Account', 'Requests', 'Share', 'Cost'].map((header, index) => (
                  <th key={header} scope="col" className={`pb-1 text-[10px] uppercase tracking-wide text-zinc-400 ${index === 0 ? 'text-left' : 'text-right'}`}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(usage.data?.by_account ?? []).map((row) => (
                <tr key={row.account_label} className="border-t border-zinc-800">
                  <td className="py-1.5 font-mono text-[13px] text-zinc-100">{row.account_label}</td>
                  <td className="py-1.5 text-right"><Num value={row.requests} format={formatNumber} /></td>
                  <td className="py-1.5 text-right"><Num value={row.share_pct} format={(value) => `${value.toFixed(0)}%`} className="text-zinc-400" /></td>
                  <td className="py-1.5 text-right"><Num value={row.cost_micro} format={(value) => formatMicro(value)} className="text-zinc-400" /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-[10px] text-zinc-500">
            Per-account rows come from the API rather than being hard-coded, because the account pool grows without a
            deploy.
          </p>
        </Card>
      </div>

      <Dialog
        open={versionOpen}
        title="New weights version"
        onClose={() => setVersionOpen(false)}
        width="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setVersionOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() =>
                void newVersion.run(
                  (weights.data ?? []).map((row) => ({
                    signal_key: row.signal_key,
                    weight: draft[row.signal_key] ?? row.weight,
                  })),
                )
              }
            >
              Create version
            </Button>
          </>
        }
      >
        <div className="space-y-2">
          <p className="text-[13px] text-zinc-400">
            Previous versions stay in place, so any score can be explained later and any change can be rolled back. Weights
            outside {WEIGHT_MIN}–{WEIGHT_MAX} are refused inline.
          </p>
          {(weights.data ?? []).map((row) => (
            <label key={row.signal_key} className="flex items-center justify-between gap-3 border-b border-zinc-800 py-1.5 last:border-0">
              <span className="font-mono text-[13px] text-zinc-100">{row.signal_key}</span>
              <input
                type="number"
                step="0.01"
                min={WEIGHT_MIN}
                max={WEIGHT_MAX}
                value={draft[row.signal_key] ?? row.weight}
                onChange={(event) => setDraft({ ...draft, [row.signal_key]: Number(event.target.value) })}
                className="h-7 w-28 rounded-md border border-zinc-700 bg-zinc-800 px-2 font-mono text-[13px] text-zinc-100 focus-visible:ring-1 focus-visible:ring-green-400"
              />
            </label>
          ))}
        </div>
      </Dialog>
    </div>
  );
}
