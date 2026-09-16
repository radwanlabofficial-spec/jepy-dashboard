/**
 * Lead temperature.
 *
 * Tier is a separate axis from status: it measures, it does not report health.
 * COLD is therefore never green and HOT is never red. A missing tier is not a
 * cold lead — it means probing is still running, so it renders a provisional chip
 * rather than a score of zero.
 */

import { Pin } from 'lucide-react';
import type { Tier as TierValue } from '../../lib/types';

const TIER_CLASSES: Record<TierValue, string> = {
  HOT: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  WARM: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  COLD: 'bg-zinc-800 text-zinc-400 border-zinc-700',
};

export interface TierProps {
  tier: TierValue | null;
  isProvisional?: boolean;
  pinned?: boolean;
  /** Shown beside the chip when the tier was held after a score drop. */
  pinNote?: string;
}

export default function Tier({ tier, isProvisional = false, pinned = false, pinNote }: TierProps) {
  if (isProvisional || tier === null) {
    return (
      <span
        data-component="tier-provisional"
        title="coverage is below 60% — a score exists, a tier does not"
        className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded border border-dashed border-amber-500/40 bg-amber-500/10 text-[10px] font-medium text-amber-400"
      >
        <i className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" aria-hidden="true" />
        probe running
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1">
      <span
        data-component="tier"
        title={`tier ${tier}`}
        className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-medium ${TIER_CLASSES[tier]}`}
      >
        {tier}
      </span>
      {pinned ? (
        <span title={pinNote ?? 'score dropped, tier held'}>
          <Pin size={11} className="text-zinc-500" aria-hidden="true" />
          <span className="sr-only">tier pinned</span>
        </span>
      ) : null}
    </span>
  );
}
