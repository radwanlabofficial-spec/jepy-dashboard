/**
 * Topbar — Jepy Bold v4 design.
 *
 * Sticky with blur, carries the environment badge, queue depth, cash position,
 * density toggle, Night Ops toggle, command palette trigger, and the operator's
 * Access email.
 */

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Columns3, Menu, Moon, Search, Sun, Zap } from 'lucide-react';
import { BUILD_SHA, isDemoMode } from '../../lib/api';
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

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export default function Topbar({ me, meta, mtdCostMicro, budgetMicro, cashGuardMicro }: TopbarProps) {
  const overGuard = mtdCostMicro !== null && mtdCostMicro >= cashGuardMicro;
  const now = useNow();
  const navigate = useNavigate();
  const [nightOps, setNightOps] = useState(() => {
    try { return localStorage.getItem('jepy-night') === 'on'; } catch { return false; }
  });
  const [compact, setCompact] = useState(() => {
    try { return localStorage.getItem('jepy-density') === 'compact'; } catch { return false; }
  });

  useEffect(() => {
    document.body.classList.toggle('night-ops', nightOps);
    try { localStorage.setItem('jepy-night', nightOps ? 'on' : 'off'); } catch { /* ignore */ }
  }, [nightOps]);

  useEffect(() => {
    document.body.classList.toggle('density-compact', compact);
    try { localStorage.setItem('jepy-density', compact ? 'compact' : 'comfortable'); } catch { /* ignore */ }
  }, [compact]);

  // Scrolled shadow
  useEffect(() => {
    const onScroll = () => {
      document.getElementById('topbar')?.classList.toggle('scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Keyboard: N toggles Night Ops. The command palette dispatches the same
  // toggle events the buttons use, so one handler owns each piece of state.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if ((e.key === 'n' || e.key === 'N') && !e.metaKey && !e.ctrlKey) {
        setNightOps((v) => !v);
      }
    };
    const onNightToggle = () => setNightOps((v) => !v);
    const onDensityToggle = () => setCompact((v) => !v);
    window.addEventListener('keydown', onKey);
    window.addEventListener('jepy:night-toggle', onNightToggle);
    window.addEventListener('jepy:density-toggle', onDensityToggle);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('jepy:night-toggle', onNightToggle);
      window.removeEventListener('jepy:density-toggle', onDensityToggle);
    };
  }, []);

  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <header id="topbar" data-component="topbar" className="jepy-topbar">
      <button
        className="jepy-icon-btn"
        title="Toggle sidebar ( [ )"
        aria-label="Toggle sidebar"
        onClick={() => window.dispatchEvent(new CustomEvent('jepy:sidebar-toggle'))}
      >
        <Menu size={17} aria-hidden="true" />
      </button>

      <button
        className="jepy-icon-btn"
        title={compact ? 'Comfortable density' : 'Compact density'}
        aria-label="Toggle density"
        aria-pressed={compact}
        onClick={() => setCompact((c) => !c)}
      >
        <Columns3 size={17} aria-hidden="true" />
      </button>

      <button
        className="jepy-icon-btn"
        title={nightOps ? 'Day mode (N)' : 'Night Ops (N)'}
        aria-label="Toggle Night Ops"
        aria-pressed={nightOps}
        onClick={() => setNightOps((v) => !v)}
      >
        {nightOps ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
      </button>

      <div className="date-pill flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--panel)] px-2.5 py-1.5 shadow-[var(--shadow)]" title={`${dateStr} ${timeStr}`}>
        <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </span>
        <span className="whitespace-nowrap text-[11px] font-medium text-[var(--text-3)]">{dateStr} · {timeStr}</span>
      </div>

      <button
        className="search ml-auto flex w-[300px] cursor-pointer items-center gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3.5 py-2.5 shadow-[var(--shadow)] transition-all hover:-translate-y-px hover:shadow-[var(--shadow-lg)]"
        title="Command palette (⌘K)"
        onClick={() => window.dispatchEvent(new CustomEvent('jepy:palette'))}
      >
        <Search size={15} className="shrink-0 text-[var(--text-3)]" aria-hidden="true" />
        <span className="flex-1 text-left text-[12.5px] text-[var(--text-3)]">Search or type a command…</span>
        <span className="kbd rounded-md border border-[var(--border)] bg-[var(--border-soft)] px-1.5 py-0.5 font-mono text-[10.5px] font-bold text-[var(--text-3)]">⌘K</span>
      </button>

      <div className="flex items-center gap-2.5">
        {isDemoMode ? (
          <span
            data-component="demo-chip"
            title="VITE_API_MODE is not 'live', so this console is reading bundled fixtures"
            className="rounded-md border border-amber-500/30 bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-600"
          >
            Demo data
          </span>
        ) : null}
        <span className="rounded-md border border-[var(--border)] bg-[var(--panel)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-2)]">
          {me?.env ?? 'local'}
        </span>
        <Link
          to="/jobs"
          className="text-[13px] text-[var(--text-2)] transition-colors hover:text-[var(--text)]"
          title="Queue depth"
        >
          queue{' '}
          <span className="font-mono tabular-nums font-semibold text-[var(--text)]">
            {meta ? meta.queue_depth.toLocaleString('en-US') : '—'}
          </span>
        </Link>
        {meta && meta.open_circuits > 0 ? (
          <span className="rounded-md border border-red-500/30 bg-red-500/15 px-1.5 py-0.5 text-[10px] font-medium text-red-500">
            {meta.open_circuits} circuit open
          </span>
        ) : null}
        <span
          className={`text-[13px] ${overGuard ? 'text-red-500' : 'text-[var(--text-2)]'}`}
          title={`cash guard ${formatMicro(cashGuardMicro, 0)} · month-to-date`}
        >
          MTD{' '}
          <span className="font-mono tabular-nums font-semibold text-[var(--text)]">{formatMicro(mtdCostMicro)}</span>
          {budgetMicro !== null ? <span className="text-[var(--text-3)]"> / {formatMicro(budgetMicro, 0)}</span> : null}
        </span>
      </div>

      <button
        className="jepy-icon-btn relative"
        title="Notifications — open error log"
        aria-label="Notifications"
        onClick={() => navigate('/settings')}
      >
        <Bell size={17} aria-hidden="true" />
        {/* Red dot removed: was always-on (fake). Real error indicator needs
            errors_24h from API; add when D1 budget allows the extra polling. */}
      </button>

      <button
        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#10b981] to-[#7ed321] px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_4px_16px_rgba(16,185,129,.35)] transition-all hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(16,185,129,.45)]"
        title="Start a new capture run"
        onClick={() => navigate('/sources')}
      >
        <Zap size={15} aria-hidden="true" />
        New capture
      </button>

      <span className="hidden text-[11px] text-[var(--text-3)] xl:block" title={`Build ${BUILD_SHA}`}>
        {me?.email ?? '—'}
      </span>
    </header>
  );
}
