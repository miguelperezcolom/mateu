# Overview pages — Mateu summary of the Redwood category (2026-10-23)

Draft for `doc/src/content/docs/ux-patterns/page-templates.md` (to be folded in by hand). Source:
the Redwood comparison guideline "Choosing the right overview page template", reformulated; no
Oracle text or image is copied. Per-template reviews: `dashboard-landing.md`, `welcome.md` in this
directory.

---

## Overview pages

An **overview page** sums up a business flow so that the user sees, at a glance, what needs their
attention before they dive into any one record. Redwood has two of them, and Mateu has an archetype
for each:

| Template | What it is for | Mateu | Doc |
|---|---|---|---|
| **Dashboard landing page** | A prioritised "one-stop" status of the business: a strip of KPIs on top and a grid of panels that explain them | `Dashboard` (or a plain class with `MetricCard` fields under `@AutoPage`) | [Dashboard](/ux-patterns/dashboard/) |
| **Welcome page** | A visually engaging first page of a workflow: a banner with an image and the next actions, and a few tiles with what matters before starting | `Welcome` (and `@WelcomeBanner` on any page) | [Welcome page](/ux-patterns/welcome-page/) |

The pages that show **one** object — Foldout, General overview, Item overview — look like
overviews but Redwood files them under *Details*; see
[Choosing a page template](/ux-patterns/choosing-a-page-template/#detail-pages-one-entity).

### Dashboard landing page — two arrangements

- **Hero**: one visualization carries the story, so it takes the full width at the top, with
  secondary panels below it. In Mateu: declare that `@Panel` first and give it `colSpan` equal to
  `columns()`.
- **Above the fold**: two to five panels must be read together. In Mateu: keep the spans so the
  panels fill one or two rows of `columns()`.

Both start with the page header (title required; subtitle, primary action, context or object
switcher optional), then the **scoreboard** (consecutive `MetricCard` fields), an optional
**performance title**, and the **grid** of **panels** (`@Panel(title, subtitle)`).

| Aspect | Redwood | Mateu |
|---|---|---|
| Page width | fixed, full width or edge to edge | `@PageWidth`; fixed by default |
| Context | a standalone page | a routed `@UI` class |
| Panel content | charts, treemaps, sunbursts, thematic maps, lists, embedded analytics | `Chart`/`TrendChart`, `Map`, `Grid`, `StatusList`, `Markdown`…; no treemap/sunburst |
| Empty panel | an empty-state message | `EmptyState` |
| Required | title | `@Title` |
| Options | subtitle, switchers, primary action, back arrow (PWA), grid layouts | primary action (`@Toolbar`), grid layout (`columns()`, `colSpan`); subtitle and switchers are not available on the archetype yet |
| Drawers that pair with it | general drawer, create/edit drawer | an action returning a `Drawer` |

### Welcome page — what goes under the banner

The banner is always the same (title, optional greeting and description, image, actions or a search
box); what changes is the main slot underneath:

- a **read-only form** — a `@Panel` holding a read-only component tree;
- a **list** or an **expandable list** — a `@Panel` holding a `StatusList`, a `Grid` or collapsible
  content;
- **cards** — one `@Panel` per card.

| Aspect | Redwood | Mateu |
|---|---|---|
| Page width | fixed (default) or full width | `@PageWidth`; fixed by default |
| Context | a standalone page | a routed `@UI` class |
| Messages | banner and toast messages, empty state | toasts from actions (`Message`), `EmptyState` |
| Required | title | `heroTitle()` (no `@Title` fallback on the archetype yet) |
| Options | background illustration or uploaded image, image on/off on phones, a primary and a secondary action — or a search box | `heroImage()` (Redwood shows its own illustration instead), `heroTone()`, `Button` fields (Redwood paints two); no phone-image switch, no search |

Note: Redwood's own pages disagree on the number of banner actions — the category page says a
primary and one secondary, the template guide allows one call to action plus up to six in an
overflow menu. Mateu sends every `Button` field; the Redwood renderer currently paints the first two.

### Renderer status (Redwood)

| | Built with Spectra's component? | Biggest gap |
|---|---|---|
| Dashboard landing page | ❌ composed: Spectra page header + JET panels; no `oj-sp-dashboard-landing-page` / `oj-sp-scoreboard` / `oj-sp-dashboard-panel` | a KPI drill-in is a «View» button, not a clickable tile; `rowSpan` is ignored |
| Welcome page | 🟡 Spectra's banner (`oj-sp-header-welcome-banner`) + JET tiles; not `oj-sp-welcome-page` | only two actions, custom image ignored, no overline |
