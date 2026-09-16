/**
 * Page header.
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
    <div data-component="page-header" className="mb-3 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold text-zinc-100">{title}</h1>
          {polling ? (
            <span
              title="refreshing in the background"
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400"
              aria-label="refreshing"
            />
          ) : null}
        </div>
        {description ? <p className="mt-0.5 text-[13px] text-zinc-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
