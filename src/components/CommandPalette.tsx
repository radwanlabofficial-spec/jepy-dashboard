/**
 * CommandPalette — ⌘K command deck for the Jepy console.
 *
 * Opens on Cmd/Ctrl+K or the `jepy:palette` window event (dispatched by the
 * Topbar search trigger). Linear/Raycast-style: fuzzy filter as you type,
 * arrow-key navigation, Enter to run, Esc to close.
 *
 * Groups: Navigation (react-router) and Actions (event-driven toggles, same
 * events the Topbar buttons use, so one code path owns each toggle).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera, Database, Gauge, KeyRound, LayoutDashboard, ListChecks, Mail, Plug,
  Settings, Users, Moon, Rows3, PanelLeft, Zap, Plus,
  type LucideIcon,
} from 'lucide-react';

interface Command {
  group: 'Navigation' | 'Actions';
  title: string;
  hint?: string;
  icon: LucideIcon;
  run: () => void;
}

/** Subsequence fuzzy match: query chars must appear in order in the target. */
function fuzzyMatch(query: string, target: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

const NAV_ITEMS: { label: string; to: string; icon: LucideIcon; hint: string }[] = [
  { label: 'Go to Overview', to: '/', icon: LayoutDashboard, hint: 'G O' },
  { label: 'Go to Leads', to: '/leads', icon: Users, hint: 'G L' },
  { label: 'Go to Sources', to: '/sources', icon: Database, hint: 'G S' },
  { label: 'Go to Jobs', to: '/jobs', icon: ListChecks, hint: 'G J' },
  { label: 'Go to Providers', to: '/providers', icon: Plug, hint: 'G P' },
  { label: 'Go to Vault', to: '/vault', icon: KeyRound, hint: 'G V' },
  { label: 'Go to Scoring', to: '/scoring', icon: Gauge, hint: 'G G' },
  { label: 'Go to Email', to: '/email', icon: Mail, hint: 'G E' },
  { label: 'Go to Captures', to: '/captures', icon: Camera, hint: 'G C' },
  { label: 'Go to Settings', to: '/settings', icon: Settings, hint: 'G ,' },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selIdx, setSelIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const commands: Command[] = useMemo(() => [
    ...NAV_ITEMS.map((n) => ({
      group: 'Navigation' as const,
      title: n.label,
      hint: n.hint,
      icon: n.icon,
      run: () => navigate(n.to),
    })),
    {
      group: 'Actions',
      title: 'Toggle sidebar',
      hint: '[',
      icon: PanelLeft,
      run: () => window.dispatchEvent(new CustomEvent('jepy:sidebar-toggle')),
    },
    {
      group: 'Actions',
      title: 'Toggle density (compact / comfortable)',
      icon: Rows3,
      run: () => window.dispatchEvent(new CustomEvent('jepy:density-toggle')),
    },
    {
      group: 'Actions',
      title: 'Toggle Night Ops mode',
      hint: 'N',
      icon: Moon,
      run: () => window.dispatchEvent(new CustomEvent('jepy:night-toggle')),
    },
    {
      group: 'Actions',
      title: 'Add credential',
      hint: 'vault',
      icon: KeyRound,
      run: () => navigate('/vault'),
    },
    {
      group: 'Actions',
      title: 'Register device',
      hint: 'extension',
      icon: Plus,
      run: () => navigate('/settings'),
    },
    {
      group: 'Actions',
      title: 'Open scoring',
      icon: Zap,
      run: () => navigate('/scoring'),
    },
  ], [navigate]);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return commands;
    return commands.filter((c) => fuzzyMatch(q, c.title) || fuzzyMatch(q, c.group));
  }, [commands, query]);

  const openPalette = useCallback(() => {
    setQuery('');
    setSelIdx(0);
    setOpen(true);
  }, []);

  const closePalette = useCallback(() => setOpen(false), []);

  // Open triggers: ⌘K / Ctrl+K and the `jepy:palette` event from the Topbar.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const inInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => (o ? false : true));
        if (!open) {
          setQuery('');
          setSelIdx(0);
        }
        return;
      }
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        closePalette();
        return;
      }
      if (open && !inInput) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelIdx((i) => Math.min(i + 1, filtered.length - 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelIdx((i) => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && filtered[selIdx]) {
          e.preventDefault();
          const cmd = filtered[selIdx];
          closePalette();
          cmd.run();
        }
      }
    };
    const onPaletteEvent = () => openPalette();
    window.addEventListener('keydown', onKey);
    window.addEventListener('jepy:palette', onPaletteEvent);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('jepy:palette', onPaletteEvent);
    };
  }, [open, filtered, selIdx, closePalette, openPalette]);

  // Focus the input when the palette opens.
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [open ]);

  // Keep the selection inside the filtered list.
  useEffect(() => {
    setSelIdx((i) => Math.min(i, Math.max(filtered.length - 1, 0)));
  }, [filtered.length]);

  if (!open) return null;

  let lastGroup = '';

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]"
      style={{ background: 'rgba(5,8,16,.55)', backdropFilter: 'blur(10px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) closePalette(); }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-label="Command palette"
        className="relative w-[min(660px,93vw)] overflow-hidden rounded-[22px]"
        style={{
          background: 'linear-gradient(180deg,#111a30,#0a0f1e)',
          boxShadow: '0 40px 100px rgba(0,0,0,.6)',
          border: '1px solid rgba(16,185,129,.25)',
          animation: 'jepy-pal-in .22s cubic-bezier(.16,1,.3,1)',
        }}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5 shrink-0 text-slate-400">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelIdx(0); }}
            onKeyDown={(e) => {
              // Input-level handling so typing never conflicts with global keys.
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelIdx((i) => Math.min(i + 1, filtered.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelIdx((i) => Math.max(i - 1, 0));
              } else if (e.key === 'Enter' && filtered[selIdx]) {
                e.preventDefault();
                const cmd = filtered[selIdx];
                closePalette();
                cmd.run();
              }
            }}
            placeholder="Type a command or search…"
            autoComplete="off"
            className="w-full bg-transparent text-[15px] text-slate-100 outline-none placeholder:text-slate-500"
            aria-label="Command search"
          />
          <kbd className="rounded-md border border-white/15 bg-white/5 px-2 py-1 font-mono text-[10px] text-slate-400">esc</kbd>
        </div>

        <div className="max-h-[320px] overflow-y-auto p-2" role="listbox" aria-label="Commands">
          {filtered.length === 0 && (
            <div className="px-4 py-6 text-center text-[13px] text-slate-500">No matching commands</div>
          )}
          {filtered.map((cmd, i) => {
            const Icon = cmd.icon;
            const showGroup = cmd.group !== lastGroup;
            lastGroup = cmd.group;
            const selected = i === selIdx;
            return (
              <div key={`${cmd.group}-${cmd.title}`}>
                {showGroup && (
                  <div className="px-3 pb-1 pt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                    {cmd.group}
                  </div>
                )}
                <button
                  role="option"
                  aria-selected={selected}
                  onClick={() => { closePalette(); cmd.run(); }}
                  onMouseMove={() => setSelIdx(i)}
                  ref={selected ? (el) => el?.scrollIntoView({ block: 'nearest' }) : undefined}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13.5px] transition-colors ${
                    selected ? 'bg-emerald-500/15 text-white' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <Icon size={16} className={selected ? 'text-emerald-400' : 'text-slate-500'} aria-hidden="true" />
                  <span className="flex-1">{cmd.title}</span>
                  {cmd.hint && (
                    <kbd className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
                      {cmd.hint}
                    </kbd>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4 border-t border-white/10 px-5 py-3 text-[11px] text-slate-500">
          <span><b className="text-slate-300">↑↓</b> navigate</span>
          <span><b className="text-slate-300">↵</b> select</span>
          <span><b className="text-slate-300">esc</b> close</span>
          <span className="ml-auto"><b className="text-slate-300">⌘K</b> Jepy command deck</span>
        </div>
      </div>

      <style>{`@keyframes jepy-pal-in { from { opacity: 0; transform: translateY(-14px) scale(.97); } to { opacity: 1; transform: translateY(0) scale(1); } }`}</style>
    </div>
  );
}
