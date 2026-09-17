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
  /** Origin of the Jepy Worker. Overrides the default below when set. */
  API_ORIGIN?: string;
}

/**
 * The default exists because the Pages settings API silently drops
 * `deployment_configs.production.env_vars`: the PATCH reports success and the
 * value lands under `preview`, so the production build never sees it. Rather
 * than depend on a setting that cannot be stored, the origin lives here — the
 * same reasoning that moved the build configuration into wrangler.toml and the
 * console's API mode into .env.production. It is a public hostname, not a secret.
 */
const DEFAULT_API_ORIGIN = 'https://jepy-worker.radwanlab-official.workers.dev';

export const onRequest = async (context: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = context;
  const origin = (env.API_ORIGIN ?? DEFAULT_API_ORIGIN).trim();

  if (!origin) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: { code: 'E_INTERNAL', message: 'API origin is not configured' },
      }),
      { status: 500, headers: { 'content-type': 'application/json; charset=utf-8' } },
    );
  }

  const incoming = new URL(request.url);
  const target = new URL(incoming.pathname + incoming.search, origin);

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
