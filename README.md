# Jepy Console

The internal operator dashboard for the Jepy Leads pipeline: a dark-only, desktop
console for a worldwide B2B lead-generation system. Ten pages, one operator.

Built to the project's own contracts — `13-ui-contract.md` v7.2 for page-to-endpoint
wiring and `13a-design-system.md` v2 for every visual value. Where the two ever
disagree, the design system wins.

## Stack

- Vite 5 + React 18 + TypeScript (`.tsx`), built as a static SPA
- Tailwind CSS v3 with core utilities only — no config extension beyond the two
  font families, no arbitrary values
- `react-router-dom` (BrowserRouter) + `lucide-react`
- No UI library, no animation library, no state library, no Supabase

Deliberate omissions, with reasons:

- **No query library.** The three behaviours actually needed — a stale window, an
  optional polling interval, invalidation after a mutation — are implemented in
  `src/hooks/useApi.ts` in about a hundred lines. Only two surfaces poll (Jobs at
  10s, the Overview queue and credit cards at 30s).
- **No component library.** The four primitives the design system permits are
  hand-written (`Dialog`, `Tooltip`, `Toast`, plus the table and card set), which
  keeps the dependency list at four runtime packages.

## Running it

```bash
npm install
npm run dev      # http://127.0.0.1:5173
npm run build    # static output in dist/
```

### Demo mode and the API

The console reads `VITE_API_BASE`. When it is empty or unset the app runs against
bundled fixtures in `src/lib/demo.ts` and shows a permanent **Demo data** chip in
the top bar, so demo rows can never be mistaken for pipeline output.

Set it to the deployed Worker origin to talk to the real API:

```
VITE_API_BASE=https://api.example.com
```

Authentication is entirely Cloudflare Access; the browser carries the Access cookie
via `credentials: 'include'`. There is no login form, no user table and **no
credential of any kind in this repository or in the built bundle**.

Every network call in the app goes through `src/lib/api.ts`, which owns envelope
unwrapping, the Access cookie, `Idempotency-Key` generation and error
normalisation. Nothing else calls `fetch`.

## Layout

```
src/
├── main.tsx                    entry point
├── App.tsx                     router + shell (fixed sidebar, fixed topbar, one scroll region)
├── styles.css                  @tailwind directives, the five --jepy-* variables, @font-face
├── lib/
│   ├── api.ts                  the single fetch boundary
│   ├── types.ts                response envelope and entities
│   ├── constants.ts            closed 19-code error map, reason map, limits
│   ├── format.ts               time, money, quota, latency, relative time
│   └── demo.ts                 fixtures for demo mode
├── hooks/
│   ├── useApi.ts               query cache + mutation runner
│   └── useErrorMessage.ts      error.code (+ detail.reason) to a Bengali message
├── components/
│   ├── common/                 StatusPill, Tier, Num, QuotaBar, Card, DataTable,
│   │                           Tabs, Dialog, Tooltip, Toast, EmptyState, ErrorState,
│   │                           Skeleton, CopyOnceField, Button
│   └── layout/                 Sidebar, Topbar, PageHeader, AttributionFooter
└── features/                   one directory per page
    overview  leads  sources  jobs  providers  vault  scoring  email  captures  settings
```

## Language

Interface labels, table headers and buttons are **English**, because they mirror
the schema field names and that makes debugging cheaper. Error messages are
**Bengali**, rendered with `lang="bn"` — the one reader of an error message is the
operator, and the contrast was a deliberate decision rather than an accident.

## Invariants worth not breaking

- `fetch(` appears only in `src/lib/api.ts`.
- Tailwind class names are never assembled at runtime. Every variant is a full
  literal string in a static map, because a name built from a variable is
  invisible to the scanner and fails silently, with no console error.
- The error enum is closed at nineteen codes. Nuance goes in `error.detail.reason`,
  never in a new code.
- Retry is offered for four codes only (`E_RATE_LIMIT`, `E_PROVIDER_ERROR`,
  `E_TIMEOUT`, `E_INTERNAL`). A retry button on a compliance or quota failure
  invites the operator to repeat an action the policy refuses.
- A missing value renders as `—`, never as `0`. "Not probed yet" and "probed,
  empty result" are different facts, and the provisional-tier rule depends on it.
- Success is quiet: `ok`/`active`/`done` are neutral pills with a small green dot.
  Colour is reserved for exceptions, so the broken rows are the ones that stand out.
- Green is permitted in exactly five places: the wordmark, "you are here", the
  single primary action per view, the focus ring, and the healthy dot.
- Provider keys have no reveal and no copy affordance, anywhere, not even disabled.
- Cold outreach has no control on the Email page, not a disabled one.

## Verification

The repository ships the gates the project defined, and they all pass:

```bash
grep -rnE '`(bg|text|border|ring|from|to)-\$\{' src/   # expect: no output
grep -rnE '(indigo|emerald|slate)-[0-9]' src/          # expect: no output
grep -rn 'fetch(' src/                                 # expect: only src/lib/api.ts
grep -rn 'localStorage\|sessionStorage' src/           # expect: no output
grep -rnE 'text-(lg|xl|2xl|3xl)' src/                  # expect: no output
```

`npm run build` passes; every route renders non-blank and the browser console is
free of runtime errors.

## Deploying to Cloudflare Pages

1. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git.
2. Authorise the Cloudflare GitHub App for this repository.
3. Production branch `main`; build command `npm run build`; output directory `dist`.
4. Environment variable `NODE_VERSION=22`, and `VITE_API_BASE` once the Worker is
   reachable (leave it unset to keep demo mode).
5. Save and deploy. Every later push to `main` rebuilds automatically.

`public/_redirects` carries the SPA fallback, so extensionless paths such as
`/vault` serve `index.html` and a shared link or a refresh works. Static files keep
their exact paths and are never rewritten to HTML.

## Attribution

Place data comes from the Overture Maps Foundation (CDLA-Permissive 2.0) and
Foursquare OS Places (Apache-2.0). The footer attribution is a licence condition
and is permanently visible; ODbL-derived fields are export-gated.
