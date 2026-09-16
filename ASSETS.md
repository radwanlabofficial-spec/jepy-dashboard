# Assets

Canonical location: everything served at runtime lives under `public/` and is
referenced with a root-absolute path (`/assets/...`, never `public/...`, never a
relative path).

## Image Manifest

| Slot | Path | Source | Intended use | Status |
| --- | --- | --- | --- | --- |
| (none) | — | — | — | No image is rendered anywhere in this build |

**Generated images: 0 of 8 permitted.** This product has no imagery by design. The
design system rules out illustrations, logos and icon fonts: the only permitted
icon set is `lucide-react`, which ships as SVG components rather than image files.

### One documented gap

The Yelp attribution block on a lead page must show **Yelp's own logo** alongside
a link to the business page. That asset is trademarked and is not bundled here.
The block currently renders a text wordmark — `Live from Yelp · cached 24h` — plus
the business-page link, with the Yelp data kept in its own bordered panel and
never merged into the lead's own fields.

To close the gap, add Yelp's official brand asset as
`public/assets/images/yelp-logo.svg` and reference it inside that block only. Do
not draw a substitute mark: a lookalike logo on a compliance surface is worse than
a missing one.

## Fonts

Both families are **self-hosted** — no Google Fonts, no external font CDN, no CSS
`@import`.

| File | Family | Size | Role |
| --- | --- | --- | --- |
| `public/assets/fonts/inter-latin-wght-normal.woff2` | Inter (variable, 400–600) | 48 KB | UI text (`font-sans`) |
| `public/assets/fonts/jetbrains-mono-latin-wght-normal.woff2` | JetBrains Mono (variable, 400–500) | 40 KB | numbers, ids, code (`font-mono`) |

Total added weight: **88 KB**, served once and cached. Both are OFL-licensed.
Declared in `src/styles.css` with `font-display: swap`, so text paints immediately
in the fallback stack and never blocks first render.

## Local files

```
public/
├── _redirects                 SPA fallback for Cloudflare Pages
└── assets/
    ├── fonts/                 the two woff2 files above
    └── images/
        └── placeholder.svg    unused template placeholder (see below)
```

`placeholder.svg` is inherited from the project template and is not referenced by
any component. It is kept only so the image directory exists in a fresh clone; it
can be deleted as soon as a real image is added.

## Rules this project follows

- Never overwrite a file under `public/` with different content under the same
  name — `public/` files are served without content hashes, so caches keep serving
  the old bytes. Rename instead.
- Never hotlink an arbitrary external image. Local file, user-supplied URL, or a
  project CDN entry only.
- Never commit a credential, `.env` file, `.dev.vars`, `*.sqlite` or `*.parquet`.
  The repository is public, which is exactly why the bundle carries zero secrets.
