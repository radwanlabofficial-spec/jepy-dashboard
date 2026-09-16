/**
 * Email.
 *
 * Two absences are deliberate and load-bearing:
 *
 * - There is no cold-outreach control. The option is not disabled, it is absent,
 *   because a disabled control implies it may one day be enabled and this one will
 *   not be: cold prospecting on the transactional provider risks all five sending
 *   accounts at once, and a domain's reputation cannot be bought back.
 * - Suppression addresses are shown masked. The database stores a hash only, so a
 *   plaintext column would be a promise the schema cannot keep.
 *
 * Verification is a HOT-tier action only, and the remaining pool is stated next to
 * it so "why can I not verify this" never needs a support question.
 */

import { useState } from 'react';
import { Ban } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import DataTable, { type Column } from '../../components/common/DataTable';
import Num from '../../components/common/Num';
import StatusPill from '../../components/common/StatusPill';
import Button from '../../components/common/Button';
import ErrorState from '../../components/common/ErrorState';
import { useToast } from '../../components/common/Toast';
import { api } from '../../lib/api';
import { BOUNCE_RATE_LINE, COMPLAINT_RATE_LINE, ZB_MONTHLY_POOL } from '../../lib/constants';
import { formatNumber, formatUtc, relativeTime } from '../../lib/format';
import { invalidate, useMutation, useQuery } from '../../hooks/useApi';
import { useErrorMessage } from '../../hooks/useErrorMessage';
import type { Campaign, DsrRequest, SuppressionEntry } from '../../lib/types';

export default function EmailPage() {
  const toast = useToast();
  const [address, setAddress] = useState('');

  const campaigns = useQuery<Campaign[]>('email:campaigns', () => api.email.campaigns(), { staleTime: 30_000 });
  const suppression = useQuery<SuppressionEntry[]>('email:suppression', () => api.email.suppression(), { staleTime: 30_000 });
  const dsr = useQuery<DsrRequest[]>('email:dsr', () => api.email.dsr(), { staleTime: 30_000 });

  const addSuppression = useMutation(
    ({ email, reason }: { email: string; reason: SuppressionEntry['reason'] }) => api.email.addSuppression(email, reason),
    {
      invalidatePrefix: 'email:',
      onSuccess: () => {
        toast.push('Added to suppression — checked before every send, with no bypass');
        setAddress('');
      },
    },
  );

  const error = useErrorMessage(campaigns.error ?? suppression.error ?? dsr.error ?? addSuppression.error);

  const campaignColumns: Column<Campaign>[] = [
    { key: 'name', header: 'Campaign', width: '28%', render: (row) => <span className="text-zinc-100">{row.name}</span> },
    { key: 'esp', header: 'Channel', width: '16%', render: (row) => <StatusPill status={row.esp === 'resend' ? 'ok' : 'blocked'} label={row.esp === 'resend' ? 'transactional' : 'separate ESP'} /> },
    { key: 'status', header: 'Status', width: '12%', render: (row) => <StatusPill status={row.status === 'sending' ? 'running' : row.status === 'paused' ? 'warn' : row.status === 'done' ? 'done' : 'disabled'} label={row.status} /> },
    { key: 'warmup', header: 'Warm-up', width: '18%', render: (row) => <span className="text-[10px] text-zinc-500">{row.warmup_stage ?? '—'}</span> },
    { key: 'sent', header: 'Sent', align: 'right', width: '8%', render: (row) => <Num value={row.sent} format={formatNumber} /> },
    {
      key: 'bounce',
      header: 'Bounce',
      align: 'right',
      width: '9%',
      render: (row) => (
        <Num value={row.bounce_rate} format={(value) => `${value.toFixed(2)}%`} className={row.bounce_rate > BOUNCE_RATE_LINE ? 'text-red-400' : undefined} />
      ),
    },
    {
      key: 'complaint',
      header: 'Complaint',
      align: 'right',
      width: '9%',
      render: (row) => (
        <Num value={row.complaint_rate} format={(value) => `${value.toFixed(2)}%`} className={row.complaint_rate > COMPLAINT_RATE_LINE ? 'text-red-400' : undefined} />
      ),
    },
  ];

  return (
    <div data-component="email-page" className="space-y-3">
      <PageHeader
        title="Email"
        description="Transactional sending, suppression and data-subject requests."
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-[13px] text-zinc-400">
            <Ban size={12} aria-hidden="true" /> cold outreach is not available
          </span>
        }
      />

      {error ? <ErrorState error={error} onRetry={campaigns.refetch} compact /> : null}

      <div className="grid grid-cols-3 gap-3">
        <Card padding="compact" title="Complaint line" subtitle={`pause above ${COMPLAINT_RATE_LINE}%`}>
          <Num value={(campaigns.data ?? []).reduce((peak, row) => Math.max(peak, row.complaint_rate), 0)} format={(value) => `${value.toFixed(2)}%`} className="text-base" />
        </Card>
        <Card padding="compact" title="Bounce line" subtitle={`pause above ${BOUNCE_RATE_LINE}%`}>
          <Num value={(campaigns.data ?? []).reduce((peak, row) => Math.max(peak, row.bounce_rate), 0)} format={(value) => `${value.toFixed(2)}%`} className="text-base" />
        </Card>
        <Card padding="compact" title="ZeroBounce pool" subtitle="HOT-tier verification only">
          <span className="font-mono text-base tabular-nums text-zinc-100">{formatNumber(ZB_MONTHLY_POOL)}</span>
          <span className="ml-1 text-[10px] text-zinc-500">per month</span>
        </Card>
      </div>

      <Card padding="none" title="Campaigns" subtitle="Resend carries transactional mail only; cold prospecting uses a separate provider and a separate domain">
        <DataTable<Campaign>
          columns={campaignColumns}
          rows={campaigns.data ?? []}
          rowKey={(row) => row.id}
          loading={campaigns.loading}
          emptyTitle="No campaigns"
        />
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card
          title="Suppression list"
          subtitle="checked inside the send path — there is no bypass route"
          action={
            <span className="flex items-center gap-1.5">
              <input
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="add address"
                className="h-7 w-40 rounded-md border border-zinc-700 bg-zinc-800 px-2 text-[13px] text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-green-400"
              />
              <Button
                variant="secondary"
                disabled={address.trim().length === 0}
                onClick={() => void addSuppression.run({ email: address.trim(), reason: 'manual' })}
              >
                Add
              </Button>
            </span>
          }
        >
          <DataTable<SuppressionEntry>
            columns={[
              { key: 'email', header: 'Address (masked)', width: '46%', render: (row) => <span className="font-mono text-[13px] text-zinc-100">{row.email_masked}</span> },
              { key: 'reason', header: 'Reason', width: '24%', render: (row) => <StatusPill status="blocked" label={row.reason} /> },
              { key: 'at', header: 'Added', align: 'right', width: '30%', render: (row) => <span className="text-[10px] text-zinc-500" title={formatUtc(row.created_at)}>{relativeTime(row.created_at)}</span> },
            ]}
            rows={suppression.data ?? []}
            rowKey={(row) => String(row.id)}
            loading={suppression.loading}
            dense
            emptyTitle="Nothing suppressed"
          />
        </Card>

        <Card title="Data-subject requests" subtitle="due 30 days after receipt">
          <DataTable<DsrRequest>
            columns={[
              { key: 'subject', header: 'Subject (masked)', width: '34%', render: (row) => <span className="font-mono text-[13px] text-zinc-100">{row.subject_masked}</span> },
              { key: 'kind', header: 'Kind', width: '18%', render: (row) => <span className="text-zinc-400">{row.kind}</span> },
              { key: 'due', header: 'Due', align: 'right', width: '24%', render: (row) => <span className="text-[10px] text-zinc-500" title={formatUtc(row.due_at)}>{relativeTime(row.due_at)}</span> },
              { key: 'status', header: 'Status', width: '24%', render: (row) => <StatusPill status={row.status === 'done' ? 'done' : 'warn'} label={row.status} /> },
            ]}
            rows={dsr.data ?? []}
            rowKey={(row) => row.id}
            loading={dsr.loading}
            dense
            emptyTitle="No requests"
          />
        </Card>
      </div>

      <p className="text-[10px] text-zinc-500">
        The send button stays disabled until a HOT lead&apos;s email is verified at L3. When the verification pool runs
        out, HOT sending stops rather than dropping back to a weaker check — a silently downgraded verification is worse
        than a visible pause.
      </p>
    </div>
  );
}
