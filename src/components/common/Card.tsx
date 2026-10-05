/**
 * Cards and sections — Jepy Bold v4 design.
 *
 * Light panels with soft shadows and rounded corners. Cards lift slightly on
 * hover to feel alive without being distracting.
 */

import type { ReactNode } from 'react';

export interface CardProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  /** `compact` is p-4, `standard` is p-6. */
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
  const pad = padding === 'none' ? 'p-0' : padding === 'compact' ? 'p-4' : 'p-6';
  return (
    <section
      data-component="card"
      className={`jepy-card jepy-enter ${className}`}
    >
      <div className={pad}>
        {title ? (
          <header className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-[15px] font-bold tracking-tight text-[var(--text)]" style={{ fontFamily: 'var(--disp)' }}>{title}</h2>
              {subtitle ? <p className="mt-0.5 text-[12px] leading-relaxed text-[var(--text-3)]">{subtitle}</p> : null}
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
          </header>
        ) : null}
        {children}
      </div>
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
    <section data-component="section" className={`space-y-4 ${className}`}>
      <header className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-bold tracking-tight text-[var(--text)]" style={{ fontFamily: 'var(--disp)' }}>{title}</h2>
          {description ? <p className="mt-0.5 text-[12px] text-[var(--text-3)]">{description}</p> : null}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}
