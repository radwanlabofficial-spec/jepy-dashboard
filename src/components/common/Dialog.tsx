/**
 * Dialog.
 *
 * Hand-written rather than pulled from a component library: the design system
 * permits exactly four primitives from shadcn and this build ships zero extra
 * dependencies, so the primitive is implemented directly. It keeps the two
 * behaviours that matter — Escape closes, and focus is trapped inside while open
 * — plus `shadow-xl`, the only shadow in the product, because a dialog is the one
 * place where elevation is genuine information.
 */

import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

export interface DialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  /** Destructive dialogs state the consequence, so they get more width. */
  width?: 'sm' | 'md' | 'lg';
  /** Optional step indicator; the current dot is one of the five green uses. */
  step?: { current: number; total: number };
}

export default function Dialog({ open, title, onClose, children, footer, width = 'md', step }: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    const previous = document.activeElement as HTMLElement | null;
    window.setTimeout(() => panelRef.current?.querySelector<HTMLElement>('input, button')?.focus(), 0);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previous?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const widthClass = width === 'sm' ? 'max-w-sm' : width === 'lg' ? 'max-w-3xl' : 'max-w-xl';

  return (
    <div data-component="dialog" className="fixed inset-0 z-50 flex items-start justify-center pt-16">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-zinc-950/70"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative w-full ${widthClass} rounded-md border border-zinc-700 bg-zinc-900 shadow-xl`}
      >
        <header className="flex items-center justify-between gap-3 border-b border-zinc-800 px-4 py-2.5">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-medium text-zinc-100">{title}</h2>
            {step ? (
              <span className="flex items-center gap-1" title={`step ${step.current} of ${step.total}`}>
                {Array.from({ length: step.total }).map((_, index) => (
                  <i
                    key={index}
                    className={`h-1.5 w-1.5 rounded-full ${index + 1 === step.current ? 'bg-green-400' : 'bg-zinc-700'}`}
                  />
                ))}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="text-zinc-500 transition-colors duration-150 hover:text-zinc-100"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </header>
        <div className="px-4 py-3">{children}</div>
        {footer ? <footer className="flex items-center justify-end gap-2 border-t border-zinc-800 px-4 py-2.5">{footer}</footer> : null}
      </div>
    </div>
  );
}
