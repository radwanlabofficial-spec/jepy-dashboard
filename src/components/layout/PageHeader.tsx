/**
 * Page header — Jepy Bold v4 design.
 *
 * The page title on the left and that page's actions on the right. No breadcrumb
 * (there is no nesting) and no global search box (each page owns its filters).
 */

import type { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  /** Shows the small pulsing dot while a background poll is in flight. */
  polling?: boolean;
}

export default function PageHeader({ title, description, actions, polling = false }: PageHeaderProps) {
  return (
    <div data-component="page-header" className="jepy-enter mb-5 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <h1 className="text-[22px] font-bold tracking-tight text-[var(--text)]" style={{ fontFamily: 'var(--disp)' }}>{title}</h1>
          {polling ? (
            <span
              title="refreshing in the background"
              className="relative flex h-2 w-2"
              aria-label="refreshing"
            >
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
          ) : null}
        </div>
        {description ? <p className="mt-1 text-[13px] text-[var(--text-2)]">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
