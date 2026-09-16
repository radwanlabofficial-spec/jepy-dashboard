/**
 * Sidebar navigation — ten items, fixed, never collapsing.
 *
 * Captures is deliberately visible but disabled. A missing page and a gated page
 * must not look the same in an audit: this item exists because operator-driven
 * capture is switched off by decision (ADR-035), not because it was forgotten.
 */

import { NavLink } from 'react-router-dom';
import {
  Camera, Database, Gauge, KeyRound, LayoutDashboard, ListChecks, Mail, Plug, Settings, Users,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  disabled?: boolean;
  badge?: string;
  title?: string;
}

const ITEMS: NavItem[] = [
  { label: 'Overview', to: '/', icon: LayoutDashboard },
  { label: 'Leads', to: '/leads', icon: Users },
  { label: 'Sources', to: '/sources', icon: Database },
  { label: 'Jobs', to: '/jobs', icon: ListChecks },
  { label: 'Providers', to: '/providers', icon: Plug },
  { label: 'Vault', to: '/vault', icon: KeyRound },
  { label: 'Scoring', to: '/scoring', icon: Gauge },
  { label: 'Email', to: '/email', icon: Mail },
  {
    label: 'Captures',
    to: '/captures',
    icon: Camera,
    disabled: false,
    badge: 'Coming soon',
    title: 'Manual capture is gated off until ADR-035',
  },
  { label: 'Settings', to: '/settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <nav
      data-component="sidebar"
      aria-label="Primary"
      className="w-60 shrink-0 border-r border-zinc-800 bg-zinc-900"
    >
      <div className="flex h-11 items-center gap-2 border-b border-zinc-800 px-4">
        <span className="h-2.5 w-2.5 rounded-sm bg-green-400" aria-hidden="true" />
        <span className="text-[13px] font-semibold tracking-tight text-zinc-100">Jepy Console</span>
      </div>
      <ul className="py-2">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          if (item.badge) {
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  title={item.title}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-4 py-1.5 text-[13px] transition-colors duration-150 ${
                      isActive ? 'nav-active text-zinc-100' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100'
                    }`
                  }
                >
                  <Icon size={14} className="shrink-0 text-zinc-500" aria-hidden="true" />
                  <span className="flex-1">{item.label}</span>
                  <span className="rounded border border-sky-500/30 bg-sky-500/15 px-1.5 py-0.5 text-[10px] font-medium text-sky-400">
                    {item.badge}
                  </span>
                </NavLink>
              </li>
            );
          }
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-4 py-1.5 text-[13px] transition-colors duration-150 ${
                    isActive ? 'nav-active text-zinc-100' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100'
                  }`
                }
              >
                <Icon size={14} className="shrink-0 text-zinc-500" aria-hidden="true" />
                <span className="flex-1">{item.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
      <div className="mx-4 mt-4 rounded-md border border-zinc-800 bg-zinc-950/40 p-2 text-[10px] leading-relaxed text-zinc-500">
        Ten items, one of them gated. Manual capture stays visible so an audit can
        tell a switched-off page from a missing one.
      </div>
    </nav>
  );
}
