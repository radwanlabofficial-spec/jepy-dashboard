/**
 * Jobs.
 *
 * The hop drawer is the densest and most useful view in the console: it is the
 * only way to reconstruct why a provider was chosen, which candidates a filter
 * dropped and for what reason, and which selector-pack version produced the
 * result. `pack_version` is never hidden — without it there is no way to tell
 * "the new pack broke it" from "the site changed".
 */

import { useState } from 'react';
import { RotateCw, XCircle } from 'lucide-react';
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
import { POLLING, STALE_TIME } from '../../lib/constants';
import { formatDuration, formatLatency, formatMicro, formatMilli, formatNumber, formatUtc, relativeTime } from '../../lib/format';
import { useMutation, useQuery } from '../../hooks/useApi';
import { useErrorMessage } from '../../hooks/useErrorMessage';
import type { HopAttempt, Job, JobMeta, RejectedCandidate } from '../../lib/types';

const JOB_STATUS: Record<string, string> = {
  queued: 'queued',
  claimed: 'claimed',
  running: 'running',
  done: 'done',
  failed: 'failed',
  cancelled: 'disabled',
};

const OUTCOME: Record<string, string> = { ok: 'ok', empty: 'warn', failed: 'failed', skipped: 'disabled', timeout: 'warn' };

export default function JobsPage() {
  const [openJob, setOpenJob] = useState<Job | null>(null);
  const toast = useToast();

  const meta = useQuery<JobMeta>('jobs:meta', () => api.jobs.meta(), { staleTime: STALE_TIME.queue, pollMs: POLLING.jobs });
  const jobs = useQuery<Job[]>('jobs:list', () => api.jobs.list(), { staleTime: STALE_TIME.queue, pollMs: POLLING.jobs });
  const hops = useQuery<{ hops: HopAttempt[]; rejected: RejectedCandidate[] }>(
    `jobs:hops:${openJob?.id ?? 'none'}`,
    () => api.jobs.hops(openJob?.id ?? ''),
    { staleTime: 10_000, enabled: openJob !== null },
  );

  const retry = useMutation(api.jobs.retry, {
    invalidatePrefix: 'jobs:',
    onSuccess: () => toast.push('Retry queued as a new attempt — the original stays in the log'),
  });
  const cancel = useMutation(api.jobs.cancel, { invalidatePrefix: 'jobs:', onSuccess: () => toast.push('Job cancelled') });

  const error = useErrorMessage(jobs.error ?? retry.error ?? cancel.error);
  const hopsError = useErrorMessage(hops.error);

  const columns: Column<Job>[] = [
    { key: 'id', header: 'Job', width: '12%', render: (job) => <span className="font-mono text-[13px] text-zinc-100">{job.id}</span> },
    { key: 'type', header: 'Type', width: '14%', render: (job) => <span className="text-zinc-400">{job.job_type}</span> },
    { key: 'target', header: 'Payload', width: '26%', render: (job) => <span className="block truncate font-mono text-[10px] text-zinc-400" title={job.payload_summary}>{job.payload_summary}</span> },
    { key: 'status', header: 'Status', width: '10%', render: (job) => <StatusPill status={JOB_STATUS[job.status]} label={job.status} /> },
    { key: 'provider', header: 'Provider', width: '12%', render: (job) => <span className="font-mono text-[10px] text-zinc-400">{job.provider ?? '—'}</span> },
    { key: 'attempts', header: 'Attempts', align: 'right', width: '9%', render: (job) => <Num value={job.attempts} unit={`/ ${job.max_attempts}`} /> },
    { key: 'hop', header: 'Hop', align: 'right', width: '6%', render: (job) => <Num value={job.hop_count} unit="/ 3" /> },
    { key: 'age', header: 'Age', align: 'right', width: '8%', render: (job) => <span className="text-[10px] text-zinc-500" title={formatUtc(job.created_at)}>{relativeTime(job.created_at)}</span> },
  ];

  const hopColumns: Column<HopAttempt>[] = [
    { key: 'hop', header: 'Hop', align: 'right', width: '5%', render: (hop) => <Num value={hop.hop} /> },
    { key: 'provider', header: 'Provider', width: '12%', render: (hop) => <span className="font-mono text-[10px] text-zinc-100">{hop.provider}</span> },
    { key: 'account', header: 'Account', width: '12%', render: (hop) => <span className="font-mono text-[10px] text-zinc-400">{hop.account_label}</span> },
    { key: 'adapter', header: 'Adapter', width: '10%', render: (hop) => <span className="font-mono text-[10px] text-zinc-400">{hop.adapter}</span> },
    {
      key: 'pack',
      header: 'Pack',
      align: 'right',
      width: '7%',
      render: (hop) => (
        // Never hidden, even when null: it is the only selector-rollback trace.
        <Num value={hop.pack_version} format={(value) => `v${value}`} />
      ),
    },
    { key: 'outcome', header: 'Outcome', width: '9%', render: (hop) => <StatusPill status={OUTCOME[hop.outcome]} label={hop.outcome} /> },
    { key: 'http', header: 'HTTP', align: 'right', width: '6%', render: (hop) => <Num value={hop.http_status || null} /> },
    { key: 'records', header: 'Records', align: 'right', width: '8%', render: (hop) => <Num value={hop.records_count} /> },
    { key: 'units', header: 'Units', align: 'right', width: '8%', render: (hop) => <Num value={hop.units} unit={hop.unit_type ?? undefined} /> },
    { key: 'cost', header: 'Cost', align: 'right', width: '8%', render: (hop) => <Num value={hop.cost_micro} format={(value) => formatMicro(value)} /> },
    { key: 'latency', header: 'Latency', align: 'right', width: '8%', render: (hop) => <Num value={hop.latency_ms} format={formatLatency} className="text-zinc-400" /> },
    { key: 'score', header: 'Decision', align: 'right', width: '7%', render: (hop) => <Num value={hop.score_milli} format={formatMilli} className="text-zinc-400" /> },
  ];

  const rejectedColumns: Column<RejectedCandidate>[] = [
    { key: 'provider', header: 'Rejected candidate', width: '26%', render: (row) => <span className="font-mono text-[10px] text-zinc-400">{row.provider} · {row.account_label}</span> },
    { key: 'filter', header: 'Filter', width: '18%', render: (row) => <StatusPill status="disabled" label={row.filter} /> },
    { key: 'score', header: 'Score', align: 'right', width: '10%', render: (row) => <Num value={row.score_milli} format={formatMilli} /> },
    { key: 'reason', header: 'Why it was dropped', width: '46%', render: (row) => <span className="text-zinc-500">{row.reason}</span> },
  ];

  return (
    <div data-component="jobs-page" className="space-y-3">
      <PageHeader
        title="Jobs"
        description="Every outbound call goes through the queue. This page is where a stuck or mis-routed job is diagnosed."
        polling={jobs.refreshing}
      />

      <div className="grid grid-cols-4 gap-3">
        <Card padding="compact" title="Queue depth">
          <Num value={meta.data?.queue_depth ?? null} format={formatNumber} className="text-base" />
        </Card>
        <Card padding="compact" title="Oldest pending">
          <Num value={meta.data?.oldest_pending_sec ?? null} format={formatDuration} className="text-base" />
        </Card>
        <Card padding="compact" title="Dead">
          <Num value={meta.data?.dead_count ?? null} format={formatNumber} className="text-base" />
        </Card>
        <Card padding="compact" title="Open circuits">
          <Num value={meta.data?.open_circuits ?? null} format={formatNumber} className="text-base" />
        </Card>
      </div>

      <Card padding="none" title="Queue" subtitle="click a row to open the hop-by-hop route trace">
        <DataTable<Job>
          columns={columns}
          rows={jobs.data ?? []}
          rowKey={(job) => job.id}
          loading={jobs.loading}
          error={error && !openJob ? error : null}
          onRetry={jobs.refetch}
          onRowClick={(job) => setOpenJob(job)}
          emptyTitle="The queue is empty"
          emptyHint="Nothing is waiting to run. New imports and probes enqueue themselves."
        />
      </Card>

      <Dialog
        open={openJob !== null}
        title={`Route trace — ${openJob?.id ?? ''}`}
        onClose={() => setOpenJob(null)}
        width="lg"
        footer={
          <>
            <Button variant="ghost" icon={<XCircle size={12} aria-hidden="true" />} onClick={() => openJob && void cancel.run(openJob.id)}>
              Cancel job
            </Button>
            <Button variant="secondary" icon={<RotateCw size={12} aria-hidden="true" />} onClick={() => openJob && void retry.run(openJob.id)}>
              Retry as new attempt
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {hopsError ? <ErrorState error={hopsError} compact /> : null}
          <div>
            <h3 className="mb-1.5 text-sm font-medium text-zinc-100">Hops</h3>
            <DataTable<HopAttempt>
              columns={hopColumns}
              rows={hops.data?.hops ?? []}
              rowKey={(hop) => `${hop.hop}-${hop.account_label}`}
              loading={hops.loading}
              dense
              emptyTitle="No attempts recorded"
            />
          </div>
          <div>
            <h3 className="mb-1.5 text-sm font-medium text-zinc-100">Candidates dropped before the call</h3>
            <DataTable<RejectedCandidate>
              columns={rejectedColumns}
              rows={hops.data?.rejected ?? []}
              rowKey={(row) => `${row.provider}-${row.account_label}`}
              dense
              emptyTitle="Nothing was dropped"
            />
            <p className="mt-1.5 text-[10px] text-zinc-500">
              Without this list the routing decision cannot be reconstructed — a provider that is quiet because it was
              filtered out looks exactly like one that is quiet because it was never needed.
            </p>
          </div>
          <p className="text-[10px] text-zinc-500">
            A successful HTTP status with zero records is a failure, not a success. Circuit scope is
            (provider × target type) and backs off from 15 minutes up to a 60-minute ceiling, so no fixed duration is
            shown here.
          </p>
        </div>
      </Dialog>
    </div>
  );
}
