/**
 * Cards and sections.
 *
 * Flat by design: a card is a grouping device, not a clickable object, so it has
 * no hover state and no shadow. Depth in this console comes from the surface
 * scale and hairlines, because on a near-black background a shadow only produces
 * haze.
 */

import type { ReactNode } from 'react';

export interface CardProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  /** `compact` is p-3, `standard` is p-4. */
  padding?: 'compact' | 'standard' | 'none';
  className?: string;
}

export default function Card({
  title,
  subtitle,
  action,
  children,
  padding = 'standard',
  className = '',
}: CardProps) {
  const pad = padding === 'none' ? '' : padding === 'compact' ? 'p-3' : 'p-4';
  return (
    <section
      data-component="card"
      className={`bg-zinc-900 border border-zinc-800 rounded-md ${className}`}
    >
      {title ? (
        <header className="flex items-center justify-between gap-3 px-3 pt-3">
          <div className="min-w-0">
            <h2 className="text-sm font-medium text-zinc-100 truncate">{title}</h2>
            {subtitle ? <p className="text-[10px] text-zinc-500 truncate">{subtitle}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      ) : null}
      <div className={pad || undefined}>{children}</div>
    </section>
  );
}

export interface SectionProps {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Section({ title, description, action, children, className = '' }: SectionProps) {
  return (
    <section data-component="section" className={`space-y-3 ${className}`}>
      <header className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium text-zinc-100">{title}</h2>
          {description ? <p className="text-[10px] text-zinc-500 mt-0.5">{description}</p> : null}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}
