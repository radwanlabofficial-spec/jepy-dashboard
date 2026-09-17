/**
 * Crash boundary.
 *
 * Without one, a single bad value anywhere in a tree unmounts the entire
 * application: React throws during render, the root goes empty, and the operator
 * sees a black page with no way to tell a crash from a slow load or a lost
 * session. That is exactly what happened when the API returned an object where a
 * page expected an array.
 *
 * It is deliberately placed around the page content rather than the whole app, so
 * the sidebar and topbar survive: the operator can navigate away from the broken
 * page instead of reloading to escape it, and the chrome keeps showing which
 * build and which environment they are looking at.
 *
 * The message shown is the raw error text. It is an internal console used by one
 * person, and hiding it would cost the only clue available while adding no
 * security — the data is already behind Cloudflare Access.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Shown instead of the generic line, e.g. the page name. */
  where?: string;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // Console only. There is no client-side log sink by design: the browser
    // bundle carries no credentials and cannot write to D1.
    console.error('[jepy-console] render failed', this.props.where ?? '', error, info.componentStack);
  }

  override render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div data-component="error-boundary" className="mx-auto max-w-2xl py-8">
        <div className="rounded-md border border-red-900/60 bg-red-950/30 p-4">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-red-400" aria-hidden>
              ▲
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium text-red-300">
                This page failed to render{this.props.where ? ` — ${this.props.where}` : ''}
              </div>
              <div className="mt-1 text-[12px] leading-relaxed text-zinc-400">
                The rest of the console still works. Usually this means the API answered with a shape this page did not
                expect, so the message below is the useful part.
              </div>
              <pre className="mt-3 max-h-40 overflow-auto rounded border border-zinc-800 bg-zinc-950 p-2 font-mono text-[11px] text-red-300">
                {error.message}
              </pre>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="h-7 rounded border border-zinc-700 bg-zinc-800 px-2 text-[13px] text-zinc-200 hover:bg-zinc-700"
                  onClick={() => this.setState({ error: null })}
                >
                  Try again
                </button>
                <button
                  type="button"
                  className="h-7 rounded border border-zinc-700 bg-zinc-800 px-2 text-[13px] text-zinc-200 hover:bg-zinc-700"
                  onClick={() => window.location.reload()}
                >
                  Reload
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
