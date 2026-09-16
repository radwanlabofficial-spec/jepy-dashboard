import { Link } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState';

export default function NotFoundPage() {
  return (
    <div data-component="not-found">
      <EmptyState
        centered
        title="That route does not exist"
        hint="The console has exactly eleven routes: the ten in the sidebar and a lead detail page."
      />
      <div className="flex justify-center">
        <Link
          to="/"
          className="text-[13px] text-zinc-400 underline decoration-zinc-700 underline-offset-2 transition-colors duration-150 hover:text-zinc-100"
        >
          Back to Overview
        </Link>
      </div>
    </div>
  );
}
