---
version: alpha
name: Jepy Console
description: "Dark-only, desktop-only operator instrument panel for a worldwide B2B lead-generation pipeline. A six-step zinc surface scale, one brand green reserved for identity and action, semantic colour reserved for exceptions, Inter plus JetBrains Mono at exactly four sizes."
colors:
  bg-app: "#09090b"
  surface-panel: "#18181b"
  surface-raised: "#27272a"
  border: "#27272a"
  border-strong: "#3f3f46"
  scroll-thumb: "#3f3f46"
  text-primary: "#f4f4f5"
  text-secondary: "#a1a1aa"
  text-muted: "#71717a"
  text-inverse: "#09090b"
  primary: "#4ade50"
  primary-hover: "#86efac"
  primary-soft: "rgba(74, 222, 80, 0.12)"
  primary-line: "rgba(74, 222, 80, 0.38)"
  primary-on: "#07130a"
  info: "#38bdf8"
  info-soft: "rgba(56, 189, 248, 0.15)"
  info-line: "rgba(56, 189, 248, 0.3)"
  warning: "#fbbf24"
  warning-soft: "rgba(251, 191, 36, 0.15)"
  warning-line: "rgba(251, 191, 36, 0.3)"
  danger: "#f87171"
  danger-soft: "rgba(248, 113, 113, 0.15)"
  danger-line: "rgba(248, 113, 113, 0.3)"
  hot: "#fb7185"
  hot-soft: "rgba(251, 113, 133, 0.15)"
  hot-line: "rgba(251, 113, 133, 0.3)"
  neutral-fill: "#27272a"
  neutral-text: "#a1a1aa"
  neutral-border: "#3f3f46"
  quota-ok: "#52525b"
  row-hover: "rgba(39, 39, 42, 0.5)"
  dialog-veil: "rgba(9, 9, 11, 0.72)"
typography:
  page-title:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: -0.005em
  section-title:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.4
  body:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.45
  body-medium:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.45
  chip:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0.05em
  mono-num:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.4
    fontFeature: "\"tnum\" 1"
  mono-label:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: 0.05em
rounded:
  none: 0px
  sm: 4px
  md: 6px
  full: 9999px
spacing:
  xxs: 4px
  xs: 6px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  sidebar-width: 240px
  shell-min-width: 1280px
  header-height: 44px
  detail-panel-width: 480px
  table-row-height: 32px
  control-height: 28px
  control-height-sm: 24px
  nav-item-height: 28px
  card-padding-compact: 12px
  card-padding-standard: 16px
  list-gap: 8px
  grid-gap: 12px
  touch-target: 44px
components:
  app-shell:
    backgroundColor: "{colors.bg-app}"
    width: "{spacing.shell-min-width}"
    typography: "{typography.body}"
    textColor: "{colors.text-primary}"
  sidebar:
    backgroundColor: "{colors.surface-panel}"
    width: "{spacing.sidebar-width}"
    padding: "{spacing.sm}"
    rounded: "{rounded.none}"
  sidebar-nav-item:
    backgroundColor: transparent
    textColor: "{colors.text-secondary}"
    typography: "{typography.body}"
    height: "{spacing.nav-item-height}"
    padding: "0px 10px"
    rounded: "{rounded.md}"
  sidebar-nav-item-hover:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
  sidebar-nav-item-active:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.text-primary}"
  sidebar-nav-item-disabled:
    backgroundColor: transparent
    textColor: "{colors.text-muted}"
  header:
    backgroundColor: "{colors.bg-app}"
    textColor: "{colors.text-primary}"
    height: "{spacing.header-height}"
    padding: "0px 16px"
  header-action-note:
    textColor: "{colors.text-muted}"
    typography: "{typography.mono-label}"
  card:
    backgroundColor: "{colors.surface-panel}"
    textColor: "{colors.text-primary}"
    padding: "{spacing.card-padding-compact}"
    rounded: "{rounded.md}"
  card-title:
    textColor: "{colors.text-primary}"
    typography: "{typography.section-title}"
  section-body:
    textColor: "{colors.text-secondary}"
    typography: "{typography.body}"
  kpi-card:
    backgroundColor: "{colors.surface-panel}"
    padding: "{spacing.card-padding-compact}"
    rounded: "{rounded.md}"
  kpi-label:
    textColor: "{colors.text-secondary}"
    typography: "{typography.chip}"
  kpi-value:
    textColor: "{colors.text-primary}"
    typography: "{typography.mono-num}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-inverse}"
    typography: "{typography.body-medium}"
    height: "{spacing.control-height}"
    padding: "0px 12px"
    rounded: "{rounded.md}"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.text-inverse}"
  button-secondary:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body-medium}"
    height: "{spacing.control-height}"
    padding: "0px 12px"
    rounded: "{rounded.md}"
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.text-secondary}"
    typography: "{typography.body-medium}"
    height: "{spacing.control-height-sm}"
    padding: "0px 8px"
    rounded: "{rounded.md}"
  button-disabled:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-muted}"
  input:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body}"
    height: "{spacing.control-height}"
    padding: "0px 8px"
    rounded: "{rounded.md}"
  input-placeholder:
    textColor: "{colors.text-muted}"
  select:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body}"
    height: "{spacing.control-height}"
    padding: "0px 8px"
    rounded: "{rounded.md}"
  chip:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.chip}"
    height: "18px"
    padding: "1px 5px"
    rounded: "{rounded.sm}"
  status-pill-ok:
    backgroundColor: "{colors.neutral-fill}"
    textColor: "{colors.neutral-text}"
    typography: "{typography.chip}"
    height: "18px"
    padding: "2px 6px"
    rounded: "{rounded.sm}"
  status-pill-running:
    backgroundColor: "{colors.info-soft}"
    textColor: "{colors.info}"
    typography: "{typography.chip}"
    height: "18px"
    padding: "2px 6px"
    rounded: "{rounded.sm}"
  status-pill-attention:
    backgroundColor: "{colors.warning-soft}"
    textColor: "{colors.warning}"
    typography: "{typography.chip}"
    height: "18px"
    padding: "2px 6px"
    rounded: "{rounded.sm}"
  status-pill-broken:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.danger}"
    typography: "{typography.chip}"
    height: "18px"
    padding: "2px 6px"
    rounded: "{rounded.sm}"
  status-pill-off:
    backgroundColor: "{colors.neutral-fill}"
    textColor: "{colors.text-muted}"
    typography: "{typography.chip}"
    height: "18px"
    padding: "2px 6px"
    rounded: "{rounded.sm}"
  status-dot-healthy:
    backgroundColor: "{colors.primary}"
    size: "5px"
    rounded: "{rounded.full}"
  status-dot-info:
    backgroundColor: "{colors.info}"
    size: "5px"
    rounded: "{rounded.full}"
  status-dot-attention:
    backgroundColor: "{colors.warning}"
    size: "5px"
    rounded: "{rounded.full}"
  status-dot-broken:
    backgroundColor: "{colors.danger}"
    size: "5px"
    rounded: "{rounded.full}"
  tier-hot:
    backgroundColor: "{colors.hot-soft}"
    textColor: "{colors.hot}"
    typography: "{typography.chip}"
    padding: "2px 6px"
    rounded: "{rounded.sm}"
  tier-warm:
    backgroundColor: "{colors.warning-soft}"
    textColor: "{colors.warning}"
    typography: "{typography.chip}"
    padding: "2px 6px"
    rounded: "{rounded.sm}"
  tier-cold:
    backgroundColor: "{colors.neutral-fill}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.chip}"
    padding: "2px 6px"
    rounded: "{rounded.sm}"
  tier-provisional:
    backgroundColor: transparent
    textColor: "{colors.warning}"
    typography: "{typography.chip}"
    padding: "2px 6px"
    rounded: "{rounded.sm}"
  data-table-header:
    backgroundColor: "{colors.surface-panel}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.chip}"
    height: "28px"
    padding: "0px 12px"
  data-table-row:
    backgroundColor: transparent
    textColor: "{colors.text-primary}"
    typography: "{typography.body}"
    height: "{spacing.table-row-height}"
    padding: "0px 12px"
  data-table-row-hover:
    backgroundColor: "{colors.row-hover}"
  data-table-cell-number:
    textColor: "{colors.text-primary}"
    typography: "{typography.mono-num}"
  data-table-null:
    textColor: "{colors.text-muted}"
    typography: "{typography.mono-num}"
  skeleton-row:
    backgroundColor: "{colors.surface-raised}"
    height: "24px"
    rounded: "{rounded.md}"
  tab:
    backgroundColor: transparent
    textColor: "{colors.text-secondary}"
    typography: "{typography.body-medium}"
    height: "30px"
    padding: "0px 10px"
    rounded: "{rounded.none}"
  tab-active:
    textColor: "{colors.text-primary}"
  quota-bar-track:
    backgroundColor: "{colors.surface-raised}"
    height: "4px"
    rounded: "{rounded.full}"
  quota-bar-fill-normal:
    backgroundColor: "{colors.quota-ok}"
    height: "4px"
    rounded: "{rounded.full}"
  quota-bar-fill-attention:
    backgroundColor: "{colors.warning}"
    height: "4px"
    rounded: "{rounded.full}"
  quota-bar-fill-over:
    backgroundColor: "{colors.danger}"
    height: "4px"
    rounded: "{rounded.full}"
  quota-guard-marker:
    backgroundColor: "{colors.border-strong}"
    width: "1px"
    height: "8px"
  copy-once-field:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    typography: "{typography.mono-num}"
    height: "32px"
    padding: "0px 8px"
    rounded: "{rounded.md}"
  slide-over-panel:
    backgroundColor: "{colors.surface-panel}"
    textColor: "{colors.text-primary}"
    width: "{spacing.detail-panel-width}"
    padding: "{spacing.card-padding-standard}"
    rounded: "{rounded.none}"
  dialog:
    backgroundColor: "{colors.surface-panel}"
    textColor: "{colors.text-primary}"
    width: "{spacing.detail-panel-width}"
    padding: "{spacing.card-padding-standard}"
    rounded: "{rounded.md}"
  dialog-step-dot-active:
    backgroundColor: "{colors.primary}"
    size: "6px"
    rounded: "{rounded.full}"
  dialog-step-dot-idle:
    backgroundColor: "{colors.surface-raised}"
    size: "6px"
    rounded: "{rounded.full}"
  popover:
    backgroundColor: "{colors.surface-panel}"
    textColor: "{colors.text-primary}"
    padding: "{spacing.md}"
    rounded: "{rounded.md}"
  tooltip:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body}"
    padding: "6px 8px"
    rounded: "{rounded.sm}"
  toast:
    backgroundColor: "{colors.surface-panel}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body}"
    padding: "10px 12px"
    rounded: "{rounded.md}"
  error-state:
    backgroundColor: "{colors.surface-panel}"
    textColor: "{colors.text-secondary}"
    padding: "{spacing.card-padding-standard}"
    rounded: "{rounded.md}"
  error-state-title:
    textColor: "{colors.text-primary}"
    typography: "{typography.section-title}"
  vault-pool-tile:
    backgroundColor: "{colors.surface-panel}"
    textColor: "{colors.text-primary}"
    padding: "{spacing.card-padding-compact}"
    rounded: "{rounded.md}"
  capability-cell:
    textColor: "{colors.text-secondary}"
    typography: "{typography.mono-num}"
    height: "26px"
    padding: "0px 8px"
  inventory-row:
    backgroundColor: transparent
    textColor: "{colors.text-primary}"
    typography: "{typography.body}"
    height: "32px"
    padding: "0px 12px"
  yelp-attribution-block:
    backgroundColor: "{colors.surface-panel}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.body}"
    padding: "{spacing.md}"
    rounded: "{rounded.md}"
  empty-state-illustration-lock:
    size: "20px"
  audit-row:
    backgroundColor: transparent
    textColor: "{colors.text-secondary}"
    typography: "{typography.body}"
    height: "32px"
    padding: "0px 12px"
  status-live-poll-dot:
    backgroundColor: "{colors.info}"
    size: "6px"
    rounded: "{rounded.full}"
---

# Jepy Console

## Overview

Jepy Console is the single-operator control panel for a worldwide B2B lead-generation pipeline running on Cloudflare Workers and D1. It is an **instrument panel, not a marketing site**: density beats breathing room, and a fifty-row table that fits one screen is the correct design even where it looks unlike a modern SaaS product. One technical operator keeps it open all day to operate, monitor and diagnose a queue-driven scraping pipeline. Design for the second hour of use, not the first ten seconds.

The emotional register is calm, legible and unchanging. Surfaces are near-black, text is high-contrast but not pure white, and the interface is quiet by default with a single accent used for identity and action. The governing rule of the whole system is **quiet by default, loud on exception**: successful, healthy and completed things recede; only the broken, the gated and the expiring raise their voice. An operator who scans the screen must see the three broken rows first, not forty healthy ones.

Interface language is **English**. Only backend error messages are rendered in Bengali, and those elements carry `lang="bn"`. Copy is literal and technical, referring to real domain nouns (hop, provider, account label, adapter, pack version, cost in micro-units, circuit scope). There is no welcome message, no greeting, no marketing sentence, no invented metric, and no filler placeholder text.

Hard platform constraints, not preferences: **dark mode only** (no light theme, no theme toggle, no `prefers-color-scheme`), and **desktop only**. There are deliberately no responsive breakpoints: the app shell is `min-w-[1280px]` and below that viewport width the page scrolls horizontally. There is no mobile or tablet layout, no hamburger menu, and no collapsible sidebar. Filters and view state live in URL query params — never in `localStorage` or `sessionStorage` — so a shared link reproduces the exact view a colleague or the operator's past self was looking at.

Quality floor for every screen: 4.5:1 contrast for normal text, visible keyboard focus on every interactive element, and hit areas of at least 44x44 CSS pixels. The compact geometry of this product (28px controls, 32px rows) is achieved with tight *visible* boxes, never by shrinking the *interactive* target: each control's hit area is expanded to at least 44x44 through padding or a pseudo-element, and adjacent targets are separated by at least 8px so the WCAG 2.5.8 exclusion circles never intersect.

The overall direction is a zinc instrument panel with one brand green. It takes its structural lineage from dark-native developer tooling — luminance-stepped surfaces, hairline borders, monospace data columns, icon-only chrome — and strips out the decoration that such products often carry: no gradients, no illustrations, no emoji, no icon fonts, no animation library, and no images at all except Yelp's own logo inside its single attribution block.

## Colors

The palette is six zinc steps, one brand green, and a four-hue exception set. Nothing else exists. `emerald` is banned from the codebase entirely; `indigo` and `slate` are retired tokens from a superseded palette and must not appear.

**Surfaces — six steps, exactly.** `bg-app` (`#09090b`, `bg-zinc-950`) is the body background and is painted once, on `<body>`. `surface-panel` (`#18181b`, `bg-zinc-900`) is the sidebar, every card, the table header and dialogs. `surface-raised` (`#27272a`, `bg-zinc-800`) is a hovered table row, the active tab, input fields and chip backgrounds. `border` (`#27272a`, `border-zinc-800`) is every divider and card border — the same value as `surface-raised`, used differently. `border-strong` (`#3f3f46`, `border-zinc-700`) is the input focus outline and dialog border. `scroll-thumb` (`#3f3f46`) is the only scrollbar thumb colour, also exposed as `--jepy-scroll`. Because surface and border share a value, depth never depends on a shadow: it comes from a one-step background shift plus a hairline.

**Text.** `text-primary` (`#f4f4f5`, `text-zinc-100`) is body and table cell text. `text-secondary` (`#a1a1aa`, `text-zinc-400`) is labels, table headers and timestamps. `text-muted` (`#71717a`, `text-zinc-500`) is reserved for disabled content, placeholder text and the `—` null marker. `text-inverse` (`#09090b`, `text-zinc-950`) appears only on solid green. `primary-on` (`#07130a`) is the value exposed by the shipped `--jepy-on-green` variable and is the same near-black family as `text-inverse`.

**Accent — one brand green.** `primary` is `#4ade50`, consumed through Tailwind's core `green-400` class only; no arbitrary colour value may be written for it. The `:root` variables are `--jepy-green: #4ade50`, `--jepy-green-soft: rgba(74,222,80,.12)`, `--jepy-green-line: rgba(74,222,80,.38)`, `--jepy-on-green: #07130a`, `--jepy-scroll: #3f3f46`.

Green is permitted in exactly five places, and this list is exhaustive:

1. **The wordmark.** "Jepy" set in `text-primary` with " Leads" in `text-green-400`, at 14px semibold in the sidebar brand row.
2. **"You are here."** The active nav item, the active tab, and the current step dot in a multi-step dialog. The active nav item is `background: var(--jepy-green-soft)` plus `box-shadow: inset 2px 0 0 var(--jepy-green)` — an inset rail, **never a border**, because a border shifts layout by two pixels and makes the nav item jump on selection. The active tab is `border-b-2 border-green-400`. The current dialog step dot is `bg-green-400`.
3. **The primary action.** `bg-green-400 hover:bg-green-300 text-zinc-950`, at most **one per view**.
4. **The focus ring.** `focus-visible:ring-1 focus-visible:ring-green-400` on every focusable control, paired with `focus-visible:ring-offset-0`.
5. **The healthy dot.** A 5px `bg-green-400` dot inside an otherwise neutral pill.

Anything else rendered in green is a defect.

**Semantic colour — quiet by default, loud on exception.** Semantic hue is spent only on exceptions; success is silent. `ok`, `active`, `done`, `valid` and `closed` do **not** get a coloured pill. They get a neutral pill — `bg-zinc-800 text-zinc-400 border-zinc-700` — with a 5px `bg-green-400` dot inside it. The rationale is operational, not aesthetic: in a 40-row table with 38 green pills the single green primary button drowns, and a table where every row is green hides the three broken rows the operator opened it for.

The static status map — every variant is a full literal class string in a static object, never assembled at runtime:

| Status values | Classes |
| --- | --- |
| `running`, `claimed`, `pending`, `queued` (in flight) | `bg-sky-500/15 text-sky-400 border-sky-500/30` |
| `untested`, `stale`, `rate_limited`, `degraded`; quota above 70%; quota expiring in under 7 days; provisional tier | `bg-amber-500/15 text-amber-400 border-amber-500/30` |
| `exhausted`, `failed`, `invalid`, `revoked`, `broken`, `open` (circuit open) | `bg-red-500/15 text-red-400 border-red-500/30` |
| `disabled`, `blocked`, `manual`, `empty` (intentionally off) | `bg-zinc-800 text-zinc-500 border-zinc-800` |
| `ok`, `active`, `done`, `valid`, `closed` (success — quiet) | `bg-zinc-800 text-zinc-400 border-zinc-700` plus a 5px `bg-green-400` dot |

In-flight maps to sky, attention to amber, breakage to red, intentional off to muted zinc, and success to neutral. Compliance-blocked rows (Class X) are **muted zinc, never red**: they are not broken, they are permanently closed, and red would send the operator hunting a phantom bug for six months.

Two carve-outs are worth stating explicitly because English reads backwards here:

- `closed` gets the green dot because a **closed circuit is healthy**; `open` is red because an open circuit means the pipeline is failing.
- `disabled` and `blocked` are **not** red; only `broken` is. Disabled means intentionally switched off; broken means something needs a human.

**Tier is a separate temperature axis, not a status.** `HOT` is `rose` (`bg-rose-500/15 text-rose-400 border-rose-500/30`), `WARM` is amber, `COLD` is zinc (`bg-zinc-800 text-zinc-400 border-zinc-700`). COLD is never green and HOT is never red. A missing tier renders either `—` or the provisional variant (`border-amber-500/30` dashed, amber text, labelled "provisional" with a tooltip explaining coverage below 60%); the UI must never render `0` or `COLD` for a missing tier, and must never hardcode the coverage threshold in the UI — it comes from the API.

**Quota bars.** The track is `h-1 rounded-full bg-zinc-800`. Three static fill steps: below 70% neutral `bg-zinc-600`, 70–90% `bg-amber-400`, above 90% `bg-red-400`. A healthy fill is deliberately **not** green: eight healthy bars side by side must let the one amber bar jump out. Optional labelled guard markers at 1,800/day and 70%/month are 1px `bg-zinc-700` rules with a 10px uppercase label.

**Contrast policy.** Normal informational text — page titles, section titles, body copy, table cells, every status label in the sky, amber, red and rose families, and the neutral success pill — is specified at the 400 level or lighter on the 800-to-950 surfaces and clears 4.5:1 (`text-zinc-100` on `bg-zinc-950` is roughly 16:1; `text-zinc-400` on `bg-zinc-900` is roughly 6.9:1; `text-zinc-400` on `bg-zinc-800` is roughly 5.8:1). The single documented exception is the `text-muted` token (`#71717a`), which sits at roughly 4.1:1 on the app background and roughly 3.7:1 on a panel. It is permitted only where WCAG's inactive-component reasoning applies: disabled nav items, disabled content, placeholder text, the muted off-state status family, and the `—` null marker. It must never carry a value, a label, a header, a timestamp or helper text that the operator is required to read, and no information may exist in a muted element alone — every muted pill sits in a row whose identifier and remaining cells stay at `text-zinc-100`/`text-zinc-400`. Non-text UI boundaries (borders, quota track, row separators) clear 3:1 against their adjacent surfaces.

## Typography

Two typefaces, exactly four sizes, three weights. **Inter** (`font-sans`) carries the interface: navigation, titles, table cells, buttons, labels, helper text. **JetBrains Mono** (`font-mono`) carries everything machine-readable: numbers, ids, hashes, tokens, versions, cost in micro-units, `pack_version`, device registration tokens and code. `tailwind.config.js` may not be extended beyond `fontFamily.sans = Inter` and `fontFamily.mono = JetBrains Mono`.

**The four sizes.**

| Role | Classes | Token | Use |
| --- | --- | --- | --- |
| Page title | `text-base font-semibold` (16px) | `page-title` | The single `<h1>` in the header, one per page |
| Section / card title | `text-sm font-medium` (14px) | `section-title` | Card headers, drawer section headings, dialog titles |
| Body & table cell | `text-[13px]` (13px) | `body`, `body-medium` | Every table cell, list row, paragraph, button label |
| Chip / table header / helper | `text-[10px] uppercase tracking-wide` (10px) | `chip`, `mono-label` | Status pills, tier chips, table headers, KPI labels, helper text, guard markers |

`text-lg` and anything larger do not exist in this product. A page never shows more than four sizes, because there are only four.

**Weights: normal, medium, semibold — nothing else.** No light, no bold, no black, no italics. Semibold is reserved for the page title and the primary button label; medium for section titles, nav items, buttons, tabs and status text; normal for body and table cells.

**Numbers are always monospace and always right-aligned**, because the operator compares columns of numbers down the page: counts, units, cost, latency, quota, spend, millisecond scores. Apply `font-mono text-[13px] tabular-nums text-right` (the `mono-num` token, with `font-feature-settings: "tnum" 1`). A number never appears in Inter, never appears left-aligned, and never appears without tabular figures: proportional digits make a column of costs visually ragged and slow to compare. Units and deltas that sit beside a number use the same mono role at 10px uppercase where a label is needed.

**Identity strings are monospace too**, at the body size: account labels, `hop` identifiers, adapter names, `pack_version`, job and lead ids, device tokens, error codes, masks such as `••••9ae5`. This is how the operator separates a machine value from prose at a glance.

**Null is a marker, not a zero.** `<Num>` renders a null value as a muted `—` (`text-zinc-500`, the `data-table-null` token) and never as `0`. A missing signal in a score breakdown, a missing tier, a missing `pack_version` all render `—`. `0` always means a measured zero. The same rule applies outside `<Num>`: an em dash, never "N/A", never "null", never an empty cell.

**Uppercase micro type carries 0.05em letter-spacing** (the shared token value, Tailwind's core `tracking-wider`); the ratified family is `tracking-wide` and up, and all-caps at 10px without positive tracking reads cramped and amateur. Uppercase is used only for micro labels and never for a sentence. Helper text and captions use the same 10px size without uppercase only where a full sentence is unavoidable, and never longer than one line.

**Line height** stays tight because the surfaces are dense: 1.45 for body and table cells, 1.35 for the page title, 1.2 for chips and pills, 1.3 for mono micro labels. Body copy that runs longer than a line is capped near 65 characters; in this product that only happens inside empty states, dialog helper text and error copy.

Bengali error messages are rendered in the same stack at the body size with `lang="bn"` on the element so the correct glyph shaping and line-breaking apply. No Bengali string is ever uppercased, and no Bengali text is set in the mono stack.

## Layout

**The shell never moves.** A fixed sidebar, a fixed header, and one scrolling content region. The page itself never scrolls, so the sidebar and header stay put and only `<main>` scrolls. The app shell is `flex h-screen min-w-[1280px]` with `overflow-x-auto` on the viewport below 1280px; there are no breakpoints, no media queries, no mobile layout and no collapsed sidebar at any width.

- **Sidebar** — `w-60 bg-zinc-900 border-r border-zinc-800`, fixed and never collapsing. It contains the brand row (`h-11`, `border-b border-zinc-800`, the wordmark) and then the navigation. Its own body scrolls only if the nav overflows.
- **Header** — `h-11 border-b border-zinc-800 px-4`, page title on the left, that page's action on the right. No breadcrumb, no global search, no avatar, no notification bell. The Cloudflare Access email appears small in `text-zinc-500` at the right edge, next to the polling indicator.
- **Content** — `p-4`, the only scrolling region, `gap-3` between stacked blocks.
- **Scrollbars** — thumb `#3f3f46`, track matching the surface behind it.

**Spacing scale: `1 / 1.5 / 2 / 3 / 4 / 6` in Tailwind units (4/6/8/12/16/24 px) and nothing between or outside it.** No `p-5`, no `p-8`, no `mt-7`. Cards take `p-3` (compact, the default) or `p-4` (standard, for dialogs and detail panels). Lists use `gap-2`; card grids use `gap-3`. Row padding inside tables is `px-3`. Rules that separate blocks use `border-b border-zinc-800` with no extra margin.

Radius is `rounded-md` (6px) for every container, control and panel; `rounded` (4px) for chips and pills; `rounded-full` only for the 5px status dot, the quota-bar track and its fill, and the 6px polling dot. Nothing is square and nothing is pill-shaped except those dots.

**Navigation — exactly ten items, in this order, icons from `lucide-react` as named tree-shaken imports:**

| # | Label | Route | Icon |
| --- | --- | --- | --- |
| 1 | Overview | `/` | `LayoutDashboard` |
| 2 | Leads | `/leads` | `Users` |
| 3 | Sources | `/sources` | `Database` |
| 4 | Jobs | `/jobs` | `ListChecks` |
| 5 | Providers | `/providers` | `Plug` |
| 6 | Vault | `/vault` | `KeyRound` |
| 7 | Scoring | `/scoring` | `Gauge` |
| 8 | Email | `/email` | `Mail` |
| 9 | Captures | `/captures` | `Camera` — **disabled** |
| 10 | Settings | `/settings` | `Settings` |

Nav items are `h-7 rounded-md px-2.5 text-[13px] text-zinc-400` with a 14px icon at `stroke-width 1.6`, hover `bg-zinc-800 text-zinc-100`, and the active state described in Colors (soft green background plus an inset 2px green rail, never a border). Captures is `text-zinc-500 cursor-not-allowed` with a `sky` "Coming soon" chip (`bg-sky-500/15 text-sky-400 border-sky-500/30`, the `chip` role). A non-working item stays visible on purpose: in an audit, a missing page and a gated page must not look identical. The disabled item is still rendered as a real element with `aria-disabled="true"` and removed from the tab order, not as a `<div>` with a click handler.

**Page composition.** Each route owns one page title in the header and that page's single right-hand action at most.

- **Overview `/`** — a four-column KPI card grid (`grid-cols-4 gap-3`), each card a `kpi-label` plus a mono `kpi-value` plus a 10px secondary note; then two columns (`grid-cols-2 gap-3`), left is queue depth plus today's burn chart, right is recent errors. No welcome message, no greeting, no "good morning".
- **Leads `/leads`** — a full-width data table plus a right-hand slide-over detail panel `w-[480px]` that opens over the content (not a new route, so the table's URL-param filters survive). The panel contains the tier badge, the per-signal score breakdown, an activity timeline and provenance.
- **Sources `/sources`** — five tabs, in order: **Directories · Selector packs · Manual · Blocked · Imports**. Tabs are underlined, see Components.
- **Jobs `/jobs`** — the queue table, plus the hop drawer opened from a row.
- **Providers `/providers`** — read-only monitoring: a row of account cards, quota bars, health, last failure, and an account drawer. No key input field anywhere on this page.
- **Vault `/vault`** — a pool grid above the table, then the credentials table, see Components.
- **Scoring `/scoring`** — a read-only weight table with a "New version" button in the header, then the history chart.
- **Captures `/captures`** — a single centred empty state, `max-w-md text-zinc-400`, with a lock icon.
- **Settings `/settings`** — device registration, then audit log, error log and DSR request sections, stacked with `gap-3`.

**Filtering and view state live in URL query params**, never in component-local storage: `?status=failed&provider=apify&page=2` must reproduce the view on reload and in a shared link. Sorting and pagination are query params too. `localStorage` and `sessionStorage` are prohibited for filters and preferences.

**Grid alignment is the layout system for data.** Numbers occupy fixed-width right-aligned columns so they line up vertically; identity strings sit left in mono; status and tier chips sit in their own narrow columns; free text never pushes a numeric column around. Charts are laid out on the same scale, with a fixed plot height and the axis labels in the 10px uppercase role.

Touch and pointer targets: every control keeps the compact visible geometry above but exposes a hit area of at least 44x44 CSS pixels, and adjacent interactive elements are separated by at least 8px. Row-level icon actions inside 32px table rows expand their hit area upward and downward within the row and never overlap a neighbouring control, satisfying the WCAG 2.5.8 spacing exception; pointer-only affordances are duplicated as row context-menu items so nothing is reachable by mouse alone.

## Elevation & Depth

This is a flat system. Depth is information, not decoration, and a shadow that only says "this card is a card" is noise.

- **Level 0 — app background.** `bg-zinc-950` painted once on `<body>`. Nothing else uses it.
- **Level 1 — panel.** `bg-zinc-900` with a `border-zinc-800` hairline: sidebar, cards, table header, dialog, popover, slide-over, drawer, toast. This is where almost all content lives.
- **Level 2 — raised.** `bg-zinc-800`: hovered table row, active tab, input field, chip background, secondary button, skeleton block. Used for state, not for stacking.
- **Overlays.** The dialog and popover are the only two surfaces with a shadow, and it is exactly `shadow-xl`; a dialog floats above the page and the shadow communicates that this is a different layer. Dialogs also carry `border-zinc-700` to hold their edge against the veil, and sit on a `dialog-veil` backdrop of `rgba(9,9,11,.72)`.
- **No other shadows.** No `shadow-sm`, no `shadow`, no `shadow-md`, no `shadow-2xl`, no inset card shadows, no hover elevation, no focus glow outside the green ring, no coloured shadow.
- **Inset rail.** The one inset shadow in the system is the active nav item's `inset 2px 0 0 var(--jepy-green)`. It is the only inset shadow permitted.

Stacking is deliberate and small: content, then sticky table header inside the scrolling region, then slide-over or drawer, then dialog, then tooltip and toast. A slide-over does not dim the page — the operator keeps working against the table behind it — while a dialog does, because it asks a question.

Hover states are background shifts only (`hover:bg-zinc-800/50` on table rows, `hover:bg-zinc-800` on nav items and ghost buttons), never borders, never translate, never scale, never shadow. Focus uses `focus-visible:ring-1 focus-visible:ring-green-400` with `ring-offset-0`; the ring is required on every interactive element, including icon-only buttons, nav links, table row actions, tabs and dropdown items, and it must stay visible against `bg-zinc-950`, `bg-zinc-900` and `bg-zinc-800` alike.

## Shapes

The shape language is engineered and near-square. Everything is a rectangle with a 6px radius; the only exceptions are chips and the dots.

- **`rounded-md` (6px)** — buttons, inputs, selects, cards, table containers, dialogs, popovers, slide-over panel, drawers, pool tiles, copy-once fields, error states, skeletons. The default for every container and control.
- **`rounded` (4px)** — status pills, tier chips, "Coming soon" chips, tooltips, the brand mark, quota guard marker caps. Nothing at 4px is larger than a chip.
- **`rounded-full` (9999px)** — only the 5px status dot, the 6px polling dot, the 6px dialog step dots, and the `h-1` quota-bar track and fill. There are no circular buttons and no fully pill-shaped status badges.
- **Borders are 1px hairlines** in `border-zinc-800` for structure and `border-zinc-700` for inputs, dialog edges and the neutral success pill. Nothing else has a border. Never a 2px border on a container; the only 2px line in the product is the inset nav rail.
- **Dashes mean provisional.** The provisional tier chip is the single dashed border in the product (`border border-dashed border-amber-500/30`, transparent background, amber text). Dashes are reserved for "this value is not yet trustworthy" so they never get reused decoratively.
- **No decorative geometry.** No blobs, no waves, no gradient fills, no rounded-corner illustrations, no card with a coloured left border. The only SVG shapes in the product are `lucide-react` icons at 14px (`stroke-width 1.6`) and, in charts, real data marks.

Icons are monoline `lucide-react` named imports at 13–14px in table rows and buttons, 16px in the sidebar when a page needs a larger mark, always `currentColor`, always 1.6–1.8 stroke. No icon fonts, no emoji as UI symbols, no filled icon sets.

## Components

Every component is hand-written against the tokens above, with four exceptions imported as shadcn primitives and restyled to them: **Dialog**, **Popover**, **Tooltip**, **Toast**. Nothing else comes from a component library, and no additional primitive is added later without removing one of these four.

**Class strings are never assembled at runtime.** `bg-${hue}-500/15` does not exist in a JIT build and fails silently, producing an unstyled element that looks almost right. Every variant is a complete literal class string inside a static `Record<Status, string>`-style map, colocated with the component that uses it.

### Buttons and controls

| Variant | Classes | Use |
| --- | --- | --- |
| Primary | `bg-green-400 hover:bg-green-300 text-zinc-950 font-medium h-7 px-3 rounded-md text-[13px]` | At most one per view |
| Secondary | `bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 h-7 px-3 rounded-md text-[13px]` | The common action: Export CSV, Test, New version |
| Ghost | `bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 h-6 px-2 rounded-md text-[13px]` | The `add` button on a pool tile, inline actions |
| Danger | `bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 h-7 px-3 rounded-md text-[13px]` | Destructive confirm inside a dialog; never in a table cell |
| Icon-only | `size-7 grid place-items-center rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100` | Overflow menus, drawer close; always with `aria-label` |

Disabled state is `opacity-40 cursor-not-allowed` plus `aria-disabled="true"`; a disabled control never changes text colour alone. Every button is a real `<button>` with an explicit `type`. Loading on submit locks the control and its fields against re-submission; the label does not change and no spinner is introduced — the button simply disables.

Inputs are `h-7 rounded-md bg-zinc-800 border border-zinc-700 px-2 text-[13px] text-zinc-100 placeholder:text-zinc-500` with `focus-visible:ring-1 focus-visible:ring-green-400`; a field with an error takes `border-red-500/30` plus a 10px red helper line with `role="alert"`, and the error clears the moment the value becomes valid. Labels are always visible above the field at the 10px uppercase role; placeholder text is never the only label. Validation fires on blur.

### Status and tier components

**`<StatusPill status>`** renders the static map defined in Colors. Its dot set is explicit: the five quiet success statuses `ok`, `active`, `done`, `valid`, `closed` render a 5px `bg-green-400` dot inside the neutral pill. Every other variant renders no dot — the coloured pill itself is the signal, and adding dots to amber and red pills makes the whole table louder without adding information. An unknown status falls back to the muted off-state style, renders the raw status text, and logs a development warning: it must never crash and must never render an empty pill. The pill is 18px tall, `text-[10px] uppercase tracking-wide`, `whitespace-nowrap`, and its text is always the machine status with underscores replaced by spaces (`rate_limited` → `rate limited`).

**`<Tier tier coverage>`** renders the temperature axis: `HOT` rose, `WARM` amber, `COLD` zinc, all at the chip role. A missing or null tier renders `—`, never `0` and never `COLD`. When the API reports coverage below the tier-confidence threshold it returns a provisional marker instead of a tier, and the component renders the amber dashed chip labelled "provisional" with a tooltip explaining that coverage is below 60%; the threshold is never hardcoded in the UI and the component never guesses a tier from a score. Tier chips are not status pills: they never get the green dot treatment, and they never appear in the same column as a status.

**`<Num value>`** renders mono, `tabular-nums`, right-aligned, and formats thousands with separators. `null`, `undefined` and `NaN` render a `text-zinc-500` `—`. `0` renders `0`. Optional props give a unit suffix and a compact form for micro-units. `<Num>` never receives a pre-formatted string with the dash baked in.

**`<QuotaBar used limit guardAt>`** is `h-1 rounded-full bg-zinc-800` with a fill using the three static steps (<70% `bg-zinc-600`, 70–90% `bg-amber-400`, >90% `bg-red-400`) and the numeric pair `used / limit` in mono to its right. Optional labelled guard markers (1,800/day, 70%/month) render as 1px `bg-zinc-700` ticks with 10px uppercase labels. A healthy fill is neutral by design — never green. A quota value above 70% or expiring within seven days also raises the `amber` attention state on the surrounding card, but the bar itself does not animate, pulse or change colour on hover. There is no way to edit a quota anywhere in the UI.

**`<Card>` / `<Section>`** is `rounded-md border border-zinc-800 bg-zinc-900` with a 36px header (`h-9 px-3 border-b border-zinc-800`) holding a 14px medium title on the left and that section's own action on the right, then `p-3` (or `p-4` in dialogs and detail panels). Cards are flat, never clickable, never hoverable as a whole, and never nested more than one level deep. They are not links and carry no `cursor-pointer`.

### `<DataTable>`

A sticky header (`sticky top-0 z-10 bg-zinc-900 border-b border-zinc-800`, cells `px-3 h-7 text-[10px] uppercase tracking-wide text-zinc-400`), rows `h-8 border-b border-zinc-800 hover:bg-zinc-800/50`, no zebra striping, no vertical rules, no row selection, and no animated row appearance. Numbers are right-aligned in mono columns; identity strings are left in mono; status and tier chips hold their own narrow columns. Row-level actions appear at the right edge and are revealed on row hover *and* always available on keyboard focus — a hover-only control is not acceptable as the sole path to an action. Column widths are stable across loading, empty and populated states so the table does not reflow when data arrives.

**Four states, written separately and never conflated:**

1. **Loading** — five `animate-pulse bg-zinc-800 h-6 rounded` rows inside the table body, matching the real column widths, plus one skeleton block in a card. Skeletons, never spinners: a skeleton holds the layout so the page stops jumping. Skeletons appear only after a 300ms delay so fast responses do not flash.
2. **Empty** — no records exist yet. A centred block with a 14px medium headline, one sentence of explanation, and the primary create action.
3. **Error** — a fetch failure. `<ErrorState>` inside the panel; the surrounding chrome stays rendered.
4. **Empty because filtered** — records exist but the current URL query params exclude them. This is its own state: it echoes the active filters as chips, offers "Clear filters" as a secondary action, and never shows the first-use copy, which would be a lie.

The same four states apply to every list, drawer and card that fetches data. Error is never collapsed into empty, and empty is never a literal blank.

### `<Tabs>`

Underline style, no pills, no background on the active tab: items are `h-[30px] px-2.5 text-[13px] text-zinc-400 hover:text-zinc-100` with a 2px transparent bottom border; the active tab is `text-zinc-100 border-b-2 border-green-400` (green permission 2 — "you are here"). The tab strip sits on `border-b border-zinc-800`. Tabs are real buttons with `role="tablist"`, arrow-key navigation, and `aria-selected`; the panel is `role="tabpanel"`. Selected tab is part of the URL so a link reproduces the view. Sources uses five tabs in this order: **Directories · Selector packs · Manual · Blocked · Imports**.

### `<CopyOnceField>`

Mono, `select-all`, a Copy button, and an amber warning line reading that this value is never shown again. Used only for device registration tokens. The value lives in component state and is cleared on unmount; it is never written to storage, never logged, and never cached. If the clipboard write fails the field does not silently pretend to succeed — it selects the text and says so.

### `<ErrorState error>`

A two-level static map: switch on `code`, then on `detail.reason` for six codes that carry sub-reasons. The surface renders three things in order — what happened, why if knowable, and what the operator can do — in plain technical English, with the error code visible in mono so it can be quoted. Bengali message text from the backend is rendered verbatim in a `lang="bn"` block; the code and the recovery action stay in English.

A **Retry** button appears only for the four retryable codes: `E_RATE_LIMIT`, `E_PROVIDER_ERROR`, `E_TIMEOUT`, `E_INTERNAL`. There is **no retry control** on compliance errors, quota errors or gate errors — retrying a policy refusal is not a recovery path and offering the button teaches the operator to press it. Circuit-open copy is timeless: it never states a fixed time, never promises "back in 30 minutes", and instead explains what condition closes the circuit. Repeated retries back off (immediate, then 2s, 4s, 8s); after three failures the button is replaced by a copyable error id. Errors preserve whatever the operator had entered.

### Loading, motion and liveness

Loading is skeletons only: five `animate-pulse bg-zinc-800 h-6 rounded` rows in a table, one block in a card. No spinners, no progress bars in the content area, no full-page takeover when a single section is fetching. Motion is `transition-colors duration-150` and nothing else — no slide-ins, no fade-ups, no count-up numbers, no layout animation, no spring, no animation library. In an instrument panel movement must mean "something changed". The one other motion in the product is a small pulsing `sky` dot in the header indicating background polling; the table never flickers, never auto-scrolls, and never re-orders rows under the operator's cursor while they are reading.

Toast notifications appear in one fixed position (bottom right), are reachable by keyboard, do not auto-dismiss while hovered or focused, carry `role="status"` for confirmation and `role="alert"` for failure, and never replace the inline error on the surface that failed.

### Overlays: dialog, popover, tooltip, drawer, slide-over

**Dialog** — `w-[480px] bg-zinc-900 border border-zinc-700 rounded-md p-4 shadow-xl` on the `dialog-veil` backdrop. Title at 14px medium, description in `text-zinc-400`, actions bottom-right (`Cancel` secondary, the single primary action on the right). It traps focus while open and releases on `Escape` or the close button, moves focus into the dialog on open and back to the trigger on close, and uses `role="alertdialog"` only for destructive confirmations. Multi-step dialogs show small step dots: the current step is the green dot, completed and future steps are `bg-zinc-800`.

**Popover** — `bg-zinc-900 border border-zinc-700 rounded-md p-3 shadow-xl`, used for menus and the capability detail; dismisses on `Escape` and outside click, and restores focus to its trigger.

**Tooltip** — `bg-zinc-800 text-zinc-100 rounded px-2 py-1.5 text-[13px]` with no shadow, appearing after ~300ms on hover and immediately on keyboard focus, `role="tooltip"` wired with `aria-describedby`. Tooltips explain rules the operator cannot see on screen — the provisional tier threshold, why the `yelp` tile has no `add` button, why a Class X row has no actions — and never repeat visible text.

**Drawer** — a right-anchored panel inside the content column, `bg-zinc-900 border-l border-zinc-800`, for the hop drawer, the account drawer and the selector-pack drawer. It stacks above the table, keeps the page behind it live, and closes on `Escape`.

**Slide-over (Leads detail)** — `w-[480px] bg-zinc-900 border-l border-zinc-800 p-4`, opened from a table row without a route change, so URL-param filters survive. It holds the tier badge, the per-signal score breakdown (a missing signal shows `—`, never `0`), the activity timeline and provenance, with the lead's identity in mono at the top.

### Page-specific components

**Sources · Blocked tab.** Class X rows are listed in the same table as everything else, muted: `text-zinc-500` row text, the block reason (`tos_no_storage`) in mono, and a `Lock` icon. They have **no action affordance whatsoever** — not a button, not a link, not an overflow menu, and *not even a disabled button*, because a disabled button promises a future enable that will never come. They exist only so a refusal is auditable.

**Sources · Selector packs tab.** Rows carry a status of `draft`, `active`, `rejected` or `broken` through `<StatusPill>`, plus a drawer with version history and **Approve** / **Reject** actions. Version history is a list of `pack_version` values in mono with author, timestamp and outcome; it is never edited in place.

**Jobs · hop drawer** — the densest and most important view in the product. One row per hop, with these columns and no omissions: `hop`, provider, `account_label`, adapter, `pack_version`, outcome, `http_status`, `records_count`, `unit_type`, units, `cost_micro`, `latency_ms`, `circuit_scope`, `score_milli`. `pack_version` may never be hidden, even when null — null renders `—` in mono, because "this hop ran without a pack version" is itself diagnostic information. Numbers (records, units, cost, latency, score) are right-aligned mono; identity strings mono left; outcome a status pill. Below the hop rows, a second block lists the candidates that were rejected, each with the filter that dropped it in mono; it is a list, not a table, and it never paginates away the first rejection.

**Providers** — read-only monitoring. Account cards with label, provider, quota bar, health, and last failure (timestamp, code, and the reason in mono); an account drawer with the same information plus the last N failures. There is **no key input field anywhere on this page**, not even inside the drawer. The capability matrix is a dense grid of cost and quality: rows are providers, columns are capabilities, cells show `cost_micro_per_unit` in the read-only look — `text-zinc-400`, `cursor-default`, no hover affordance, no input, no border that suggests editability.

**Vault** — a **pool grid above the table**: `grid-cols-3 gap-3`, one tile per provider showing the provider name, account count, total quota, and an `add` ghost button that opens the New-account dialog with that provider pre-selected. The placement is structural, not decoration: the account pool is a floor rather than a ceiling, so adding an account when a new partner joins is routine work and must not hide behind a single corner button. Two tile rules: the `yelp` tile has **no** `add` button — it carries a `locked` status pill and a tooltip explaining that there is exactly one Yelp account, forever — and keyless providers have no `add` either, since the credential concept does not apply to them. Below the grid, the credentials table shows the mask `••••9ae5` in mono with exactly **two** actions per row, Test and Rotate (Delete lives in an overflow menu), and the card header carries "+ New account" as a secondary button and "Add credential" as the primary.

The two-step New-account dialog: step 1 creates the account — provider select (no `yelp` option), a server-prefilled read-only label, a locked unit type, and a warning line stating that auto-recharge is OFF; step 2 takes the credential. If step 2 fails the row stays in `untested`, which is correct behaviour rather than a rollback, and the dialog says so in helper text. There is **no reveal toggle and no copy-key button anywhere, not even disabled**, on this dialog or any other surface.

**Scoring** — a read-only weight table with a "New version" button in the card header and **no edit icon on any row**; weights are mono and right-aligned. The history chart greys out points whose sample is below 30 and labels them "not applied", so a score that was never in force cannot be misread as a decision that was.

**Captures** — a single centred empty state, `max-w-md text-zinc-400`, with a `Lock` icon, explaining that operator-driven capture is deliberately gated off in this build. No table, no filters, no disabled controls pretending to be features.

**Settings** — device registration first: a `<CopyOnceField>` registration token, heartbeat, last seen, a directive dropdown (`run` / `pause` / `drain` / `revoke`), and a revoke action behind a confirmation. Then the audit log, the error log (each row a code in mono plus its Bengali message in a `lang="bn"` block) and the DSR request section.

**Email / suppression** — the suppression list shows **masked addresses only** (`r••••@e••••.com`); the database stores a hash and the UI never has a plaintext address to display. There is **no cold-email option in the composer**, in any state, visible or disabled.

**Yelp attribution block** — Yelp data is never merged into normal lead fields. It is a separate `rounded-md border border-zinc-800 bg-zinc-900 p-3` block carrying the Yelp logo, a link through to the source, and the line "Live from Yelp · cached 24h". It never sits inside an export button, never inside a CSV payload, and never inside a standard lead column.

### Confirmation and destructive actions

Destructive or irreversible actions require a confirmation dialog that names the object and states the consequence in plain language: rotate a credential, revoke a device, reject a selector pack, delete an account. **There is no one-click "resume" while the cash guard is tripped**: resuming requires a confirmation dialog showing month-to-date spend and an itemised list of what will restart, so the operator sees the money before the pipeline moves. When the action is refused by policy — a Class X fetch, a blocked provider, a gated capture — the UI does not offer a confirm dialog at all, because a confirmation implies an override exists.

### Interaction and accessibility contract

Every interactive element is a native `<button>`, `<a href>`, `<input>`, `<select>` or a shadcn primitive built on one; nothing is a `<div>` with a click handler. Icon-only controls carry `aria-label`. Key flows are reachable and operable by keyboard: tab order follows reading order with no positive `tabindex`, no focus traps outside dialogs and drawers, and `Escape` closes every overlay. Live regions exist in the DOM before content is injected. `<html lang="en">` on the document, `lang="bn"` on Bengali error text only. One `<h1>` per page (the header page title) and no skipped heading levels; visual size and heading level are decided independently. Landmarks are structural: `<nav>` for the sidebar, `<header>`, `<main>` for the scrolling region, `<aside>` for drawers and slide-overs. Charts and the dense hop table carry text alternatives that state the same numbers, since a screen reader cannot read a bar. Nothing conveys state by colour alone: every status pill and tier chip carries its word, every quota bar carries `used / limit`, and every error carries its code.

## Do's and Don'ts

### Do

- Do keep **quiet by default, loud on exception**: neutral pill plus green dot for success, colour only for in-flight, attention and breakage, and muted zinc for anything intentionally off.
- Do render every number in mono, right-aligned, with `tabular-nums`; do render null as a muted `—` and never as `0`.
- Do spend the green accent in exactly its five permitted places, and do respect at most one primary green button per view.
- Do build every variant as a full literal class string in a static map.
- Do write all four table states separately — loading, empty, error, empty-because-filtered — and keep column widths stable across them.
- Do use skeletons rather than spinners, and `transition-colors duration-150` as the only motion.
- Do give every interactive element a visible `focus-visible:ring-1 focus-visible:ring-green-400` focus ring.
- Do hold a 4.5:1 contrast floor for all normal informational text, and reserve `text-zinc-500` for disabled content, placeholders and the null marker, where it is never the only carrier of information.
- Do keep visible control geometry compact while giving every control at least a 44x44 CSS-pixel hit area, with at least 8px between adjacent targets.
- Do keep filters, sorting, pagination and the selected tab in URL query params so a shared link reproduces the view.
- Do keep the sidebar and header fixed, scroll only the content region, and keep `min-w-[1280px]` on the shell.
- Do keep `pack_version` visible on every hop, even when null.
- Do label every overlay action in plain technical English and name the object being changed.
- Do state which statuses are retryable and back off on repeated retries; after three failures hand over a copyable error id.
- Do keep the disabled Captures nav item visible with its `sky` "Coming soon" chip, so a gated page never looks like a missing page in an audit.
- Do use `border-dashed border-amber-500/30` only for the provisional tier, so dashes always mean "not yet trustworthy".

### Don't

- **Don't** add any provider-key reveal or copy affordance — not a toggle, not a button, not a disabled placeholder, on any page.
- **Don't** add an auto-recharge toggle for BrightData or Apify in any state; the UI states that auto-recharge is off and offers no way to change it.
- **Don't** add a quota edit field; counters are read-only and the UI must not even offer the input.
- **Don't** offer a one-click "resume" while the cash guard is tripped; a confirmation dialog showing month-to-date spend and what will restart is mandatory, with no bypass.
- **Don't** offer a cold-email option in the email composer.
- **Don't** render plaintext email addresses in the suppression list — masked only, because the database stores a hash.
- **Don't** merge Yelp data into normal lead fields, don't put it in a standard column, and don't put it inside an export button; it stays a separate bordered block with the Yelp logo, a link, and "Live from Yelp · cached 24h".
- **Don't** build any login, signup, password, session or "forgot password" UI; authentication is entirely at Cloudflare Access.
- **Don't** add a theme toggle, a layout-density toggle, or a "customise dashboard" affordance — there is no light theme and no `prefers-color-scheme` handling.
- **Don't** use `localStorage` or `sessionStorage` for filters or preferences.
- **Don't** use emoji as UI symbols, an icon font, or any icon set other than `lucide-react` named imports (tree-shaken, no barrel import).
- **Don't** add an animation library, slide-ins, fade-ups, count-ups, pulsing table cells or layout animation.
- **Don't** use images or illustrations. The single permitted image is Yelp's own logo inside its attribution block.
- **Don't** write arbitrary Tailwind values or extend `tailwind.config.js` beyond `fontFamily.sans = Inter` and `fontFamily.mono = JetBrains Mono`. The only dimensional literals allowed are the four fixed by contract: `text-[13px]`, `text-[10px]`, `min-w-[1280px]`, `w-[480px]`.
- **Don't** build class names at runtime — `bg-${hue}-500/15` will not exist in a JIT build and fails silently.
- **Don't** render anything green outside the five permitted places. `emerald` is banned entirely, and `indigo` and `slate` are retired and must not reappear.
- **Don't** use any shadow other than `shadow-xl` on dialogs and popovers; no hover elevation, no inset card shadows, no glow.
- **Don't** use `text-lg` or anything larger, and don't use a fourth font weight.
- **Don't** add responsive breakpoints, a mobile or tablet layout, a hamburger menu, a collapsing sidebar, or a hidden nav drawer. Below 1280px the page scrolls horizontally, by design.
- **Don't** put a key input field anywhere on Providers; the page is read-only monitoring.
- **Don't** put a retry control on compliance, quota or gate errors, and don't state a fixed time in circuit-open copy.
- **Don't** render `0` or `COLD` for a missing tier or a missing signal, and don't hardcode coverage thresholds in the UI.
- **Don't** add any action affordance to Class X / compliance-blocked rows — not even a disabled button.
- **Don't** hide `pack_version`, and don't drop the rejected-candidate list from the hop drawer.
- **Don't** fill a healthy quota bar green, and don't colour `ok` / `active` / `done` / `valid` / `closed` pills.
- **Don't** decorate a card with a coloured left border, a gradient, a shadow, or a hover state; cards are flat and not clickable.
- **Don't** use a border for the active nav rail — use `box-shadow: inset 2px 0 0 var(--jepy-green)`, because a border shifts layout by 2px and the nav item jumps.
- **Don't** put breadcrumbs, a global search, an avatar, a notification bell, or a welcome message in the chrome.
- **Don't** convey any state by colour alone, and don't collapse an error state into an empty state.
