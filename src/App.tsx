/**
 * Router and application shell.
 *
 * Layout is fixed sidebar + fixed topbar + one scrolling content area, so the
 * chrome never leaves the screen. There is no responsive breakpoint anywhere and
 * that is a decision, not an omission: a fourteen-column hop table has no honest
 * mobile presentation, and pretending otherwise means maintaining two layouts.
 */

import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import AttributionFooter from './components/layout/AttributionFooter';
import Button from './components/common/Button';
import { api, setUnauthenticatedHandler } from './lib/api';
import { CASH_GUARD_MICRO } from './lib/constants';
import { useQuery } from './hooks/useApi';
import type { JobMeta, Me } from './lib/types';
import NotFoundPage from './pages/NotFoundPage';
import OverviewPage from './features/overview';
import LeadsPage from './features/leads';
import LeadDetailPage from './features/leads/LeadDetail';
import SourcesPage from './features/sources';
import JobsPage from './features/jobs';
import ProvidersPage from './features/providers';
import VaultPage from './features/vault';
import ScoringPage from './features/scoring';
import EmailPage from './features/email';
import CapturesPage from './features/captures';
import SettingsPage from './features/settings';

function SessionExpired() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="max-w-sm space-y-3 rounded-md border border-zinc-800 bg-zinc-900 p-4 text-center">
        <h1 className="text-base font-semibold text-zinc-100">Session ended</h1>
        <p lang="bn" className="text-[13px] text-zinc-400">
          সেশন শেষ — আবার login করুন
        </p>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Reload
        </Button>
      </div>
    </div>
  );
}

function Shell() {
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    setUnauthenticatedHandler(() => setSessionExpired(true));
  }, []);

  const me = useQuery<Me>('me', () => api.me(), { staleTime: 5 * 60_000 });
  const meta = useQuery<JobMeta>('jobs:meta', () => api.jobs.meta(), { staleTime: 5_000, pollMs: 10_000 });
  const stats = useQuery('leads:stats', () => api.leads.stats(), { staleTime: 5_000, pollMs: 30_000 });

  if (sessionExpired) return <SessionExpired />;

  return (
    <div className="flex min-h-screen min-w-[1280px] bg-zinc-950">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          me={me.data}
          meta={meta.data}
          mtdCostMicro={stats.data?.mtd_cost_micro ?? null}
          budgetMicro={stats.data?.mtd_budget_micro ?? null}
          cashGuardMicro={CASH_GUARD_MICRO}
        />
        <main className="flex-1 overflow-y-auto p-4" data-component="page-content">
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/leads/:id" element={<LeadDetailPage />} />
            <Route path="/sources" element={<SourcesPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/providers" element={<ProvidersPage />} />
            <Route path="/vault" element={<VaultPage />} />
            <Route path="/scoring" element={<ScoringPage />} />
            <Route path="/email" element={<EmailPage />} />
            <Route path="/captures" element={<CapturesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/overview" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <AttributionFooter />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
