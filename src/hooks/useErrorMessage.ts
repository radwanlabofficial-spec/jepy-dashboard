/**
 * Error presentation.
 *
 * Branching always happens on `error.code`; `error.detail.reason` only refines
 * the message for the six codes that carry one (13 §10.1). Retry is offered for
 * exactly four codes — offering it on a compliance, quota or gate error would
 * invite the operator to repeat an action that is refused by policy.
 */

import { ERROR_MESSAGES, REASON_MESSAGES, RETRYABLE_CODES, REASON_CODES } from '../lib/constants';
import { ApiFailure } from '../lib/api';

export interface PresentedError {
  code: string;
  message: string;
  reason: string | null;
  reasonMessage: string | null;
  retryable: boolean;
}

export function presentError(error: ApiFailure | null): PresentedError | null {
  if (!error) return null;
  const reason = error.detail?.reason ?? null;
  const showReason = reason !== null && REASON_CODES.includes(error.code);
  return {
    code: error.code,
    message: ERROR_MESSAGES[error.code] ?? error.message,
    reason,
    reasonMessage: showReason ? (REASON_MESSAGES[reason] ?? null) : null,
    retryable: RETRYABLE_CODES.includes(error.code),
  };
}

export function useErrorMessage(error: ApiFailure | null): PresentedError | null {
  return presentError(error);
}
