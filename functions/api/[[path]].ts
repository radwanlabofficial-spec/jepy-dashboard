/**
 * Pages Function — the bridge from the console to the Worker.
 *
 * Why this exists rather than a direct cross-origin call:
 *
 * The console is behind Cloudflare Access, so Cloudflare adds
 * `Cf-Access-Jwt-Assertion` to requests that reach this hostname. The Worker
 * lives on a different hostname that is deliberately NOT behind Access (cron and
 * GitHub Actions have no browser session), so a direct call from the browser to
 * the Worker would arrive with no assertion at all and be refused as
 * unauthenticated. Proxying through the console's own origin carries the header
 * across, and keeps the Access cookie on one hostname — no CORS, no second
 * login.
 *
 * It forwards and nothing else: no rewriting, no caching, no secrets. If this
 * file ever needs to know what an endpoint means, the endpoint belongs elsewhere.
 */

interface Env {
  /** Origin of the Jepy Worker, e.g. https://jepy-worker.radwanlab-official.workers.dev */
  API_ORIGIN: string;
}

export const onRequest = async (context: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = context;

  if (!env.API_ORIGIN) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: {
          code: 'E_INTERNAL',
          message: 'API_ORIGIN সেট করা নেই — Pages project-এর env var দেখুন',
        },
      }),
      { status: 500, headers: { 'content-type': 'application/json; charset=utf-8' } },
    );
  }

  const incoming = new URL(request.url);
  const target = new URL(incoming.pathname + incoming.search, env.API_ORIGIN);

  const headers = new Headers(request.headers);
  // The `host` header must reflect the target, and Cloudflare recomputes it from
  // the URL; passing the console's hostname through would make the Worker see a
  // request that looks like it came from a hostname it does not serve.
  headers.delete('host');

  const init: RequestInit = { method: request.method, headers, redirect: 'manual' };
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = request.body;
  }

  const response = await fetch(target.toString(), init);

  // Status and body are passed through untouched so the envelope the Worker
  // produced is exactly what the console parses — including a 401, which is what
  // swaps in the session-expired screen.
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
};
