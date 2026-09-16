/**
 * Topbar.
 *
 * Carries the environment badge, queue depth, the month-to-date cash position and
 * the operator's Access email. There is no avatar and no global search: one
 * person uses this console and every page owns its own filters.
 *
 * The "Demo data" chip is not decoration. When the console runs on bundled
 * fixtures the reviewer must never mistake those rows for live pipeline output.
 */

import { Link } from 'react-router-dom';
import { isDemoMode } from '../../lib/api';
import { formatMicro } from '../../lib/format';
import type { JobMeta, Me } from '../../lib/types';

export interface TopbarProps {
  me: Me | null;
  meta: JobMeta | null;
  /** Month-to-date spend in micro-USD, from the overview stats. */
  mtdCostMicro: number | null;
  budgetMicro: number | null;
  cashGuardMicro: number;
}

export default function Topbar({ me, meta, mtdCostMicro, budgetMicro, cashGuardMicro }: TopbarProps) {
  const overGuard = mtdCostMicro !== null && mtdCostMicro >= cashGuardMicro;

  return (
    <header
      data-component="topbar"
      className="flex h-11 shrink-0 items-center justify-between gap-4 border-b border-zinc-800 bg-zinc-900 px-4"
    >
      <div className="flex items-center gap-3">
        {isDemoMode ? (
          <span
            data-component="demo-chip"
            title="No VITE_API_BASE is configured, so this console is reading bundled fixtures"
            className="rounded border border-amber-500/30 bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-400"
          >
            Demo data
          </span>
        ) : null}
        <span className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
          {me?.env ?? 'local'}
        </span>
        <Link
          to="/jobs"
          className="text-[13px] text-zinc-400 transition-colors duration-150 hover:text-zinc-100"
          title="Queue depth"
        >
          queue{' '}
          <span className="font-mono tabular-nums text-zinc-100">{meta ? meta.queue_depth.toLocaleString('en-US') : '—'}</span>
        </Link>
        {meta && meta.open_circuits > 0 ? (
          <span className="rounded border border-red-500/30 bg-red-500/15 px-1.5 py-0.5 text-[10px] font-medium text-red-400">
            {meta.open_circuits} circuit open
          </span>
        ) : null}
      </div>
      <div className="flex items-center gap-4">
        <span
          className={`text-[13px] ${overGuard ? 'text-red-400' : 'text-zinc-400'}`}
          title={`cash guard ${formatMicro(cashGuardMicro, 0)} · month-to-date`}
        >
          MTD{' '}
          <span className="font-mono tabular-nums text-zinc-100">{formatMicro(mtdCostMicro)}</span>
          {budgetMicro !== null ? <span className="text-zinc-500"> / {formatMicro(budgetMicro, 0)}</span> : null}
        </span>
        <span className="text-[13px] text-zinc-500">{me?.email ?? '—'}</span>
      </div>
    </header>
  );
}
