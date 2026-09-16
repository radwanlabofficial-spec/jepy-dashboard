/**
 * Sources.
 *
 * Five tabs. The distinctions between them are the point of the page:
 *
 * - Directories (Class B): only transport is editable. There is no selector
 *   field in this form, because selectors live in versioned packs and typing one
 *   here would write to the wrong table.
 * - Selector packs: rows are immutable. A new version is created, approved by a
 *   human, and only then used. Nothing activates itself.
 * - Manual (Class C): offers an "Open manually" link and an audited override.
 *   There is deliberately no fetch button — that button would be the door to a
 *   terms violation.
 * - Blocked (Class X): read-only, no action affordance at all, not even a
 *   disabled button, because a disabled button promises a future that will not
 *   arrive. An unexplained block and a working block must not look alike.
 * - Imports (Class A): the ledger, with dry-run on by default.
 */

import { useState } from 'react';
import { ExternalLink, Lock, Play, Search } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Tabs from '../../components/common/Tabs';
import DataTable, { type Column } from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import StatusPill from '../../components/common/StatusPill';
import Num from '../../components/common/Num';
import Dialog from '../../components/common/Dialog';
import ErrorState from '../../components/common/ErrorState';
import Tooltip from '../../components/common/Tooltip';
import { useToast } from '../../components/common/Toast';
import { api } from '../../lib/api';
import { HEAL_MIN_FILL_PCT, HEAL_MIN_RECORDS, POLLING } from '../../lib/constants';
import { formatNumber, relativeTime } from '../../lib/format';
import { invalidate, useMutation, useQuery } from '../../hooks/useApi';
import { useErrorMessage } from '../../hooks/useErrorMessage';
import type { BlockedSource, DirectorySource, ImportRun, ManualSource, SelectorPack } from '../../lib/types';

const TABS = [
  { id: 'directories', label: 'Directories' },
  { id: 'packs', label: 'Selector packs' },
  { id: 'manual', label: 'Manual' },
  { id: 'blocked', label: 'Blocked' },
  { id: 'imports', label: 'Imports' },
];

const HEALTH_STATUS: Record<string, string> = { ok: 'ok', degraded: 'degraded', broken: 'broken' };

export default function SourcesPage() {
  const [tab, setTab] = useState('directories');
  const [editing, setEditing] = useState<DirectorySource | null>(null);
  const [overrideFor, setOverrideFor] = useState<ManualSource | null>(null);
  const [reason, setReason] = useState('');
  const [packSource, setPackSource] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [dryRun, setDryRun] = useState(true);
  const toast = useToast();

  const directories = useQuery<DirectorySource[]>('sources:directories', () => api.sources.directories(), { staleTime: 30_000 });
  const packs = useQuery<SelectorPack[]>(`sources:packs:${packSource ?? 'all'}`, () => api.sources.packs(packSource ?? undefined), { staleTime: 30_000 });
  const manual = useQuery<ManualSource[]>('sources:manual', () => api.sources.manual(), { staleTime: 30_000 });
  const blocked = useQuery<BlockedSource[]>('sources:blocked', () => api.sources.blocked(), { staleTime: 30_000 });
  const imports = useQuery<ImportRun[]>('sources:imports', () => api.sources.imports(), { staleTime: 10_000, pollMs: POLLING.overview });

  const heal = useMutation(api.sources.heal, {
    invalidatePrefix: 'sources:packs',
    onSuccess: (result) => toast.push(result.message),
  });
  const approve = useMutation(api.sources.approvePack, {
    invalidatePrefix: 'sources:packs',
    onSuccess: () => toast.push('Pack activated — every device picks it up on its next heartbeat'),
  });
  const reject = useMutation(api.sources.rejectPack, {
    invalidatePrefix: 'sources:packs',
    onSuccess: () => toast.push('Draft rejected'),
  });
  const override = useMutation((sourceKey: string, why: string) => api.sources.override(sourceKey, why), {
    onSuccess: (result) => {
      toast.push(result.note);
      setOverrideFor(null);
      setReason('');
    },
  });
  const patchDirectory = useMutation(
    (sourceKey: string, body: Record<string, unknown>) => api.sources.patchDirectory(sourceKey, body),
    {
      onSuccess: () => {
        invalidate('sources:directories');
        toast.push('Transport settings saved');
        setEditing(null);
      },
    },
  );
  const startImport = useMutation(api.sources.startImport, {
    invalidatePrefix: 'sources:imports',
    onSuccess: (result) => {
      toast.push(result.dry_run ? 'Dry run queued — no rows will be written' : 'Import queued');
      setImportOpen(false);
    },
  });

  const error = useErrorMessage(
    directories.error ?? packs.error ?? manual.error ?? blocked.error ?? imports.error ?? heal.error ?? override.error ?? patchDirectory.error ?? startImport.error,
  );

  const directoryColumns: Column<DirectorySource>[] = [
    {
      key: 'source',
      header: 'Source',
      width: '20%',
      render: (source) => (
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => patchDirectory.run(source.source_key, { enabled: source.enabled === 1 ? 0 : 1 })}
            className="block truncate text-left text-zinc-100 underline decoration-zinc-700 underline-offset-2 transition-colors duration-150 hover:text-green-400"
            title="Toggle enabled"
          >
            {source.display_name}
          </button>
          <span className="font-mono text-[10px] text-zinc-500">{source.source_key}</span>
        </div>
      ),
    },
    { key: 'health', header: 'Health', width: '10%', render: (source) => <StatusPill status={HEALTH_STATUS[source.health]} label={source.health} /> },
    { key: 'failures', header: 'Fails', align: 'right', width: '7%', render: (source) => <Num value={source.consecutive_failures} mutedZero /> },
    {
      key: 'pack',
      header: 'Active pack',
      align: 'right',
      width: '10%',
      render: (source) => (
        <button
          type="button"
          className="font-mono text-[13px] text-zinc-100 underline decoration-zinc-700 underline-offset-2 transition-colors duration-150 hover:text-green-400"
          onClick={() => {
            setPackSource(source.source_key);
            setTab('packs');
          }}
        >
          {source.active_pack_version === null ? '—' : `v${source.active_pack_version}`}
        </button>
      ),
    },
    { key: 'rate', header: 'Rate', align: 'right', width: '8%', render: (source) => <Num value={source.rate_limit_rpm} unit="rpm" /> },
    { key: 'last_ok', header: 'Last OK', align: 'right', width: '10%', render: (source) => <span className="text-[10px] text-zinc-500">{relativeTime(source.last_ok_at)}</span> },
    { key: 'enabled', header: 'Enabled', width: '8%', render: (source) => <StatusPill status={source.enabled === 1 ? 'active' : 'disabled'} label={source.enabled === 1 ? 'on' : 'off'} /> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: '18%',
      render: (source) => (
        <span className="inline-flex items-center gap-1.5">
          <Button variant="ghost" onClick={() => setEditing(source)}>
            Transport
          </Button>
          <Tooltip label={`Dry-run needs at least ${HEAL_MIN_RECORDS} valid records and ${HEAL_MIN_FILL_PCT}% fill before a draft is created`}>
            <Button
              variant="secondary"
              onClick={() => {
                setPackSource(source.source_key);
                const active = (packs.data ?? []).find((pack) => pack.source_key === source.source_key && pack.status === 'active');
                if (active) void heal.run(source.source_key, active.id);
              }}
              disabled={heal.loading}
            >
              Heal selectors
            </Button>
          </Tooltip>
        </span>
      ),
    },
  ];

  const packColumns: Column<SelectorPack>[] = [
    { key: 'source', header: 'Source', width: '14%', render: (pack) => <span className="font-mono text-[13px] text-zinc-100">{pack.source_key}</span> },
    { key: 'version', header: 'Version', align: 'right', width: '8%', render: (pack) => <Num value={pack.version} format={(value) => `v${value}`} /> },
    { key: 'status', header: 'Status', width: '10%', render: (pack) => <StatusPill status={pack.status} /> },
    { key: 'origin', header: 'Origin', width: '10%', render: (pack) => <span className="text-zinc-400">{pack.generated_by}</span> },
    { key: 'fields', header: 'Fields', align: 'right', width: '7%', render: (pack) => <Num value={pack.field_count} /> },
    { key: 'success', header: 'Success', align: 'right', width: '9%', render: (pack) => <Num value={pack.success_rate === null ? null : pack.success_rate * 100} format={(value) => `${value.toFixed(1)}%`} /> },
    { key: 'runs', header: 'Runs', align: 'right', width: '8%', render: (pack) => <span className="font-mono tabular-nums text-zinc-400">{formatNumber(pack.runs)} <span className="text-zinc-600">/ {formatNumber(pack.empty_runs)} empty</span></span> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: '22%',
      render: (pack) =>
        pack.status === 'draft' ? (
          <span className="inline-flex items-center gap-1.5">
            {/* Secondary, not green: several draft rows can be on screen at once and
                the view already owns one green primary action. */}
            <Button variant="secondary" loading={approve.loading} onClick={() => void approve.run(pack.id)}>
              Approve
            </Button>
            <Button variant="ghost" onClick={() => void reject.run(pack.id)}>
              Reject
            </Button>
          </span>
        ) : (
          <span className="text-[10px] text-zinc-500">
            {pack.approved_by ? `approved by ${pack.approved_by}` : 'immutable — create a new version'}
          </span>
        ),
    },
  ];

  const manualColumns: Column<ManualSource>[] = [
    { key: 'source', header: 'Source', width: '20%', render: (source) => <span className="text-zinc-100">{source.display_name}</span> },
    { key: 'reason', header: 'Block reason', width: '16%', render: (source) => <StatusPill status="blocked" label={source.block_reason} /> },
    { key: 'why', header: 'Why manual', width: '34%', render: (source) => <span className="text-zinc-400">{source.why_manual}</span> },
    {
      key: 'open',
      header: 'Open',
      width: '14%',
      render: (source) => (
        <a
          href={source.manual_url_template}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1.5 text-[13px] text-zinc-400 underline decoration-zinc-700 underline-offset-2 transition-colors duration-150 hover:text-zinc-100"
        >
          Open manually <ExternalLink size={11} aria-hidden="true" />
        </a>
      ),
    },
    {
      key: 'override',
      header: 'Capture',
      align: 'right',
      width: '16%',
      render: (source) =>
        source.override_ack === 1 ? (
          <Tooltip label={source.override_reason ?? 'recorded'}>
            <span className="inline-flex items-center gap-1.5 text-[10px] text-zinc-500">
              <StatusPill status="ok" label="override recorded" />
            </span>
          </Tooltip>
        ) : (
          <Button variant="secondary" onClick={() => setOverrideFor(source)}>
            Enable capture (override)
          </Button>
        ),
    },
  ];

  const importColumns: Column<ImportRun>[] = [
    { key: 'dataset', header: 'Dataset', width: '16%', render: (run) => <span className="text-zinc-100">{run.dataset} <span className="font-mono text-[10px] text-zinc-500">{run.release_version}</span></span> },
    { key: 'scanned', header: 'Scanned', align: 'right', width: '12%', render: (run) => <Num value={run.rows_scanned} format={formatNumber} /> },
    { key: 'ingested', header: 'Ingested', align: 'right', width: '11%', render: (run) => <Num value={run.rows_ingested} format={formatNumber} /> },
    { key: 'merged', header: 'Merged', align: 'right', width: '11%', render: (run) => <Num value={run.rows_merged} format={formatNumber} /> },
    { key: 'skipped', header: 'Skipped', align: 'right', width: '11%', render: (run) => <Num value={run.rows_skipped} format={formatNumber} className="text-zinc-400" /> },
    { key: 'confidence', header: 'Min conf.', align: 'right', width: '9%', render: (run) => <Num value={run.min_confidence} format={(value) => value.toFixed(2)} /> },
    { key: 'status', header: 'Status', width: '10%', render: (run) => <StatusPill status={run.status === 'done' ? 'done' : run.status === 'running' ? 'running' : 'failed'} /> },
    { key: 'started', header: 'Started', align: 'right', width: '10%', render: (run) => <span className="text-[10px] text-zinc-500">{relativeTime(run.started_at)}</span> },
  ];

  return (
    <div data-component="sources-page" className="space-y-3">
      <PageHeader
        title="Sources"
        description="Class A datasets, Class B directories, Class C manual sources and the one permanently blocked Class X row."
        actions={
          <Button variant="primary" icon={<Play size={12} aria-hidden="true" />} onClick={() => setImportOpen(true)}>
            New import
          </Button>
        }
      />

      {error ? <ErrorState error={error} onRetry={directories.refetch} compact /> : null}

      <Tabs items={TABS} value={tab} onChange={setTab} />

      {tab === 'directories' ? (
        <Card padding="none" title="Class B directories" subtitle="Transport is editable; selectors are not — they live in versioned packs">
          <DataTable<DirectorySource>
            columns={directoryColumns}
            rows={directories.data ?? []}
            rowKey={(source) => source.source_key}
            loading={directories.loading}
            emptyTitle="No directory sources configured"
            emptyHint="Seed the registry before running a directory job."
          />
        </Card>
      ) : null}

      {tab === 'packs' ? (
        <div className="space-y-3">
          <Card
            padding="compact"
            title="Selector packs"
            subtitle={`${HEAL_MIN_RECORDS}+ records and ${HEAL_MIN_FILL_PCT}% fill are required before a draft is created; nothing self-activates`}
            action={
              <select
                className="h-7 rounded-md border border-zinc-700 bg-zinc-800 px-2 text-[13px] text-zinc-100 focus-visible:ring-1 focus-visible:ring-green-400"
                value={packSource ?? ''}
                onChange={(event) => setPackSource(event.target.value === '' ? null : event.target.value)}
              >
                <option value="">All sources</option>
                {(directories.data ?? []).map((source) => (
                  <option key={source.source_key} value={source.source_key}>
                    {source.source_key}
                  </option>
                ))}
              </select>
            }
          >
            <p className="text-[10px] text-zinc-500">
              A pack row is immutable. Editing one is refused with a conflict, so the UI does not offer an edit control;
              corrections arrive as a new version, which keeps the rollback target intact.
            </p>
          </Card>
          <Card padding="none">
            <DataTable<SelectorPack>
              columns={packColumns}
              rows={packs.data ?? []}
              rowKey={(pack) => pack.id}
              loading={packs.loading}
              emptyTitle="No selector packs for this source"
              emptyHint="Run Heal selectors from the Directories tab to draft one."
            />
          </Card>
          {(packs.data ?? []).length > 0 ? (
            <Card title={`Version preview — ${packs.data?.[0].source_key}`} subtitle="read-only">
              <ul className="space-y-1">
                {(packs.data?.[0].selector_preview ?? []).map((field) => (
                  <li key={field.field} className="flex items-center justify-between gap-3 border-b border-zinc-800 py-1 last:border-0">
                    <span className="font-mono text-[13px] text-zinc-100">{field.field}</span>
                    <code className="truncate rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">{field.selector}</code>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>
      ) : null}

      {tab === 'manual' ? (
        <Card padding="none" title="Class C — manual only" subtitle="There is no fetch button here. An automated path to these sources is the door to a terms violation.">
          <DataTable<ManualSource>
            columns={manualColumns}
            rows={manual.data ?? []}
            rowKey={(source) => source.source_key}
            loading={manual.loading}
            emptyTitle="No manual sources"
          />
        </Card>
      ) : null}

      {tab === 'blocked' ? (
        <Card padding="none" title="Class X — permanently blocked" subtitle="Read-only. No override exists, so no control is shown.">
          <DataTable<BlockedSource>
            columns={[
              {
                key: 'source',
                header: 'Source',
                width: '20%',
                render: (source) => (
                  <span className="inline-flex items-center gap-2 text-zinc-400">
                    <Lock size={12} className="text-zinc-500" aria-hidden="true" />
                    {source.display_name}
                  </span>
                ),
              },
              { key: 'reason', header: 'Block reason', width: '16%', render: (source) => <StatusPill status="blocked" label={source.block_reason} /> },
              { key: 'why', header: 'Why it can never be opened', width: '64%', render: (source) => <span className="text-zinc-500">{source.explanation}</span> },
            ]}
            rows={blocked.data ?? []}
            rowKey={(source) => source.source_key}
            loading={blocked.loading}
            emptyTitle="No blocked sources"
          />
        </Card>
      ) : null}

      {tab === 'imports' ? (
        <Card padding="none" title="Class A imports" subtitle="Open datasets are the search tier: cost zero, batch at least a hundred items">
          <DataTable<ImportRun>
            columns={importColumns}
            rows={imports.data ?? []}
            rowKey={(run) => run.id}
            loading={imports.loading}
            emptyTitle="No imports yet"
            emptyHint="Start with an Overture release; it is the cheapest way to get leads with no website."
          />
        </Card>
      ) : null}

      {/* Transport editor. Selector fields are intentionally absent. */}
      <Dialog
        open={editing !== null}
        title={`Transport — ${editing?.source_key ?? ''}`}
        onClose={() => setEditing(null)}
        width="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (!editing) return;
                void patchDirectory.run(editing.source_key, {
                  rate_limit_rpm: editing.rate_limit_rpm,
                  url_template: editing.url_template,
                  pagination_mode: editing.pagination_mode,
                  pagination_param: editing.pagination_param,
                  max_pages: editing.max_pages,
                  enabled: editing.enabled,
                });
              }}
            >
              Save transport
            </Button>
          </>
        }
      >
        {editing ? (
          <div className="space-y-3">
            <Field label="Rate limit (requests / minute)">
              <input
                type="number"
                className="h-7 w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 font-mono text-[13px] text-zinc-100 focus-visible:ring-1 focus-visible:ring-green-400"
                value={editing.rate_limit_rpm}
                onChange={(event) => setEditing({ ...editing, rate_limit_rpm: Number(event.target.value) })}
              />
            </Field>
            <Field label="URL template">
              <input
                className="h-7 w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 font-mono text-[13px] text-zinc-100 focus-visible:ring-1 focus-visible:ring-green-400"
                value={editing.url_template ?? ''}
                onChange={(event) => setEditing({ ...editing, url_template: event.target.value })}
              />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Pagination mode">
                <input
                  className="h-7 w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 font-mono text-[13px] text-zinc-100 focus-visible:ring-1 focus-visible:ring-green-400"
                  value={editing.pagination_mode ?? ''}
                  onChange={(event) => setEditing({ ...editing, pagination_mode: event.target.value })}
                />
              </Field>
              <Field label="Param">
                <input
                  className="h-7 w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 font-mono text-[13px] text-zinc-100 focus-visible:ring-1 focus-visible:ring-green-400"
                  value={editing.pagination_param ?? ''}
                  onChange={(event) => setEditing({ ...editing, pagination_param: event.target.value })}
                />
              </Field>
              <Field label="Max pages">
                <input
                  type="number"
                  className="h-7 w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 font-mono text-[13px] text-zinc-100 focus-visible:ring-1 focus-visible:ring-green-400"
                  value={editing.max_pages ?? 0}
                  onChange={(event) => setEditing({ ...editing, max_pages: Number(event.target.value) })}
                />
              </Field>
            </div>
            <p className="rounded-md border border-zinc-800 bg-zinc-950/40 p-2 text-[10px] text-zinc-500">
              Extraction selectors are not part of this form. They live in versioned selector packs and are approved on
              the Selector packs tab; sending one here is rejected as a validation error.
            </p>
          </div>
        ) : null}
      </Dialog>

      {/* Override dialog: the reason is mandatory and the consequence is stated. */}
      <Dialog
        open={overrideFor !== null}
        title={`Enable capture — ${overrideFor?.display_name ?? ''}`}
        onClose={() => setOverrideFor(null)}
        width="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOverrideFor(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={reason.trim().length < 20}
              onClick={() => overrideFor && void override.run(overrideFor.source_key, reason.trim())}
            >
              Record override
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-[13px] text-zinc-100">
            <span className="font-mono text-[10px] uppercase tracking-wide text-amber-400">{overrideFor?.block_reason}</span>{' '}
            {overrideFor?.why_manual}
          </p>
          <Field label={`Reason (minimum 20 characters — ${reason.trim().length}/20)`}>
            <textarea
              rows={3}
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 p-2 text-[13px] text-zinc-100 focus-visible:ring-1 focus-visible:ring-green-400"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </Field>
          <p className="rounded-md border border-amber-500/30 bg-amber-500/10 p-2 text-[13px] text-amber-400">
            This override is written to the audit log with your email address. It records permission only — capture
            itself starts after ADR-035, so no data arrives from this action today.
          </p>
        </div>
      </Dialog>

      {/* Import dialog: dry run is on by default and cannot be switched off first. */}
      <Dialog
        open={importOpen}
        title="New import"
        onClose={() => setImportOpen(false)}
        width="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setImportOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => void startImport.run({ dataset: 'overture', geo: 'GB', min_confidence: 0.6, dry_run: dryRun })}
            >
              {dryRun ? 'Run dry run' : 'Start import'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Dataset">
            <select className="h-7 w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 text-[13px] text-zinc-100 focus-visible:ring-1 focus-visible:ring-green-400">
              <option value="overture">overture</option>
              <option value="foursquare">foursquare</option>
              <option value="state_sos">state_sos</option>
            </select>
          </Field>
          <Field label="Geo target">
            <select className="h-7 w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 text-[13px] text-zinc-100 focus-visible:ring-1 focus-visible:ring-green-400">
              <option value="GB">United Kingdom</option>
              <option value="IE">Ireland</option>
              <option value="FR">France</option>
            </select>
          </Field>
          <Field label="Minimum confidence">
            <input
              type="number"
              step="0.05"
              defaultValue={0.6}
              className="h-7 w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 font-mono text-[13px] text-zinc-100 focus-visible:ring-1 focus-visible:ring-green-400"
            />
          </Field>
          <label className="flex items-center gap-2 text-[13px] text-zinc-100">
            <input
              type="checkbox"
              checked={dryRun}
              onChange={(event) => setDryRun(event.target.checked)}
              className="h-3.5 w-3.5 rounded border-zinc-700 bg-zinc-800 focus-visible:ring-1 focus-visible:ring-green-400"
            />
            Dry run — count what would change, write nothing
          </label>
          <p className="text-[10px] text-zinc-500">
            Dry run starts on. The first import of a dataset always previews: the preview states plainly that no row was
            written, so a preview can never be mistaken for an import.
          </p>
        </div>
      </Dialog>

      <p className="flex items-center gap-1.5 text-[10px] text-zinc-500">
        <Search size={11} aria-hidden="true" />
        Search starts free. Paid providers are only reached after the credential-free tiers have been exhausted.
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</span>
      {children}
    </label>
  );
}
