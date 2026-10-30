---
title: Welcome page
description: A friendly introduction to a flow with clear calls to action.
---

**Status:** ✅ Implemented · Redwood template: **Welcome page** (`oj-sp-welcome-page`, overview category)

A welcome page is the front door of a workflow. A large banner with a picture says what the flow is
for and offers the one or two things the user will most likely want to do next; underneath, a few
tiles point at the information or the tasks that matter before going further. It sets the tone of
the flow, so it is built to be looked at, not worked in.

In Mateu this is the `Welcome` archetype: `Button` fields become the banner's calls to action and
`@Panel` fields become the tiles below it. The banner on its own is also available on any page
through `@WelcomeBanner`.

## When to use it

- As the **entry route of a flow** used by occasional or first-time users: self-service portals,
  guided processes, seasonal tasks, a team's record of interactions.
- When the page should **introduce and route**, not hold the work itself.

Don't use it to complete a transaction or to edit a record — send the user from the call to action
to the page that does that. Power users working the same screen all day are better served by a
[Dashboard](/ux-patterns/dashboard) or by the operational screen itself.

## Anatomy

![The welcome page painted by the Redwood renderer: banner with illustration and actions, tiles below](/images/docs/redwood-templates/welcome-1.png)

| # | Region | What it holds | Mateu piece |
|---|---|---|---|
| 1 | Banner (page information and actions) | Title, optional overline and description, the image, the action area (buttons or a search box), optional back navigation | `heroOverline()`, `heroTitle()`, `heroSubtitle()`, `heroImage()`, `heroTone()`; `Button` fields |
| 2 | Main slot | The information or tasks the user needs before starting: cards, list items, expandable lists, sections, a read-only form | component fields annotated `@Panel` (tiles on a responsive grid) |

## Responsive behaviour

On wide screens the banner places its picture beside the text; on small screens the picture moves
above the text, whatever image layout was chosen. The tiles below reflow from several per row to one.

In Mateu, the Redwood renderer paints the page with Spectra's own `oj-sp-welcome-page` template (its
banner and its main slot, which holds the tiles), so the banner reflows exactly as Redwood specifies;
the tiles stack below the `md` breakpoint. The
other renderers centre the hero text over the image (with a dark overlay keeping it readable) and
auto-fit the tiles.

![The same welcome page on a phone-width window](/images/docs/redwood-templates/welcome-2.png)

## What you can configure

**Legend:** ✅ supported · 🟡 partial · ❌ not supported · ➖ not applicable

| Element | Mateu piece | Redwood | Notes |
|---|---|---|---|
| Page layout | `@PageWidth` on the class | ✅ | fixed by default; full width allowed; Redwood does not offer edge to edge for this template |
| Page title (required) | `heroTitle()` (defaults to the page's `@Title` / `TitleSupplier`); `@WelcomeBanner(title)` on other pages | ✅ | an override wins over `@Title` |
| Description | `heroSubtitle()` (defaults to the page's `@Subtitle` / `SubtitleSupplier`) / `@WelcomeBanner(subtitle)` | ✅ | |
| Overline (greeting above the title) | `heroOverline()` / `@WelcomeBanner(overline)` | ✅ | Spectra's `overlineText` on the welcome page; a small quiet line above the title on the other renderers (the page header's `@Overline` is a different element) |
| Image | `heroImage()` / `@WelcomeBanner(image)` | ✅ | full bleed (the whole banner); without one, Redwood shows one of its own gallery illustrations |
| Image layout: half the banner / whole banner | — | ❌ | the other renderers always use the image as the banner background |
| Hide the image on phones | — | ❌ | |
| Banner colour | `heroTone()` / `@WelcomeBanner(tone)` | ✅ | each `HeroTone` maps to the banner's `dark-<tone>` background |
| Call-to-action button | first `Button` field | ✅ | its `actionId` runs the matching `@Action` method |
| More actions (up to 7, the rest in an overflow menu) | further `Button` fields | ✅ | every one travels: Spectra shows them as buttons or in its overflow menu |
| Search box in the banner | — | ❌ | for a search-first landing use [Hero search](/ux-patterns/hero-search/) |
| Back navigation (PWA) | — | ➖ | |
| Main slot: cards | `@Panel` component fields | ✅ | title + subtitle + content per tile |
| Main slot: lists, expandable lists, sections, read-only form | any component inside a `@Panel` | ✅ | |
| A component that is not a `@Panel` | plain component field | 🟡 | Redwood then stops treating the page as a welcome and paints the banner as a content band |
| Toast messages | an action returning a `Message` | ✅ | |
| Empty state | `EmptyState` inside a `@Panel` | ✅ | |

## Building it with Mateu

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

Extend `Welcome`. `Button` fields become call-to-action buttons inside the hero; component fields annotated with `@Panel` become highlight tiles on a responsive grid below.

```java
@UI("/welcome")
@Title("Welcome")
public class WelcomeDemo extends Welcome {

    Button start = Button.builder()
            .label("Start check-in").actionId("startCheckin")
            .buttonStyle(ButtonStyle.primary).build();

    Button browse = Button.builder()
            .label("See today's arrivals").actionId("openArrivals").build();

    @Panel(title = "1 · Search the booking")
    Markdown step1 = new Markdown("Find the reservation by locator, guest name or room.", null, null);

    @Panel(title = "2 · Verify the guests")
    Markdown step2 = new Markdown("Scan documents and confirm the cardex.", null, null);

    @Override protected String heroTitle() { return "Front desk check-in"; }
    @Override protected String heroSubtitle() { return "Everything you need, in three steps"; }
    @Override protected HeroTone heroTone() { return HeroTone.pine; }

    @Action
    Object startCheckin() { return URI.create("/checkin"); }

    @Action
    Object openArrivals() { return URI.create("/arrivals"); }
}
```

![Welcome page](/images/docs/welcome/welcome-demo.png)

The CTA's `actionId` runs the matching `@Action` method — return a `URI` to navigate into the flow. Override `heroImage()` for a background image (a dark overlay keeps text readable).

### In YAML

A YAML page fills the template with `template: {type: WelcomePage}` on its `type: Form` — the
banner from the form's title, subtitle (the description), overline and toolbar (the calls to
action), the template's `backgroundColor`, the form's `content` as the tiles below — see
[Page templates](/define/yaml/pages/#page-templates--template). On Redwood it is Spectra's
`oj-sp-welcome-page`; the banner's image panel is required by the guide, so a tone with no gallery
illustration (slate, lilac, rose, pebble) gets Spectra's own themed image.

## The welcome banner element (and the accent strip rule)

The hero the archetype renders is the Redwood **Welcome Banner** element — a branded band with a
big title, subtitle and optional background image. You can put one at the top of **any** page
(archetype or not) with the `@WelcomeBanner` annotation on the view class:

```java
@UI("/onboarding")
@Title("Onboarding")
@WelcomeBanner(title = "Find your flow", subtitle = "Three steps and you are done")
public class Onboarding { /* … */ }
```

The banner title falls back to the page `@Title` when left blank. Redwood's anatomy rule: **the
accent color strip only shows on pages WITHOUT a welcome banner** — so on any page that carries
one (this annotation, or a `HeroSection` anywhere in the content, like `Welcome` and
`HeroSearch`), the Redwood renderer suppresses the strip automatically.

## Overline

A short line **above** the hero title introduces it — a greeting, the area the page belongs to:

```java
@Override
protected String heroOverline() { return "Good morning"; }
```

or `@WelcomeBanner(overline = "Good morning")` on any page (`HeroSection.overline` when composing
fluently). Empty or `null` shows none. Redwood passes it to the welcome template's own
`overlineText`; Vaadin, React Native and IntelliJ draw it small and muted above the title. It is
`@Experimental` (3.0-beta.13). In .NET override `HeroOverline` / set `[WelcomeBanner(Overline = …)]`;
in Python override `hero_overline()` / pass `@welcome_banner(overline=…)`.

## Hero tone

The hero band can take one of nine deep tones — the Redwood welcome palette idea, expressed as
hues, not as Oracle's swatches:

```java
@Override
protected HeroTone heroTone() { return HeroTone.pine; }
```

or `@WelcomeBanner(tone = HeroTone.plum)` on any page. `auto` (the default) keeps the renderer's
own band. Vaadin, React Native and IntelliJ paint Mateu's palette (ocean `#1f4e79`, pine `#2d5a3d`,
lilac `#5b4a7a`, teal `#1f5c5c`, rose `#7a3b4f`, pebble `#5a5550`, slate `#3d4a57`, plum `#5e3557`,
sienna `#7a4a2e`, with light ink); Redwood maps each tone onto its welcome banner's
`dark-<tone>` background. With `auto`, Redwood gives each page one of its illustrated looks,
chosen from the page's identity (its class, or its route for a YAML page): a page always shows
the same look, on every visit, while different welcome pages vary.

![A pine hero](/images/docs/welcome/hero-tone.png)

## Coverage

| | Java | .NET | Python | Vaadin | Redwood | React Native | IntelliJ |
|---|---|---|---|---|---|---|---|
| Hero + CTAs + highlight tiles | ✅ | ✅ | ✅ | ✅ | ✅ ¹ | ✅ | ✅ |
| `@WelcomeBanner` on any page | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Hero tone | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

¹ On Spectra's `oj-sp-welcome-page`: every CTA (the rest in its overflow menu), `heroImage()` full bleed.

## Redwood parameter and slot reference

What the Redwood `welcome-page` template exposes, and what Mateu gives you for it. The canonical
page-header elements shared by every template are documented once in
[Page templates](/ux-patterns/page-templates/); this table covers what is specific to this one.

**Legend:** ✅ supported · 🟡 partial · — not supported · ⚪ deliberately out of scope

| Redwood prop / slot | Mateu | |
|---|---|---|
| `pageTitle` (hero title) | `heroTitle()`, or `@WelcomeBanner(title=…)` on any page | ✅ |
| `descriptionText` | `heroSubtitle()` / `@WelcomeBanner(subtitle=…)` | ✅ |
| `overlineText` (small text above the title) | `heroOverline()`, or `@WelcomeBanner(overline=…)` on any page (`HeroSection.overline`) | ✅ |
| `primaryAction` / `secondaryAction` / `secondaryActions` | `Button` fields; the fluent `Button` carries `iconOnLeft`/`iconOnRight`, `disabled` and `actionId`. The first is `primaryAction`, the rest `secondaryActions` | ✅ |
| `backgroundColor`: 9 dark tones + `auto` | `heroTone()` / `@WelcomeBanner(tone=…)` → `HeroTone` (ocean, pine, lilac, teal, rose, pebble, slate, plum, sienna, `auto`) | ✅ |
| `illustrationBackground` + `illustrationForeground` (two illustration layers) | `heroImage()` — one image, passed as the background layer (no foreground); without it, a gallery pair | ✅ |
| `themedImage: pebbles \| none` | ⚪ an Oracle illustration asset; design-system-specific by nature | ⚪ |
| `displayOptions.imageStretch: none \| full` | `full` when `heroImage()` is set (like the other renderers' background image), `none` for the gallery illustration; not configurable | 🟡 |
| `displayOptions.mobileImage` | — | — |
| `displayOptions.responsivePadding` | — | — |
| `displayOptions.inFlowBack` + `spInFlowBack` | back/cancel affordances approximate it; no explicit in-flow back | 🟡 |
| **Slot** default (tiles under the hero) | component fields annotated `@Panel`, on a responsive grid | ✅ |
| **Slot** `search` | the app-level smart search bar / ⌘K palette, not a page slot | 🟡 |
| `spPrimaryAction` / `spSecondaryAction {actionId}` | the `@Action` method matching the button's `actionId`; return a `URI` to navigate | ✅ |

One anatomy rule from Redwood that Mateu applies automatically: **the accent colour strip only
shows on pages without a welcome banner**, so any page carrying one — this archetype,
`@WelcomeBanner`, or a `HeroSection` anywhere in the content — suppresses the strip.

## Known gaps

The element-by-element review, with code references, is in [welcome review](https://github.com/miguelperezcolom/mateu/blob/master/design/redwood-templates/welcome.md).
In short:

- No image layout choice (half / whole banner —
  a `heroImage()` is always full bleed), no "hide image on phones", no search in the banner (the
  archetype has no search).
- Redwood paints the page with Spectra's `oj-sp-welcome-page` (since 2026-10-24); the tiles in its
  main slot are JET panels.
