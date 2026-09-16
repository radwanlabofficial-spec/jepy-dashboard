/**
 * Quota bar.
 *
 * A healthy fill is NOT green. Nine bars sit side by side on the Providers page
 * and eight of them are healthy; eight grey bars let the single amber one catch
 * the eye, whereas eight green bars make the operator hunt. The bar's job is to
 * show what is running out, not to announce that nothing is.
 */

import Num from './Num';
import { formatNumber } from '../../lib/format';

interface Step {
  className: string;
  label: string;
}

const STEP_NEUTRAL: Step = { className: 'bg-zinc-600', label: 'under 70%' };
const STEP_WARN: Step = { className: 'bg-amber-400', label: '70-90%' };
const STEP_CRITICAL: Step = { className: 'bg-red-400', label: 'over 90%' };

function stepFor(pct: number): Step {
  if (pct > 90) return STEP_CRITICAL;
  if (pct >= 70) return STEP_WARN;
  return STEP_NEUTRAL;
}

export interface QuotaMarker {
  atPct: number;
  label: string;
}

export interface QuotaBarProps {
  used: number;
  limit: number;
  /** e.g. the BrightData 1800/day guard and the 70% monthly line. */
  markers?: QuotaMarker[];
  compact?: boolean;
}

export default function QuotaBar({ used, limit, markers = [], compact = false }: QuotaBarProps) {
  const safeLimit = limit > 0 ? limit : 0;
  const pct = safeLimit === 0 ? 0 : Math.min(100, (used / safeLimit) * 100);
  const step = stepFor(pct);
  const clampedWidth = `${Math.max(0, Math.min(100, pct))}%`;

  return (
    <div data-component="quota-bar" className="w-full">
      <div className="relative h-1 rounded-full bg-zinc-800 overflow-visible">
        <div className={`absolute inset-y-0 left-0 rounded-full ${step.className}`} style={{ width: clampedWidth }} />
        {markers.map((marker) => (
          <div
            key={marker.label}
            title={marker.label}
            className="absolute -top-0.5 h-2 w-px bg-zinc-500"
            style={{ left: `${Math.max(0, Math.min(100, marker.atPct))}%` }}
          />
        ))}
      </div>
      {!compact ? (
        <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-500">
          <span className="uppercase tracking-wide">{step.label}</span>
          <Num value={used} format={formatNumber} unit={`/ ${formatNumber(limit)}`} />
        </div>
      ) : (
        <div className="mt-1 text-[10px] text-zinc-500">
          <Num value={used} format={formatNumber} unit={`/ ${formatNumber(limit)}`} />
        </div>
      )}
    </div>
  );
}
