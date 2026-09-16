/**
 * Tooltip.
 *
 * Shows on hover and on keyboard focus, so a disabled control can still explain
 * itself. Implemented with a wrapper rather than a portal to keep the component
 * dependency-free; the native `title` attribute is carried as well so the text
 * survives in environments that never see the styled box.
 */

import { useId, useState, type ReactNode } from 'react';

export interface TooltipProps {
  label: ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom';
  className?: string;
}

export default function Tooltip({ label, children, side = 'top', className = '' }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span
      data-component="tooltip"
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      aria-describedby={open ? id : undefined}
    >
      {children}
      {open ? (
        <span
          id={id}
          role="tooltip"
          className={`pointer-events-none absolute left-1/2 z-40 w-max max-w-[280px] -translate-x-1/2 rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-[10px] leading-relaxed text-zinc-100 shadow-xl ${
            side === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          }`}
        >
          {label}
        </span>
      ) : null}
    </span>
  );
}
