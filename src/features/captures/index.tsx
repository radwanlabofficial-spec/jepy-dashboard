/**
 * Captures — deliberately gated off in this build.
 *
 * There is no table, no action and no API call here, and that is the whole point:
 * operator-driven capture is waiting on ADR-035, and shipping a half-built ingest
 * surface would mean releasing a gated feature that has never been tested. The
 * route stays visible in the navigation so an audit can distinguish a
 * switched-off page from a page nobody wrote.
 */

import { Lock } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import EmptyState from '../../components/common/EmptyState';

export default function CapturesPage() {
  return (
    <div data-component="captures-page">
      <PageHeader
        title="Captures"
        description="Operator-driven capture is not enabled in this build."
      />
      <EmptyState
        centered
        icon={<Lock size={20} aria-hidden="true" />}
        title="Manual capture is not enabled yet."
        hint={
          <>
            Which domains may be captured under Mode B is still to be decided in ADR-035.
            Until then the Class C sources stay reachable by hand from Sources, and nothing
            on this page will call the API.
          </>
        }
      />
    </div>
  );
}
