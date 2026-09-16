/**
 * Settings.
 *
 * Three rules shape this page:
 *
 * - `router_weights` is shown and cannot be edited. Changing it needs a written
 *   decision, so the only affordance is a button that surfaces that refusal rather
 *   than a field that will reject the operator's work after they have typed it.
 * - System-managed keys are not rendered at all. Hiding them is the honest
 *   choice: a visible control that always fails is worse than no control.
 * - Device registration lives here, not on the gated Captures page. Mode A needs
 *   a token too, so putting registration behind a disabled page would mean the
 *   extension could never be set up.
 */

import { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import DataTable, { type Column } from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Dialog from '../../components/common/Dialog';
import ErrorState from '../../components/common/ErrorState';
import Num from '../../components/common/Num';
import StatusPill from '../../components/common/StatusPill';
import CopyOnceField from '../../components/common/CopyOnceField';
import Tooltip from '../../components/common/Tooltip';
import { useToast } from '../../components/common/Toast';
import { api } from '../../lib/api';
import { STALE_DEVICE_SEC } from '../../lib/constants';
import { formatNumber, formatUtc, relativeTime } from '../../lib/format';
import { invalidate, useMutation, useQuery } from '../../hooks/useApi';
import { useErrorMessage } from '../../hooks/useErrorMessage';
import type { Device, ErrorLogEntry, RegisteredDevice } from '../../lib/types';

const DEVICE_STATUS: Record<string, string> = { active: 'active', stale: 'stale', revoked: 'revoked' };
const DIRECTIVES: Device['current_directive'][] = ['run', 'pause', 'drain', 'revoke'];

export default function SettingsPage() {
  const toast = useToast();
  const [pauseOpen, setPauseOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [deviceLabel, setDeviceLabel] = useState('');
  const [newDevice, setNewDevice] = useState<RegisteredDevice | null>(null);

  const settings = useQuery('settings:values', () => api.settings.get(), { staleTime: 30_000 });
  const routerWeights = useQuery('settings:routerWeights', () => api.settings.routerWeights(), { staleTime: 60_000 });
  const devices = useQuery<Device[]>('settings:devices', () => api.settings.devices(), { staleTime: 30_000 });
  const errors = useQuery<ErrorLogEntry[]>('settings:errors', () => api.settings.errors(), { staleTime: 30_000 });
  const geo = useQuery('settings:geo', () => api.settings.geoTargets(), { staleTime: 60_000 });
  const niches = useQuery<string[]>('settings:niches', () => api.settings.niches(), { staleTime: 60_000 });

  const patch = useMutation(api.settings.patchSetting, {
    invalidatePrefix: 'settings:',
    onSuccess: () => toast.push('Setting saved'),
  });
  const directive = useMutation(
    ({ id, value }: { id: string; value: Device['current_directive'] }) => api.settings.setDirective(id, value),
    {
      invalidatePrefix: 'settings:',
      onSuccess: () => toast.push('Directive sent — the device picks it up on its next poll'),
    },
  );
  const revoke = useMutation(api.settings.revokeDevice, {
    invalidatePrefix: 'settings:',
    onSuccess: () => toast.push('Device revoked — its token is useless immediately'),
  });
  const register = useMutation(api.settings.registerDevice, { onSuccess: (result) => setNewDevice(result) });
  const backup = useMutation(api.settings.backfill, { onSuccess: () => toast.push('Backup started') });

  const error = useErrorMessage(settings.error ?? devices.error ?? errors.error ?? directive.error ?? revoke.error ?? register.error);
  const ruleError = useErrorMessage(patch.error);

  const deviceColumns: Column<Device>[] = [
    { key: 'label', header: 'Device', width: '24%', render: (row) => <span className="font-mono text-[13px] text-zinc-100">{row.device_label}</span> },
    { key: 'mode', header: 'Mode', width: '10%', render: (row) => <StatusPill status="blocked" label={row.mode} /> },
    {
      key: 'heartbeat',
      header: 'Last seen',
      width: '18%',
      render: (row) => {
        const staleBy = row.last_heartbeat_at === null ? Infinity : Date.now() / 1000 - row.last_heartbeat_at;
        return (
          <span className={staleBy > STALE_DEVICE_SEC ? 'text-[10px] text-amber-400' : 'text-[10px] text-zinc-500'} title={formatUtc(row.last_heartbeat_at)}>
            {relativeTime(row.last_heartbeat_at)}
          </span>
        );
      },
    },
    { key: 'status', header: 'Status', width: '10%', render: (row) => <StatusPill status={DEVICE_STATUS[row.status]} /> },
    { key: 'jobs', header: 'Jobs', align: 'right', width: '10%', render: (row) => <Num value={row.jobs_completed} format={formatNumber} /> },
    {
      key: 'directive',
      header: 'Directive',
      width: '14%',
      render: (row) => (
        <select
          value={row.current_directive}
          onChange={(event) => void directive.run({ id: row.id, value: event.target.value as Device['current_directive'] })}
          className="h-7 rounded-md border border-zinc-700 bg-zinc-800 px-2 font-mono text-[10px] text-zinc-100 focus-visible:ring-1 focus-visible:ring-green-400"
        >
          {DIRECTIVES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: '14%',
      render: (row) => (
        <Button variant="ghost" disabled={row.status === 'revoked'} onClick={() => void revoke.run(row.id)}>
          Revoke
        </Button>
      ),
    },
  ];

  return (
    <div data-component="settings-page" className="space-y-3">
      <PageHeader
        title="Settings"
        description="Dispatcher, gates, device registration and the logs."
        actions={
          <>
            <Button variant="secondary" icon={<RefreshCw size={12} aria-hidden="true" />} onClick={() => void backup.run()} loading={backup.loading}>
              Back up now
            </Button>
            {/* Secondary even when paused: "Register device" is this view's single
                green primary action, and two green buttons make neither primary. */}
            <Button variant="secondary" onClick={() => setPauseOpen(true)}>
              {settings.data?.dispatcher_paused === true ? 'Resume dispatcher' : 'Pause dispatcher'}
            </Button>
          </>
        }
      />

      {error ? <ErrorState error={error} onRetry={settings.refetch} compact /> : null}

      <div className="grid grid-cols-3 gap-3">
        <Card title="Dispatcher" subtitle="pausing stops new claims; running work finishes">
          <div className="space-y-2">
            <StatusPill status={settings.data?.dispatcher_paused === true ? 'warn' : 'ok'} label={settings.data?.dispatcher_paused === true ? 'paused' : 'running'} />
            <p className="text-[10px] text-zinc-500">
              The dispatcher is paused automatically when the daily credit guard trips. Resuming needs an explicit
              confirmation that lists what restarts.
            </p>
          </div>
        </Card>

        <Card title="AI gate" subtitle="base 55 · tightens to 65 once month-to-date spend passes 70%">
          <div className="space-y-2">
            <Num value={typeof settings.data?.gate_threshold === 'number' ? settings.data.gate_threshold : null} className="text-base" />
            <Tooltip label="Changing this needs a written decision, because it silently changes which leads get scored">
              <Button variant="ghost" onClick={() => void patch.run('gate_threshold', 60)}>
                Propose change
              </Button>
            </Tooltip>
          </div>
        </Card>

        <Card title="AI daily cap" subtitle="Pass 1 requests per day">
          <div className="space-y-2">
            <Num value={typeof settings.data?.ai_daily_cap === 'number' ? settings.data.ai_daily_cap : null} className="text-base" />
            <p className="text-[10px] text-zinc-500">
              The cap is a ceiling on money, not a target. Reaching it pauses AI scoring and says so on Overview rather
              than queueing silently.
            </p>
          </div>
        </Card>
      </div>

      <Card
        title="Provider selection weights"
        subtitle="read-only — this is router_weights, a different thing from the lead scoring weights page"
      >
        <div className="space-y-1">
          {Object.entries(routerWeights.data ?? {}).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between gap-3 border-b border-zinc-800 py-1 last:border-0">
              <span className="font-mono text-[13px] text-zinc-100">{key}</span>
              <Num value={value} format={(input) => input.toFixed(2)} className="text-zinc-400" />
            </div>
          ))}
        </div>
        {ruleError ? <div className="mt-2"><ErrorState error={ruleError} compact /></div> : null}
        <p className="mt-2 text-[10px] text-zinc-500">
          Shown, not editable. A routing weight change alters which provider spends money, so it goes through a written
          decision first — the same reason quota has no input field.
        </p>
      </Card>

      <Card
        title="Devices"
        subtitle={`registered extension devices · a device goes stale after ${STALE_DEVICE_SEC / 3600}h without a heartbeat`}
        action={
          <Button variant="primary" icon={<Plus size={12} aria-hidden="true" />} onClick={() => setRegisterOpen(true)}>
            Register device
          </Button>
        }
        padding="none"
      >
        <DataTable<Device>
          columns={deviceColumns}
          rows={devices.data ?? []}
          rowKey={(row) => row.id}
          loading={devices.loading}
          emptyTitle="No devices registered"
          emptyHint="Register a device to issue the token the extension uses; the token is shown exactly once."
        />
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card title="Geo targets" subtitle="outreach is blocked in Canada and Germany regardless of this list">
          <ul className="divide-y divide-zinc-800">
            {(geo.data ?? []).map((target) => (
              <li key={target.id} className="flex items-center justify-between gap-3 py-1.5">
                <span className="text-[13px] text-zinc-100">
                  {target.label} <span className="font-mono text-[10px] text-zinc-500">{target.country_code}</span>
                </span>
                <span className="flex items-center gap-2">
                  <Num value={target.niche_count} unit="niches" className="text-zinc-400" />
                  <StatusPill status={target.enabled === 1 ? 'active' : 'disabled'} label={target.enabled === 1 ? 'on' : 'off'} />
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Niches" subtitle="used to build directory queries and to group leads">
          <div className="flex flex-wrap gap-1.5">
            {(niches.data ?? []).map((niche) => (
              <span key={niche} className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                {niche}
              </span>
            ))}
          </div>
        </Card>
      </div>

      <Card padding="none" title="Error log" subtitle="branch on the code, never on the message text">
        <DataTable<ErrorLogEntry>
          columns={[
            { key: 'at', header: 'When', width: '12%', render: (row) => <span className="text-[10px] text-zinc-500" title={formatUtc(row.at)}>{relativeTime(row.at)}</span> },
            { key: 'code', header: 'Code', width: '20%', render: (row) => <span className="font-mono text-[10px] text-zinc-100">{row.code}</span> },
            { key: 'reason', header: 'Reason', width: '14%', render: (row) => <span className="font-mono text-[10px] text-zinc-400">{row.reason ?? '—'}</span> },
            { key: 'provider', header: 'Provider', width: '12%', render: (row) => <span className="font-mono text-[10px] text-zinc-400">{row.provider ?? '—'}</span> },
            { key: 'job', header: 'Job', width: '14%', render: (row) => <span className="font-mono text-[10px] text-zinc-400">{row.job_id ?? '—'}</span> },
            { key: 'message', header: 'Message', width: '28%', render: (row) => <span className="text-zinc-500">{row.message}</span> },
          ]}
          rows={errors.data ?? []}
          rowKey={(row) => String(row.id)}
          loading={errors.loading}
          dense
          emptyTitle="No errors logged"
        />
      </Card>

      {/* Pause/resume needs confirmation: it changes whether money is being spent. */}
      <Dialog
        open={pauseOpen}
        title={settings.data?.dispatcher_paused === true ? 'Resume the dispatcher' : 'Pause the dispatcher'}
        onClose={() => setPauseOpen(false)}
        width="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPauseOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={settings.data?.dispatcher_paused === true ? 'secondary' : 'danger'}
              onClick={() => {
                void patch.run('dispatcher_paused', settings.data?.dispatcher_paused !== true);
                setPauseOpen(false);
              }}
            >
              {settings.data?.dispatcher_paused === true ? 'Resume' : 'Pause'}
            </Button>
          </>
        }
      >
        <p className="text-[13px] text-zinc-100">
          {settings.data?.dispatcher_paused === true
            ? 'Resuming restarts new job claims and paid provider calls. Running work was never stopped.'
            : 'Pausing stops new claims. Work already running finishes, and nothing new will be dispatched until you resume.'}
        </p>
      </Dialog>

      {/* Registration hands back a token exactly once. */}
      <Dialog
        open={registerOpen}
        title="Register a device"
        onClose={() => {
          setRegisterOpen(false);
          setNewDevice(null);
          setDeviceLabel('');
        }}
        width="md"
        footer={
          newDevice ? null : (
            <>
              <Button variant="ghost" onClick={() => setRegisterOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                disabled={deviceLabel.trim().length === 0}
                loading={register.loading}
                onClick={() => void register.run(deviceLabel.trim())}
              >
                Issue token
              </Button>
            </>
          )
        }
      >
        {newDevice ? (
          <CopyOnceField
            value={newDevice.token}
            onDismiss={() => {
              invalidate('settings:devices');
              setRegisterOpen(false);
              setNewDevice(null);
              setDeviceLabel('');
            }}
          />
        ) : (
          <div className="space-y-2">
            <label className="block space-y-1">
              <span className="text-[10px] uppercase tracking-wide text-zinc-500">Device label</span>
              <input
                value={deviceLabel}
                onChange={(event) => setDeviceLabel(event.target.value)}
                placeholder="chrome-operator-laptop"
                className="h-7 w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 font-mono text-[13px] text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-green-400"
              />
            </label>
            <p className="text-[10px] text-zinc-500">
              The token is stored as a hash on the server. It is displayed once, at creation, because the extension needs
              it — after that there is no way to read it back.
            </p>
          </div>
        )}
      </Dialog>
    </div>
  );
}
