/**
 * Vault.
 *
 * The pool grid sits above the credentials table on purpose. The account pool is
 * a floor, not a ceiling (ADR-034), so "a partner joined, add their account" is
 * routine work — and if the only way to do routine work is a single button in the
 * corner of a table, the most frequent action becomes the least visible one.
 *
 * Two tile rules carry real policy: the Yelp tile has no add button because there
 * is exactly one Yelp account forever, and keyless providers have none because
 * the credential concept does not apply to them.
 *
 * There is no reveal toggle and no copy-key control anywhere, not even disabled:
 * the endpoint does not exist, so offering the control would promise a feature
 * that will never ship.
 */

import { useState } from 'react';
import { KeyRound, Lock, Plus } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import DataTable, { type Column } from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Dialog from '../../components/common/Dialog';
import ErrorState from '../../components/common/ErrorState';
import StatusPill from '../../components/common/StatusPill';
import Tooltip from '../../components/common/Tooltip';
import { useToast } from '../../components/common/Toast';
import { api } from '../../lib/api';
import { formatUtc, relativeTime } from '../../lib/format';
import { invalidate, useMutation, useQuery } from '../../hooks/useApi';
import { useErrorMessage } from '../../hooks/useErrorMessage';
import type { AuditEntry, Credential, ProviderPool } from '../../lib/types';

export default function VaultPage() {
  const toast = useToast();
  const [newAccountFor, setNewAccountFor] = useState<string | null>(null);
  const [rotating, setRotating] = useState<Credential | null>(null);

  const credentials = useQuery<Credential[]>('vault:credentials', () => api.vault.credentials(), { staleTime: 30_000 });
  const pools = useQuery<ProviderPool[]>('providers:pools', () => api.providers.pools(), { staleTime: 60_000 });
  const audit = useQuery<AuditEntry[]>('settings:audit', () => api.settings.audit(), { staleTime: 30_000 });

  const test = useMutation(api.vault.test, {
    invalidatePrefix: 'vault:',
    onSuccess: () => toast.push('Provider accepted the credential'),
  });
  const rotate = useMutation(
    ({ id, secret }: { id: string; secret: string }) => api.vault.rotate(id, secret),
    {
      invalidatePrefix: 'vault:',
      onSuccess: () => {
        toast.push('Rotated — the previous key was overwritten and cannot be recovered');
        setRotating(null);
      },
    },
  );
  const remove = useMutation(api.vault.remove, {
    invalidatePrefix: 'vault:',
    onSuccess: () => toast.push('Credential removed'),
  });

  const error = useErrorMessage(credentials.error ?? pools.error ?? test.error ?? rotate.error ?? remove.error);

  const columns: Column<Credential>[] = [
    { key: 'provider', header: 'Provider', width: '12%', render: (row) => <span className="font-mono text-[13px] text-zinc-100">{row.provider}</span> },
    { key: 'account', header: 'Account', width: '16%', render: (row) => <span className="font-mono text-[10px] text-zinc-400">{row.account_label}</span> },
    { key: 'key', header: 'Key name', width: '12%', render: (row) => <span className="font-mono text-[10px] text-zinc-400">{row.key_name}</span> },
    {
      key: 'last4',
      header: 'Masked',
      width: '12%',
      render: (row) => (
        <span className="font-mono text-[13px] text-zinc-100" title="Only the last four characters ever leave the server">
          {'••••'}{row.has_credential === 1 ? row.last4 : ''}
        </span>
      ),
    },
    { key: 'test', header: 'Test', width: '10%', render: (row) => <StatusPill status={row.test_status} /> },
    { key: 'tested', header: 'Last tested', align: 'right', width: '12%', render: (row) => <span className="text-[10px] text-zinc-500" title={formatUtc(row.last_tested_at)}>{relativeTime(row.last_tested_at)}</span> },
    { key: 'rotated', header: 'Rotated', align: 'right', width: '11%', render: (row) => <span className="text-[10px] text-zinc-500" title={formatUtc(row.rotated_at)}>{relativeTime(row.rotated_at)}</span> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: '15%',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5">
          <Button variant="secondary" loading={test.loading} onClick={() => void test.run(row.id)}>
            Test
          </Button>
          <Button variant="secondary" onClick={() => setRotating(row)} disabled={row.has_credential === 0}>
            Rotate
          </Button>
          <Button variant="ghost" onClick={() => void remove.run(row.id)}>
            Delete
          </Button>
        </span>
      ),
    },
  ];

  return (
    <div data-component="vault-page" className="space-y-3">
      <PageHeader
        title="Vault"
        description="The only place a credential is entered. Keys are encrypted at rest and never displayed."
        actions={
          <>
            <Button variant="secondary" icon={<Plus size={12} aria-hidden="true" />} onClick={() => setNewAccountFor('')}>
              + New account
            </Button>
            <Button variant="primary" icon={<KeyRound size={12} aria-hidden="true" />} onClick={() => setNewAccountFor('credential')}>
              Add credential
            </Button>
          </>
        }
      />

      {error ? <ErrorState error={error} onRetry={credentials.refetch} compact /> : null}

      <Card
        title="Pool"
        subtitle="Adding a partner's account is routine work, so it lives at the top rather than in a corner button."
      >
        <div className="grid grid-cols-3 gap-3">
          {(pools.data ?? []).map((pool) => (
            <div key={pool.provider} className="rounded-md border border-zinc-800 bg-zinc-950/40 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-[13px] text-zinc-100">{pool.provider}</p>
                  <p className="mt-0.5 text-[10px] text-zinc-500">
                    {pool.keyless === 1 ? 'no credential concept' : `${pool.account_count} accounts · ${pool.quota_total} ${pool.unit_type ?? ''}`}
                  </p>
                </div>
                {pool.single_account === 1 ? (
                  <Tooltip label="Yelp gets exactly one account, forever — a second one is refused with a policy error">
                    <span className="inline-flex items-center gap-1 rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">
                      <Lock size={10} aria-hidden="true" /> locked
                    </span>
                  </Tooltip>
                ) : pool.keyless === 1 ? null : (
                  <Button variant="ghost" onClick={() => setNewAccountFor(pool.provider)}>
                    add
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card padding="none" title="Credentials" subtitle="Two actions per row. There is no reveal and no copy control, in any state.">
        <DataTable<Credential>
          columns={columns}
          rows={credentials.data ?? []}
          rowKey={(row) => row.id}
          loading={credentials.loading}
          emptyTitle="No credentials stored"
          emptyHint="Add the first account, then paste its key — the server tests it before saving."
        />
      </Card>

      <Card
        title="Audit log"
        subtitle="credentials, selector packs, manual overrides and device actions all land in one table"
        padding="none"
      >
        <DataTable<AuditEntry>
          columns={[
            { key: 'at', header: 'When', width: '14%', render: (row) => <span className="text-[10px] text-zinc-500" title={formatUtc(row.at)}>{relativeTime(row.at)}</span> },
            { key: 'actor', header: 'Actor', width: '20%', render: (row) => <span className="text-[10px] text-zinc-400">{row.actor_email}</span> },
            { key: 'entity', header: 'Entity', width: '20%', render: (row) => <span className="font-mono text-[10px] text-zinc-100">{row.entity_type} · {row.entity_id}</span> },
            { key: 'action', header: 'Action', width: '14%', render: (row) => <span className="text-zinc-400">{row.action}</span> },
            { key: 'result', header: 'Result', width: '10%', render: (row) => <StatusPill status={row.result === 'ok' ? 'ok' : row.result === 'denied' ? 'blocked' : 'failed'} label={row.result} /> },
            { key: 'detail', header: 'Detail', width: '22%', render: (row) => <span className="text-zinc-500">{row.detail ?? '—'}</span> },
          ]}
          rows={audit.data ?? []}
          rowKey={(row) => String(row.id)}
          loading={audit.loading}
          dense
          emptyTitle="No audit entries"
        />
      </Card>

      <NewAccountDialog open={newAccountFor !== null} provider={newAccountFor ?? ''} onClose={() => setNewAccountFor(null)} />

      <Dialog
        open={rotating !== null}
        title={`Rotate — ${rotating?.account_label ?? ''}`}
        onClose={() => setRotating(null)}
        width="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRotating(null)}>
              Cancel
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="rounded-md border border-red-500/30 bg-red-500/10 p-2 text-[13px] text-red-400">
            The current key is overwritten immediately and cannot be recovered. There is no grace period and no
            previous-version copy.
          </p>
          <RotateForm onSubmit={(secret) => rotating && void rotate.run({ id: rotating.id, secret })} />
          <p className="text-[10px] text-zinc-500">
            Rotating bumps the vault epoch, so every cached copy is invalidated within a few seconds without a deploy.
          </p>
        </div>
      </Dialog>
    </div>
  );
}

function NewAccountDialog({ open, provider, onClose }: { open: boolean; provider: string; onClose: () => void }) {
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [label, setLabel] = useState('');
  const [quotaPeriod, setQuotaPeriod] = useState('month');
  const [quotaLimit, setQuotaLimit] = useState(5000);
  const [keyName, setKeyName] = useState('api_token');
  const [secret, setSecret] = useState('');

  const createAccount = useMutation(api.providers.createAccount, { invalidatePrefix: 'vault:' });
  const nextLabel = useQuery(`providers:next-label:${provider}`, () => api.providers.nextLabel(provider), {
    staleTime: 60_000,
    enabled: open && provider !== '' && provider !== 'credential',
  });
  const createCredential = useMutation(api.vault.create, {
    invalidatePrefix: 'vault:',
    onSuccess: () => {
      toast.push('Credential saved and tested');
      onClose();
      setStep(1);
      setSecret('');
    },
  });

  const resolvedLabel = label || nextLabel.data?.account_label || '';
  const accountError = useErrorMessage(createAccount.error);
  const credentialError = useErrorMessage(createCredential.error);

  return (
    <Dialog
      open={open}
      title={provider === 'credential' ? 'Add credential' : `New account — ${provider}`}
      onClose={onClose}
      width="md"
      step={{ current: step, total: 2 }}
      footer={
        step === 1 ? (
          <>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={createAccount.loading}
              onClick={async () => {
                if (provider === 'credential') {
                  setStep(2);
                  return;
                }
                const created = await createAccount.run({
                  provider,
                  account_label: resolvedLabel,
                  quota_limit: quotaLimit,
                  quota_period: quotaPeriod,
                });
                if (created) setStep(2);
              }}
            >
              {provider === 'credential' ? 'Next' : 'Create account'}
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={createCredential.loading}
              disabled={secret.length === 0}
              onClick={() => void createCredential.run({ account_label: resolvedLabel, key_name: keyName, secret })}
            >
              Save and test
            </Button>
          </>
        )
      }
    >
      {step === 1 ? (
        <div className="space-y-3">
          <label className="block space-y-1">
            <span className="text-[10px] uppercase tracking-wide text-zinc-500">Provider</span>
            <select
              className="h-7 w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 text-[13px] text-zinc-100 focus-visible:ring-1 focus-visible:ring-green-400"
              value={provider === 'credential' ? '' : provider}
              onChange={() => undefined}
            >
              <option value="">choose a provider</option>
              {/* Yelp is absent on purpose: one account, forever. */}
              <option value="brightdata">brightdata</option>
              <option value="apify">apify</option>
              <option value="zerobounce">zerobounce</option>
              <option value="manifest">manifest</option>
              <option value="resend">resend</option>
              <option value="mapquest">mapquest</option>
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-[10px] uppercase tracking-wide text-zinc-500">Account label (server-assigned)</span>
            <input
              readOnly
              value={resolvedLabel}
              className="h-7 w-full cursor-default rounded-md border border-zinc-800 bg-zinc-800/60 px-2 font-mono text-[13px] text-zinc-400"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1">
              <span className="text-[10px] uppercase tracking-wide text-zinc-500">Quota limit</span>
              <input
                type="number"
                value={quotaLimit}
                onChange={(event) => setQuotaLimit(Number(event.target.value))}
                className="h-7 w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 font-mono text-[13px] text-zinc-100 focus-visible:ring-1 focus-visible:ring-green-400"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] uppercase tracking-wide text-zinc-500">Quota period</span>
              <select
                value={quotaPeriod}
                onChange={(event) => setQuotaPeriod(event.target.value)}
                className="h-7 w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 text-[13px] text-zinc-100 focus-visible:ring-1 focus-visible:ring-green-400"
              >
                <option value="day">day</option>
                <option value="month">month</option>
                <option value="total">total (limited-time)</option>
              </select>
            </label>
          </div>
          <p className="rounded-md border border-amber-500/30 bg-amber-500/10 p-2 text-[13px] text-amber-400">
            Turn auto-recharge off on the provider dashboard. Nothing in this console can turn it off for you, and a
            card on file with auto-recharge is the one failure the budget guard cannot catch.
          </p>
          {accountError ? <ErrorState error={accountError} compact /> : null}
        </div>
      ) : (
        <div className="space-y-3">
          <label className="block space-y-1">
            <span className="text-[10px] uppercase tracking-wide text-zinc-500">Key name</span>
            <input
              value={keyName}
              onChange={(event) => setKeyName(event.target.value)}
              className="h-7 w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 font-mono text-[13px] text-zinc-100 focus-visible:ring-1 focus-visible:ring-green-400"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-[10px] uppercase tracking-wide text-zinc-500">Secret</span>
            <input
              type="password"
              autoComplete="off"
              value={secret}
              onChange={(event) => setSecret(event.target.value)}
              className="h-7 w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 font-mono text-[13px] text-zinc-100 focus-visible:ring-1 focus-visible:ring-green-400"
            />
          </label>
          <p className="text-[10px] text-zinc-500">
            The server tests the key before encrypting it. If the test fails the credential is not stored and the
            account stays <span className="font-mono">untested</span> — that is the correct outcome, not a rollback: an
            account without a working key is skipped by the router&apos;s first filter and cannot take traffic.
          </p>
          {credentialError ? <ErrorState error={credentialError} compact /> : null}
        </div>
      )}
    </Dialog>
  );
}

function RotateForm({ onSubmit }: { onSubmit: (secret: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <div className="space-y-2">
      <input
        type="password"
        autoComplete="off"
        placeholder="New secret"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="h-7 w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 font-mono text-[13px] text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-green-400"
      />
      <Button variant="danger" disabled={value.length === 0} onClick={() => onSubmit(value)}>
        Overwrite the stored key
      </Button>
    </div>
  );
}
