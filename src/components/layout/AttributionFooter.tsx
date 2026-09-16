/**
 * Attribution footer.
 *
 * A licence condition, not a courtesy: Overture data is CDLA-Permissive 2.0 and
 * Foursquare OS Places is Apache-2.0. It is permanently visible and is deliberately
 * NOT colour-suppressed to the point of invisibility, because a hidden attribution
 * is the same as a missing one.
 */

import { ATTRIBUTION } from '../../lib/constants';

export default function AttributionFooter() {
  return (
    <footer
      data-component="attribution-footer"
      className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-zinc-800 px-1 pt-3 text-[10px] text-zinc-500"
    >
      <span>Place data:</span>
      {ATTRIBUTION.map((entry) => (
        <a
          key={entry.label}
          href={entry.href}
          target="_blank"
          rel="noreferrer noopener"
          className="underline decoration-zinc-700 underline-offset-2 transition-colors duration-150 hover:text-zinc-300"
        >
          {entry.label} ({entry.licence})
        </a>
      ))}
      <span className="text-zinc-600">ODbL-derived fields are export-gated.</span>
    </footer>
  );
}
