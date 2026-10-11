/**
 * Multi-account switcher for Cloudflare D1 quota distribution.
 * Allows switching between 6 Cloudflare accounts (30M reads/day total).
 * Account 1 = Primary (source of truth), Accounts 2-6 = overflow.
 */
import { useState } from 'react';

interface CfAccount {
  id: string;
  label: string;
  email: string;
  workerUrl: string;
  quota: string;
}

// Configured via environment or defaults; worker URLs filled after deployment
const ACCOUNTS: CfAccount[] = [
  { id: '1', label: 'Primary', email: 'Radwanlab.official@gmail.com', workerUrl: 'https://jepy-worker.radwanlab-official.workers.dev', quota: '5M/day' },
  { id: '2', label: 'Account 2', email: 'Urban.edge.inc.official@gmail.com', workerUrl: 'https://jepy-worker-2.urban-edge-inc-official.workers.dev', quota: '5M/day' },
  { id: '3', label: 'Account 3', email: 'Radwanislamb18@gmail.com', workerUrl: 'https://jepy-worker-3.radwanislamb18.workers.dev', quota: '5M/day' },
  { id: '4', label: 'Account 4', email: 'Maikkruger68@gmail.com', workerUrl: 'https://jepy-worker-4.maikkruger68.workers.dev', quota: '5M/day' },
  { id: '5', label: 'Account 5', email: 'Rwan6292@gmail.com', workerUrl: 'https://jepy-worker-5.rwan6292.workers.dev', quota: '5M/day' },
  { id: '6', label: 'Account 6', email: 'Mosfikurrohim05@gmail.com', workerUrl: 'https://jepy-worker-6.mosfikurrohim05.workers.dev', quota: '5M/day' },
];

const STORAGE_KEY = 'jepy:cf-account';

export function getActiveAccount(): CfAccount {
  const saved = localStorage.getItem(STORAGE_KEY);
  return ACCOUNTS.find(a => a.id === saved) ?? ACCOUNTS[0];
}

export function setActiveAccount(id: string) {
  localStorage.setItem(STORAGE_KEY, id);
  window.location.reload(); // Reload to switch API base
}

export default function AccountSwitcher() {
  const [open, setOpen] = useState(false);
  const active = getActiveAccount();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-md border border-[var(--border)] bg-[var(--panel)] px-2 py-0.5 text-[14px] hover:text-[var(--text)]"
        title={`Active: ${active.email} (${active.quota})`}
      >
        ☁️
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-64 rounded-lg border border-[var(--border)] bg-[var(--panel)] p-1 shadow-lg">
          <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-3)]">
            Cloudflare Account (30M/day total)
          </div>
          {ACCOUNTS.map(acc => (
            <button
              key={acc.id}
              onClick={() => { setActiveAccount(acc.id); setOpen(false); }}
              disabled={!acc.workerUrl && acc.id !== '1'}
              className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-[12px] hover:bg-[var(--hover)] disabled:opacity-40 ${
                acc.id === active.id ? 'font-semibold text-[var(--text)]' : 'text-[var(--text-2)]'
              }`}
            >
              <span>
                {acc.id === active.id ? '✓ ' : ''}{acc.label}
                <span className="block text-[10px] text-[var(--text-3)]">{acc.email}</span>
              </span>
              <span className="text-[10px] text-[var(--text-3)]">
                {acc.workerUrl ? acc.quota : 'pending'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
