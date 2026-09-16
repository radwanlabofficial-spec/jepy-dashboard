/**
 * Lead detail.
 *
 * Four tabs. Two rules are load-bearing here:
 *
 * 1. Signals show null as "—" and 0 as "0". A probe that never ran and a probe
 *    that ran and found nothing are different facts; conflating them is what the
 *    provisional tier exists to prevent.
 * 2. Yelp data is never merged into the lead's own fields. It lives in its own
 *    bordered block with the Yelp logo, the business-page link and a "cached 24h"
 *    note, because the licence permits verification with attribution and forbids
 *    storing their content as if it were ours.
 */

import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, RefreshCw, ShieldCheck } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Tabs from '../../components/common/Tabs';
import Num from '../../components/common/Num';
import Tier from '../../components/common/Tier';
import Button from '../../components/common/Button';
import StatusPill from '../../components/common/StatusPill';
import ErrorState from '../../components/common/ErrorState';
import Tooltip from '../../components/common/Tooltip';
import { useToast } from '../../components/common/Toast';
import { api } from '../../lib/api';
import { YELP_RULE_SCORE_FLOOR } from '../../lib/constants';
import { formatNumber, formatTime, formatUtc, relativeTime } from '../../lib/format';
import { invalidate, useMutation, useQuery } from '../../hooks/useApi';
import { useErrorMessage } from '../../hooks/useErrorMessage';
import type { Lead, ScoreBreakdown } from '../../lib/types';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'signals', label: 'Signals' },
  { id: 'score', label: 'Score' },
  { id: 'activity', label: 'Activity' },
];

interface YelpResult {
  yelp_business_id: string;
  cached_at: number;
  rating: number;
  review_count: number;
  categories: string[];
  business_url: string;
}

export default function LeadDetailPage() {
  const { id = '' } = useParams();
  const [tab, setTab] = useState('overview');
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [yelp, setYelp] = useState<YelpResult | null>(null);
  const toast = useToast();

  const lead = useQuery<Lead>(`lead:${id}`, () => api.leads.get(id), { staleTime: 30_000 });
  const breakdown = useQuery<ScoreBreakdown>(`lead:${id}:breakdown`, () => api.leads.breakdown(id), { staleTime: 30_000 });
  const provenance = useQuery(`lead:${id}:provenance`, () => api.leads.provenance(id), { staleTime: 30_000 });
  const activity = useQuery(`lead:${id}:activity`, () => api.leads.activity(id), { staleTime: 30_000 });

  const patch = useMutation((payload: Record<string, unknown>) => api.leads.patch(id, payload), {
    onSuccess: () => {
      invalidate(`lead:${id}`);
      toast.push('Saved — this field is now locked against future imports');
      setEditing(null);
    },
  });
  const enrich = useMutation(() => api.leads.enrich(id), { onSuccess: () => toast.push('Enrichment queued') });
  const verifyYelp = useMutation(() => api.leads.verifyYelp(id), { onSuccess: (result) => setYelp(result) });
  const exportLead = useMutation(() => api.leads.exportCsv({ q: lead.data?.name ?? '' }), {
    onSuccess: (result) => toast.push(`Export ready — ${result.row_count} rows`),
  });

  const error = useErrorMessage(lead.error ?? verifyYelp.error ?? exportLead.error ?? enrich.error);
  const patchError = useErrorMessage(patch.error);
  const record = lead.data;
  const yelpAllowed = (record?.rule_score ?? 0) >= YELP_RULE_SCORE_FLOOR;

  if (lead.loading && !record) {
    return <div className="h-40 animate-pulse rounded-md border border-zinc-800 bg-zinc-900" />;
  }

  if (error && !record) {
    return (
      <div className="space-y-3">
        <Link to="/leads" className="inline-flex items-center gap-1.5 text-[13px] text-zinc-400 hover:text-zinc-100">
          <ArrowLeft size={12} aria-hidden="true" /> back to Leads
        </Link>
        <ErrorState error={error} onRetry={lead.refetch} />
      </div>
    );
  }

  return (
    <div data-component="lead-detail-page" className="space-y-4">
      <div>
        <Link to="/leads" className="inline-flex items-center gap-1.5 text-[13px] text-zinc-400 transition-colors duration-150 hover:text-zinc-100">
          <ArrowLeft size={12} aria-hidden="true" /> back to Leads
        </Link>
      </div>

      <PageHeader
        title={record?.name ?? 'Lead'}
        description={
          <span className="font-mono text-[10px] text-zinc-500">
            {record?.id} · {record?.domain ?? 'no website'} · {record?.city ?? '—'} · {record?.country_code}
          </span>
        }
        actions={
          <>
            <Button variant="secondary" icon={<RefreshCw size={12} aria-hidden="true" />} onClick={() => void enrich.run()}>
              Enrich
            </Button>
            <Tooltip
              label={
                yelpAllowed
                  ? 'Verification uses your single Yelp account; the result is cached for 24 hours'
                  : `Yelp verification needs rule score ≥ ${YELP_RULE_SCORE_FLOOR}`
              }
            >
              <Button
                variant="secondary"
                disabled={!yelpAllowed}
                onClick={() => void verifyYelp.run()}
              >
                Verify with Yelp
              </Button>
            </Tooltip>
            <Button variant="primary" onClick={() => void exportLead.run()}>
              Export
            </Button>
          </>
        }
      />

      {error ? <ErrorState error={error} onRetry={lead.refetch} compact /> : null}

      <div className="flex flex-wrap items-center gap-2">
        <Tier tier={record?.tier ?? null} isProvisional={record?.is_provisional === 1} pinned={record?.tier_pinned === 1} pinNote="score dropped after contact; tier held on purpose" />
        <StatusPill status={record?.status === 'converted' ? 'done' : record?.status === 'discarded' ? 'disabled' : 'pending'} label={record?.status ?? '—'} />
        {record?.is_manual_edited === 1 ? (
          <Tooltip label="Manually edited — the next import will not overwrite this field (R7)">
            <span className="inline-flex items-center gap-1.5 rounded border border-amber-500/30 bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
              <ShieldCheck size={11} aria-hidden="true" /> manually edited
            </span>
          </Tooltip>
        ) : null}
        <span className="text-[10px] text-zinc-500">
          updated <span title={formatUtc(record?.updated_at ?? null)}>{relativeTime(record?.updated_at ?? null)}</span>
        </span>
      </div>

      {/* Errors stay inline beside the record they belong to: a toast would drift
          away from the context the operator needs to act on it. */}
      {patchError ? <ErrorState error={patchError} compact /> : null}

      <Tabs items={TABS} value={tab} onChange={setTab} />

      {tab === 'overview' ? (
        <div className="grid grid-cols-2 gap-3">
          <Card title="Fields" subtitle="click a value to edit it; edits are locked against imports">
            <dl className="divide-y divide-zinc-800">
              {([
                ['name', record?.name],
                ['domain', record?.domain],
                ['city', record?.city],
                ['niche', record?.niche],
                ['email', record?.email],
                ['source_url', record?.source_url],
                ['lawful_basis', record?.lawful_basis],
              ] as [string, string | null | undefined][]).map(([field, value]) => (
                <div key={field} className="flex items-center justify-between gap-3 py-1.5">
                  <dt className="font-mono text-[10px] uppercase tracking-wide text-zinc-500">{field}</dt>
                  <dd className="min-w-0 flex-1 text-right">
                    {editing === field ? (
                      <span className="flex items-center justify-end gap-1.5">
                        <input
                          autoFocus
                          value={draft}
                          onChange={(event) => setDraft(event.target.value)}
                          className="h-7 w-full max-w-[280px] rounded-md border border-zinc-700 bg-zinc-800 px-2 text-[13px] text-zinc-100 focus-visible:ring-1 focus-visible:ring-green-400"
                        />
                        <Button variant="secondary" onClick={() => void patch.run({ [field]: draft })} disabled={patch.loading}>
                          Save
                        </Button>
                        <Button variant="ghost" onClick={() => setEditing(null)}>
                          Cancel
                        </Button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(field);
                          setDraft(value ?? '');
                        }}
                        className="max-w-full truncate text-[13px] text-zinc-100 underline decoration-zinc-700 underline-offset-2 transition-colors duration-150 hover:text-green-400"
                      >
                        {value ?? <span className="font-mono text-zinc-500">—</span>}
                      </button>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>

          <div className="space-y-3">
            <Card title="Yelp verification" subtitle={`exactly one account · cached 24h · rule score ≥ ${YELP_RULE_SCORE_FLOOR}`}>
              {yelp ? (
                <div className="space-y-2 rounded-md border border-zinc-800 bg-zinc-950/40 p-3">
                  <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-zinc-500">
                    Live from Yelp · cached 24h
                  </p>
                  <p className="text-[13px] text-zinc-100">
                    {yelp.rating.toFixed(1)} ★ · {formatNumber(yelp.review_count)} reviews · {yelp.categories.join(', ')}
                  </p>
                  <a
                    href={yelp.business_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 text-[13px] text-zinc-400 underline decoration-zinc-700 underline-offset-2 hover:text-zinc-100"
                  >
                    Yelp business page <ExternalLink size={11} aria-hidden="true" />
                  </a>
                  <p className="text-[10px] text-zinc-500">
                    Yelp content stays in this block. It is never merged into the lead&apos;s own fields and never
                    included in an export.
                  </p>
                </div>
              ) : (
                <p className="text-[13px] text-zinc-500">
                  {yelpAllowed
                    ? 'Not verified yet. Verification needs a rule score of at least 55, which this lead has.'
                    : `Not available: this lead's rule score is below the floor of ${YELP_RULE_SCORE_FLOOR}.`}
                </p>
              )}
            </Card>

            <Card title="Provenance" subtitle="where every field came from">
              <ul className="divide-y divide-zinc-800">
                {(provenance.data ?? []).map((entry) => (
                  <li key={entry.field} className="flex items-center justify-between gap-3 py-1.5">
                    <span className="font-mono text-[13px] text-zinc-100">{entry.field}</span>
                    <span className="min-w-0 flex-1 truncate text-right text-[10px] text-zinc-500">
                      {entry.source} · {entry.src}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      ) : null}

      {tab === 'signals' ? (
        <Card
          title="Signals"
          subtitle={
            breakdown.data
              ? `coverage ${breakdown.data.coverage_pct}% — below 60% a lead stays provisional and never reaches the gate`
              : undefined
          }
        >
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-900">
                {['Signal', 'Collected', 'Expires', 'Weight', 'Contribution'].map((header, index) => (
                  <th
                    key={header}
                    scope="col"
                    className={`px-3 py-1.5 text-[10px] uppercase tracking-wide text-zinc-400 border-b border-zinc-800 ${index > 2 ? 'text-right' : 'text-left'}`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(breakdown.data?.signals ?? []).map((signal) => (
                <tr key={signal.id} className="border-b border-zinc-800">
                  <td className="px-3 py-1.5">
                    <span className="flex items-center gap-2">
                      <span className="text-[13px] text-zinc-100">{signal.label}</span>
                      {signal.expired === 1 ? <StatusPill status="disabled" label="expired" title="Expired signals are excluded from the score" /> : null}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-500">{signal.signal_key}</span>
                  </td>
                  <td className="px-3 py-1.5 text-[13px]" title={formatUtc(signal.collected_at)}>
                    {formatTime(signal.collected_at)}
                  </td>
                  <td className="px-3 py-1.5 text-[13px]" title={signal.expires_at ? formatUtc(signal.expires_at) : 'no expiry'}>
                    {signal.expires_at ? formatTime(signal.expires_at) : <span className="font-mono text-zinc-500">—</span>}
                  </td>
                  <td className="px-3 py-1.5 text-right">
                    <Num value={signal.weight} format={(value) => value.toFixed(2)} />
                  </td>
                  <td className="px-3 py-1.5 text-right">
                    {/* null stays a dash even though 0 is a legitimate contribution. */}
                    <Num value={signal.value === null ? null : signal.contribution} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-[10px] text-zinc-500">
            An expired signal keeps its row and shows “expired”; it is greyed rather than deleted so the operator can
            see that the score moved because the evidence aged out, not because the business changed.
          </p>
        </Card>
      ) : null}

      {tab === 'score' ? (
        <div className="grid grid-cols-2 gap-3">
          <Card title="Score" subtitle={breakdown.data ? `score_version ${breakdown.data.score_version} · weights_version ${breakdown.data.weights_version}` : undefined}>
            <div className="space-y-3">
              {[
                ['Rule score (Pass 0)', breakdown.data?.rule_score ?? null, 'text-zinc-100'],
                ['AI score (Pass 1)', breakdown.data?.ai_score ?? null, 'text-zinc-100'],
                ['Final score', breakdown.data?.final_score ?? null, 'text-green-400'],
              ].map(([label, value, tone]) => (
                <div key={String(label)} className="flex items-center justify-between gap-3">
                  <span className="text-[13px] text-zinc-400">{label}</span>
                  <Num value={value as number | null} className={`text-base ${tone as string}`} />
                </div>
              ))}
              <div className="rounded-md border border-zinc-800 bg-zinc-950/40 p-2 text-[10px] text-zinc-500">
                {breakdown.data?.gate_reason}
              </div>
            </div>
          </Card>
          <Card title="Pass 1 reasoning" subtitle="AI output is advisory, never the only signal">
            <p className="text-[13px] leading-relaxed text-zinc-100">{breakdown.data?.ai_reason ?? 'Not scored by Pass 1 yet.'}</p>
            {breakdown.data?.ai_angle ? (
              <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">
                <span className="text-[10px] uppercase tracking-wide text-zinc-500">angle · </span>
                {breakdown.data.ai_angle}
              </p>
            ) : null}
          </Card>
        </div>
      ) : null}

      {tab === 'activity' ? (
        <Card title="Activity" subtitle="edits, scoring and probe history">
          <ul className="space-y-2">
            {(activity.data ?? []).map((entry) => (
              <li key={entry.id} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-700" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-zinc-100">
                    <span className="font-mono text-[10px] uppercase tracking-wide text-zinc-500">{entry.action}</span>{' '}
                    {entry.detail}
                  </p>
                  <p className="text-[10px] text-zinc-500" title={formatUtc(entry.at)}>
                    {entry.actor} · {relativeTime(entry.at)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

    </div>
  );
}
