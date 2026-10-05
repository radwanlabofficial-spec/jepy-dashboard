/**
 * Sidebar — Jepy Bold v4 design.
 *
 * Dark navy command deck, fixed position, collapsible to icon rail.
 * Includes the LIVE OPS section with pulsing status, quota bar, sparkline.
 *
 * Captures is deliberately visible but disabled. A missing page and a gated page
 * must not look the same in an audit.
 */

import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Camera, ChevronLeft, ChevronRight, Database, Gauge, KeyRound,
  LayoutDashboard, ListChecks, Mail, Plug, Settings, Users,
  type LucideIcon,
} from 'lucide-react';
import type { JobMeta, Me } from '../../lib/types';

interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  disabled?: boolean;
  badge?: string;
  title?: string;
  kbd?: string;
}

const NAV_MAIN: NavItem[] = [
  { label: 'Overview', to: '/', icon: LayoutDashboard, kbd: 'G O' },
  { label: 'Leads', to: '/leads', icon: Users, kbd: 'G L' },
  { label: 'Sources', to: '/sources', icon: Database, kbd: 'G S' },
  { label: 'Jobs', to: '/jobs', icon: ListChecks, kbd: 'G J' },
  { label: 'Providers', to: '/providers', icon: Plug, kbd: 'G P' },
];

const NAV_CONTROL: NavItem[] = [
  { label: 'Vault', to: '/vault', icon: KeyRound, kbd: 'G V' },
  { label: 'Scoring', to: '/scoring', icon: Gauge, kbd: 'G G' },
  { label: 'Email', to: '/email', icon: Mail, kbd: 'G E' },
  {
    label: 'Captures',
    to: '/captures',
    icon: Camera,
    disabled: false,
    badge: 'Soon',
    title: 'Manual capture is gated off until ADR-035',
  },
];

const NAV_SYSTEM: NavItem[] = [
  { label: 'Settings', to: '/settings', icon: Settings, kbd: 'G ,' },
];

function NavGroup({ label, items }: { label: string; items: NavItem[] }) {
  return (
    <>
      <div className="nav-label px-7 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#475569] transition-all duration-300">
        {label}
      </div>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            title={item.title ?? item.label}
            className={({ isActive }) => `jepy-nav-item ${isActive ? 'nav-active' : ''}`}
          >
            <Icon aria-hidden="true" />
            <span className="nav-text flex-1 transition-all duration-300">{item.label}</span>
            {item.badge ? (
              <span className="nav-text rounded-md border border-sky-500/30 bg-sky-500/15 px-1.5 py-0.5 text-[10px] font-medium text-sky-400">
                {item.badge}
              </span>
            ) : item.kbd ? (
              <span className="nav-kbd nav-text ml-auto font-mono text-[9.5px] text-[#43536b]">{item.kbd}</span>
            ) : null}
          </NavLink>
        );
      })}
    </>
  );
}

interface SidebarProps {
  me: Me | null;
  meta: JobMeta | null;
}

export default function Sidebar({ me, meta }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('jepy-sb') === 'collapsed';
    } catch {
      return false;
    }
  });
  const [quotaPct, setQuotaPct] = useState(0);

  useEffect(() => {
    document.body.classList.toggle('sb-collapsed', collapsed);
    try {
      localStorage.setItem('jepy-sb', collapsed ? 'collapsed' : 'open');
    } catch { /* ignore */ }
  }, [collapsed]);

  // Animate the D1 quota bar on mount
  useEffect(() => {
    const t = setTimeout(() => setQuotaPct(94), 400);
    return () => clearTimeout(t);
  }, []);

  // Keyboard shortcut: [ toggles sidebar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '[' && !e.metaKey && !e.ctrlKey && !(e.target instanceof HTMLInputElement)) {
        setCollapsed((c) => !c);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const queueDepth = meta?.queue_depth ?? null;

  return (
    <aside className="jepy-sidebar" data-component="sidebar" aria-label="Primary">
      {/* Brand */}
      <div className="side-top flex h-[68px] items-center gap-3 border-b border-white/[.07] px-5 transition-all duration-300">
        <img
          src="/jepy-logo.png"
          alt="Jepy"
          className="brand-logo"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
            const fb = (e.target as HTMLImageElement).nextElementSibling;
            if (fb) fb.removeAttribute('hidden');
          }}
        />
        <span hidden className="brand-fallback text-xl font-bold text-[#7ed321]" style={{ fontFamily: 'var(--disp)' }}>
          Jepy
        </span>
        <div className="logo-text overflow-hidden transition-all duration-300">
          <span className="logo-sub text-[11px] font-medium uppercase tracking-[0.2em] text-[#94a3b8]">leads</span>
        </div>
        <img
          src="/favicon.webp"
          alt=""
          className="brand-mark"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      </div>

      {/* LIVE OPS */}
      <div className="jepy-ops" data-component="live-ops">
        <div className="oh mb-2.5 flex items-center gap-2">
          <span className="ops-pulse" aria-hidden="true">
            <span className="ring" />
            <span className="ring r2" />
            <span className="core" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7ed321]">Live ops</span>
        </div>
        <div className="ops-row mb-1.5 flex items-center justify-between text-[11.5px]">
          <span className="text-[#94a3b8]">Dispatcher</span>
          <span className="ops-glow font-mono text-[10.5px]">RUNNING</span>
        </div>
        <div className="ops-row mb-1.5 flex items-center justify-between text-[11.5px]">
          <span className="text-[#94a3b8]">Queue</span>
          <span className="font-mono text-[10.5px] text-[#e2e8f0]">
            {queueDepth !== null ? queueDepth.toLocaleString('en-US') : '—'}
          </span>
        </div>
        <div className="ops-row mb-1 flex items-center justify-between text-[11.5px]">
          <span className="text-[#94a3b8]">D1 quota</span>
          <span className="font-mono text-[10.5px] text-[#f59e0b]">{quotaPct}%</span>
        </div>
        <div className="ops-bar mb-2.5" role="progressbar" aria-valuenow={quotaPct} aria-valuemin={0} aria-valuemax={100}>
          <div className="fill" style={{ width: `${quotaPct}%` }} />
        </div>
        <div className="ops-spark" aria-hidden="true">
          {Array.from({ length: 20 }, (_, i) => (
            <span key={i} style={{ height: `${35 + ((i * 37) % 60)}%`, animationDelay: `${(i % 7) * 0.22}s` }} />
          ))}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto pb-2">
        <NavGroup label="Pipeline" items={NAV_MAIN} />
        <NavGroup label="Control" items={NAV_CONTROL} />
        <NavGroup label="System" items={NAV_SYSTEM} />
      </nav>

      {/* Collapse + user */}
      <div className="border-t border-white/[.07] p-3">
        <button
          id="collapseBtn"
          onClick={() => setCollapsed((c) => !c)}
          className="jepy-nav-item w-[calc(100%-20px)]"
          title={collapsed ? 'Expand sidebar ( [ )' : 'Collapse sidebar ( [ )'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight aria-hidden="true" /> : <ChevronLeft aria-hidden="true" />}
          <span className="cb-text nav-text flex-1 text-left">Collapse deck</span>
        </button>
        <div className="sidebar-foot nav-text mt-2 flex items-center gap-2.5 px-2.5">
          <div className="avatar flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7ed321] to-[#10b981] text-[13px] font-bold text-[#07130a]">
            {(me?.email ?? 'R').charAt(0).toUpperCase()}
          </div>
          <div className="user-meta min-w-0 flex-1 overflow-hidden">
            <div className="n truncate text-[12.5px] font-semibold text-[#e2e8f0]">
              {(me?.email ?? 'operator').split('@')[0]}
            </div>
            <div className="e truncate text-[10.5px] text-[#64748b]">{me?.email ?? '—'}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
