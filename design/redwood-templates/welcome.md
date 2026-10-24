# Redwood «Welcome page» — review against the guide (2026-10-23)

Source: the Redwood usage guideline for the template (`oj-sp-welcome-page`,
`oj-sp-welcome-page-pattern` in VB, category *Overview*, since 22C), the category page "Choosing the
right overview page template" (variations: read-only form, list items, expandable list items,
cards; subcomponents: banner/toast messages, empty state) and the real `oj-sp` 2604.1.0 API
(`design/vb-page-template-apis.md` §2.1).

Working rule: in Redwood, **Spectra/VB rule** — their template, component and contract before an
imitation of ours; imitate only when their contract cannot be met with Mateu's content, and say so.

Legend: ✅ supported · 🟡 partial · ❌ missing · ➖ not applicable.

Mateu pieces: `Welcome` archetype
(`backend/shared/core/src/main/java/io/mateu/core/infra/declarative/orchestrators/welcome/Welcome.java`),
composition `WelcomeComposer.java:34-102`; `@WelcomeBanner` (`uidl/.../annotations/WelcomeBanner.java`,
mapped in `ReflectionPageMapper.java:31-42`). Redwood: projection `welcomeOf`
(`frontend/web/monorepo/apps/redwood/poc/core/overviews.mjs:116-182`), look/tone
`overviews.mjs:47-100`, markup `webApps/vbredwoodapp/flows/main/pages/main-start-page.html:9845-9880`
(`oj-sp-header-welcome-banner` + JET `oj-panel` tiles).

## 1. When to use it

The starting point of a workflow: an overview plus an image that make a first impression and point
at the critical information or actions. Not for transactional tasks or editing. In Mateu: `Welcome`
(and `InferredWelcome` under `@AutoPage` for a class of `Button`s + presentational fields).

## 2. Regions (anatomy)

| # | Region | Guide | Mateu (model) | Redwood (renderer) | Status |
|---|---|---|---|---|---|
| 1 | Banner with page information and actions | title (req.), image (req.), overline, description, action area, navigation | `HeroSection` (title, subtitle, image, tone, CTA `Button`s) — `WelcomeComposer.java:77-87` | Spectra `oj-sp-header-welcome-banner` (`main-start-page.html:9847-9860`) | 🟡 see §5 |
| 2 | Main slot | cards, list items, expandable list items, sections | `@Panel` fields → `DashboardPanel` tiles on a `ResponsiveGrid` (`WelcomeComposer.java:62-94`) | `div.oj-panel` tiles in an `oj-flex` row (`main-start-page.html:9861-9880`), widths `panelColClass(colSpan, 3)` (`overviews.mjs:125-145`) | ✅ (JET panels, Redwood's own Cards would be `oj-sp-…` collection containers) |
| — | The template itself | `oj-sp-welcome-page` (default slot + `search`) | — | **`oj-sp-welcome-page`** (2026-10-24): its banner + the tile row in its default slot | ✅ see §7 |

Page detection is strict (`overviews.mjs:102-121`): a tree holding anything but the hero, its
`DashboardPanel`s and layout frames is NOT taken for a welcome — a non-`@Panel` component field
(allowed by the archetype, `WelcomeComposer.java:73-75`) drops the whole page to the generic
content, where the hero is a content band (`content.mjs:1508`, imitation).

## 3. Responsive behaviour

| Breakpoint | Guide | Mateu / Redwood | Status |
|---|---|---|---|
| Large | image beside the content in the banner | the Spectra banner does it | ✅ |
| Small | image above the content, whatever the image layout | the Spectra banner does it; tiles `oj-sm-12` | ✅ |

## 4. Page properties

| Property | Guide | Mateu | Status |
|---|---|---|---|
| Page layout | fixed (default) / full width; edge to edge **no** | `@PageWidth` → wire `pageWidth` (`ComponentTreeSupplierMapper.java:69`); default fixed (`overviews.mjs:424-438`) | 🟡 a declared `EDGE_TO_EDGE` is neither refused nor warned |

## 5. Banner elements

| # | Element | Req. | Mateu | Redwood | Status |
|---|---|---|---|---|---|
| 1 | Page title | yes | `heroTitle()` (default **null**, no `@Title` fallback — `Welcome.java:27-29,56-58`; `InferredWelcome.java:46-47` and `@WelcomeBanner` do fall back) | `page-title` | 🟡 a Welcome without `heroTitle()` has an empty required title |
| 2 | Image panel | yes | `heroImage()` URL | `heroImage()` → `illustration-background` (no foreground) with `imageStretch: full` (`welcomeOf` → `image`); without one, the Oracle gallery pair rotated per visit or chosen by tone | ✅ |
| 2b | Hide image on small breakpoints | no | — | `displayOptions.mobileImage` not set | ❌ |
| 3 | Overline | no | `Welcome.heroOverline()` / `@WelcomeBanner(overline)` → `HeroSection.overline` → `HeroSectionDto.overline` (3.0-beta.13) | `overline-text` bound (`welcomeOf` → `mateuWelcome.overline`); a content hero's atom paints `.mateu-hero-overline` above its title | ✅ |
| 4 | Description | no | `heroSubtitle()` | `description-text` | ✅ |
| 5a | Action area — buttons (1 CTA + up to 6 in overflow) | no | every `Button` field | first → `primary-action`, the rest → `secondary-actions` (`secondaryCtas`, ids `cta<n>` resolved by `secondaryById` in `dispatchHostBlockAction`) — Spectra shows them as buttons or in its overflow menu | ✅ |
| 5b | Action area — search (Input Search) | no | — (the `Welcome` archetype has no search) | the template's `search` slot unused | ❌ (HeroSearch is another template) |
| 6 | Navigation (PWA) | no | — | — | ➖ |
| — | Banner image layout: sectional / full bleed | — | — (Vaadin: always background) | `full` with a `heroImage()`, `none` with the gallery illustration; not configurable | 🟡 |
| — | Redwood illustration vs custom image | — | `heroImage()` | both | ✅ |
| — | Banner colour (from the image / tone) | — | `heroTone()` / `@WelcomeBanner(tone)` → `HeroSectionDto.tone` | `background-color` `dark-<tone>` (`overviews.mjs:70-86`) | ✅ |

## 6. Main slot: components

| Guide | Mateu | Status |
|---|---|---|
| Cards | `@Panel` tiles | ✅ |
| List items / expandable list items / sections / read-only form | any component inside a `@Panel` (atoms, `overviews.mjs:128-147`) | ✅ |
| Banner messages | not verified on composed archetypes (page banners are page metadata) | ❓ |
| Toast messages | action returning `Message` | ✅ |
| Empty state | `EmptyState` in a `@Panel` | ✅ |

## 7. Template component vs composition

`oj-sp-welcome-page` is a container (header props + default slot + `search`) whose banner API is the
same as the `oj-sp-header-welcome-banner` already used. The tiles are VB-painted atoms, which a
default slot can host. Using the template would bring its padding and its own main-slot layout.
Cost: small — swap the wrapper, keep the tile row as the default slot content.

## 8. Proposed plan

1. ~~**All CTAs**~~ — DONE 2026-10-24: first = `primaryAction`, the rest `secondaryActions`.
2. ~~**Overline**~~ — DONE 2026-10-24: `Welcome.heroOverline()` / `@WelcomeBanner(overline)` →
   `HeroSection.overline` → `overline-text` (all backends and renderers).
3. ~~**Custom image**~~ — DONE 2026-10-24 (`illustration-background`, no foreground, `imageStretch: full`).
4. **Title fallback**: `Welcome.heroTitle()` defaults to the class `@Title`, like `InferredWelcome`.
5. **Image layout + mobile image**: a `WelcomeDisplay(imageStretch, mobileImage)` record via
   `display()`, the grammar already used by other archetypes.
6. **Loosen detection**: a non-`@Panel` component should become a tile, not demote the page.
7. ~~Move to `oj-sp-welcome-page`~~ — DONE 2026-10-24. Overline (2) done the same day.
