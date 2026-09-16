/**
 * Inline error state.
 *
 * Two levels: the code's message, then the `detail.reason` nuance for the six
 * codes that carry one. Retry appears only for the four retryable codes —
 * offering retry on a compliance block or a quota failure would coach the
 * operator into repeating an action that policy refuses, and on a circuit-open
 * message the back-off time comes from the API rather than being guessed here.
 */

import { AlertTriangle, RotateCw } from 'lucide-react';
import Button from './Button';
import type { PresentedError } from '../../hooks/useErrorMessage';

export interface ErrorStateProps {
  error: PresentedError;
  onRetry?: () => void;
  compact?: boolean;
}

export default function ErrorState({ error, onRetry, compact = false }: ErrorStateProps) {
  return (
    <div
      data-component="error-state"
      role="alert"
      className={`rounded-md border border-red-500/30 bg-red-500/10 ${compact ? 'p-2' : 'p-3'} space-y-1`}
    >
      <div className="flex items-start gap-2">
        <AlertTriangle size={13} className="mt-0.5 shrink-0 text-red-400" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-wide text-red-400">{error.code}</p>
          <p lang="bn" className="text-[13px] text-zinc-100">
            {error.message}
          </p>
          {error.reasonMessage ? (
            <p lang="bn" className="mt-0.5 text-[13px] text-zinc-400">
              {error.reasonMessage}
            </p>
          ) : null}
        </div>
        {error.retryable && onRetry ? (
          <Button
            variant="secondary"
            size="sm"
            icon={<RotateCw size={12} aria-hidden="true" />}
            onClick={onRetry}
          >
            Retry
          </Button>
        ) : null}
      </div>
    </div>
  );
}
