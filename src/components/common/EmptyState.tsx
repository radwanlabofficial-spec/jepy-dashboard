/**
 * Empty state.
 *
 * An empty state always names the next action, because a blank panel with no
 * direction is where an operator stops working. `centered` is used for a whole
 * page, e.g. the deliberately gated Captures page.
 */

import type { ReactNode } from 'react';
import Button from './Button';

export interface EmptyStateProps {
  title: string;
  hint?: ReactNode;
  icon?: ReactNode;
  action?: { label: string; onClick: () => void };
  centered?: boolean;
}

export default function EmptyState({ title, hint, icon, action, centered = false }: EmptyStateProps) {
  return (
    <div
      data-component="empty-state"
      className={
        centered
          ? 'mx-auto max-w-md text-center py-16 text-zinc-400 space-y-3'
          : 'py-8 text-center text-zinc-400 space-y-2'
      }
    >
      {icon ? <div className="flex justify-center text-zinc-500">{icon}</div> : null}
      <p className="text-[13px] text-zinc-300">{title}</p>
      {hint ? <p className="text-[13px] leading-relaxed">{hint}</p> : null}
      {action ? (
        <div className="flex justify-center pt-1">
          <Button variant="secondary" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
