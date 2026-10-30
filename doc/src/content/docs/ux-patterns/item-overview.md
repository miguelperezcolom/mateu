---
title: Item overview
description: Keep an item's key information pinned while exploring the rest in tabs.
---

**Status:** ✅ Implemented · Redwood template: **Item overview page** (`oj-sp-item-overview-page` + `oj-sp-item-overview`; Redwood files it under *Details*)

An item overview page pairs a compact summary of one item — its name, picture, status and a handful
of key values — with a main area where the rest of the item's information is explored. The summary
stays put while the user works through the main area, so the identity of the item is never out of
sight. It suits people who manage many items of the same kind and move between them: a recruiter
going through candidates, a buyer going through products.

In Mateu this is the `ItemOverview` archetype: the first component field is the key-info panel, and
every `@Panel` field becomes a tab of the main area.

## When to use it

- **Read-mostly detail pages** of items managed in numbers (candidates, products, assets), where
  identity context matters across categories of information.
- When the main area is mostly **collections** — orders, attachments, history — shown one category
  at a time.

If the user must *edit* the item, prefer `AutoEditableView`; if the categories must be visible
simultaneously rather than tabbed, use the [Foldout](/ux-patterns/foldout) pattern; for a long
single-flow page with an index, use `@Toc` + sticky sections.

## Anatomy

![The item overview painted by the Redwood renderer: page header, key-info panel on the left, tabs on the right](/images/docs/redwood-templates/item-overview-1.png)

| # | Region | What it holds | Mateu piece |
|---|---|---|---|
| 1 | Navigation actions | Back to the parent page, optional search, previous / next sibling item | the page header: `@Title`, a `@Toolbar` method named `back` (or `cancel`, `close`) or the automatic parent breadcrumb |
| 2 | Item overview (the key-info panel) | Item title and subtitle, badge, avatar or photo, item actions, a body of key values, footer links | the first component field without `@Panel` (any component tree — typically an `EntityHeader`, an `Avatar`/`Image` and property rows); `panelWidth()` |
| 3 | Main slot | Detailed information about the item, typically tables and lists | component fields with `@Panel(title)`, one tab each |

## Responsive behaviour

On large screens the key-info panel is fully open beside the main area. On small screens Redwood
collapses it into a strip above the main area, and the user taps it to see everything.

In Mateu the two regions sit on one responsive grid: on Vaadin the key-info column is fixed-width
(`panelWidth()`, 22rem by default) and **sticky**, and the page stacks the panel above the tabs below
48rem. The Redwood renderer paints Spectra's `oj-sp-item-overview-page`: the overview column beside
the main area on large screens (the template's width, `panelWidth()` is not applied), stacked above
it below the large breakpoint.

![The item overview on a phone-width window](/images/docs/redwood-templates/item-overview-2.png)

## What you can configure

**Legend:** ✅ supported · 🟡 partial · ❌ not supported · ➖ not applicable

| Element | Mateu piece | Redwood | Notes |
|---|---|---|---|
| Page layout (fixed / full width) | `@PageWidth` | ✅ | edge to edge is not offered by Redwood for this template |
| Display mode (header colour) | — | ❌ | |
| Parent navigation | a `@Toolbar` method named `back` (or `cancel`, `close`), or the automatic parent breadcrumb | ✅ | Redwood's "go to parent" link in the page header |
| Search in the navigation | — | ❌ | |
| Previous / next item | — | ❌ | `PeerNavigationSupplier` is not read on composed archetypes; host the overview in a CRUD record page that provides it |
| Item title / subtitle | an `EntityHeader` (or `Text`s) in the key-info panel; `@Title` for the page header | ✅ | Redwood: `oj-sp-item-overview`'s own title — the EntityHeader's, else the panel's card title or leading heading (taken out of the body), else the page title |
| Badge | `EntityHeader.badges` in the panel | ✅ | Redwood: the overview's badge (subtle, trailing) |
| Avatar / photo | an `Avatar` or `Image` in the panel | 🟡 | no 1:1 / 4:3 aspect setting |
| Edit / share / favourite | — | ❌ | declare your own `@Toolbar` actions instead |
| Secondary item actions (up to 3) | `@Toolbar` methods | ✅ | Redwood: the overview's secondary actions (Vaadin: the page header) |
| Body (key values) | the panel's component tree (property rows, `Markdown`, a read-only form) | ✅ | |
| Footer links | links or buttons at the end of the panel's tree | 🟡 | no dedicated footer area |
| Panel width | `panelWidth()` | 🟡 | ignored by Redwood (the template's column) |
| Sticky key-info panel | built in | 🟡 | sticky on Vaadin, not on Redwood |
| Collapsed panel on small screens | — | ❌ | the panel stacks fully expanded |
| Main slot: table, list | `Grid`, `StatusList`, any component in a `@Panel` tab | ✅ | Redwood draws tables with `oj-table` |
| Main slot tabs | one `@Panel` field per tab | ✅ | `oj-tab-bar`; overflowing tabs go to a menu on phones |

## Building it with Mateu

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

Extend `ItemOverview`. The first component field is the **key-info panel** (left, sticky — it stays put while the right side scrolls); each component field annotated with `@Panel` becomes a **tab**.

```java
@UI("/product/:id")
@Title("Ergonomic chair EC-200")
public class ProductOverview extends ItemOverview {

    EntityHeader keyInfo = EntityHeader.builder()
        .title("Ergonomic chair EC-200")
        .subtitle("Office seating")
        .badges(List.of(new Chip("In stock", "success")))
        .facts(List.of(
            new Fact("SKU", "EC-200-BLK"),
            new Fact("Stock", "143"),
            new Fact("Price", "349 €")))
        .build();

    @Panel(title = "Sales")
    Chart sales = Chart.builder().chartType(ChartType.bar) /* … */ .build();

    @Panel(title = "Specifications")
    Markdown specs = new Markdown("| Property | Value | …", null, null);

    @Panel(title = "Reviews")
    Markdown reviews = new Markdown("⭐⭐⭐⭐⭐ …", null, null);

    @Toolbar
    Object back() { return URI.create("/products"); }   // named `back`: the header's parent link

    @Toolbar(buttonStyle = ButtonStyle.primary)
    Object reorder() { return URI.create("/product/EC-200/reorder"); }
}
```

![Product overview](/images/docs/item-overview/product-overview.png)

Override `panelWidth()` (default `22rem`) to size the key-info panel.

As a routed page, an item overview has a page toolbar like any other page: its `@Toolbar` (and
`@Button`) methods and fields show there and run on it. Routed at a CRUD's `:id` (an authored
route), it also gets that CRUD's **Back to list** and **Edit** — see
[CRUD navigation flow](/java-user-manual/build/crud-navigation-flow/#the-cruds-navigation-on-your-page).

An item overview can also be the content of a CRUD's record page, under the CRUD's own header and
toolbar: the record class implements `DetailContentSupplier` and returns it — see
[The record page](/java-user-manual/build/customizing-crud-and-listings/#the-record-page).

### In YAML

A YAML page fills the template with `template: {type: ItemOverviewPage}` on its `type: Form`: the
panel's `avatar` or `photo` and its `body`/`footer` slots, the form's `content` as the `main` slot —
see [Page templates](/define/yaml/pages/#page-templates--template).

```yaml
type: Form
title: ${state.name}
subtitle: Character
template:
  type: ItemOverviewPage
  avatar: {src: "${state.image}"}
  body:
    - {type: FormField, id: gender, label: Gender, readOnly: true, propertyRow: true}
content:
  - type: TabLayout
    tabs:
      - type: Tab
        label: Details
        content:
          type: VerticalLayout
          horizontalAlignment: STRETCH
          content:
            - type: Card
              cssClasses: mateu-section          # a section: Redwood draws Spectra's oj-sp-section
              title: {type: Text, container: h3, text: Physique}   # the heading names the section
              content:
                type: FormLayout
                content:
                  - {type: FormField, id: height, label: Height, readOnly: true, propertyRow: true}
```

Redwood's own examples (the candidate profile, the product overview) fill the main slot with
**sections**, under a compact tab bar: so does the example above. On Redwood the template owns the
whole page — the header band, the overview panel and the main area sit on the page background, with
no content card around them — and the panel's `body` is drawn like Spectra's read-only form layout,
the label above the value (a `propertyRow` there is drawn that way).

## Redwood parameter and slot reference

What the Redwood `item-overview-page` template and its `item-overview` key-info pattern expose, and
what Mateu gives you for them. The canonical page-header elements shared by every template are
documented once in [Page templates](/ux-patterns/page-templates/).

**Legend:** ✅ supported · 🟡 partial · — not supported · ⚪ deliberately out of scope

### Page (`item-overview-page`)

| Redwood prop / slot | Mateu | |
|---|---|---|
| **Slot** `overview` (key info) | the first component field, sticky; width via `panelWidth()` (default `22rem`) | ✅ |
| **Slot** `main` | component fields annotated `@Panel`, rendered as tabs | ✅ |
| `overviewExpanded` + `spOverviewCollapse` | — the key-info panel is always expanded | — |
| `nextItem` / `previousItem` + `getPreviousNextItems` | `PeerNavigationSupplier` → `PeerNav` on a page that is not a composed archetype (e.g. a CRUD record page hosting the overview); the `ItemOverview` archetype itself cannot carry it | 🟡 |

### Key-info pattern (`item-overview`)

| Redwood prop / slot | Mateu | |
|---|---|---|
| `itemTitle` / `itemSubtitle` | the `EntityHeader`'s title/subtitle, else the panel's title or leading heading, else the page title | ✅ |
| `photo {src}` / `avatar {src, initials}` | YAML `template.photo` / `template.avatar`; in Java an `EntityHeader` image / any component in the panel | ✅ |
| `badge {text, style: strong \| subtle, position: leading \| trailing}` | `@BadgeInHeader` / `EntityHeader` badges; no `position` control | 🟡 |
| `isFavorite` + `spExpand` | — | — |
| `displayOptions {edit, share, favorite}` | `edit`: the page's primary toolbar button when it edits (Redwood); `share`/`favorite` — | 🟡 |
| **Slots** `body` / `footer` | YAML `template.body` / `template.footer`; in Java the panel's component tree is the `body`, no footer area | ✅ |
| `spEdit` / `spShare` | `spEdit` runs the page's primary (edit) button; `spShare` — | 🟡 |

## Known gaps

The element-by-element review, with code references, is in
[item-overview review](https://github.com/miguelperezcolom/mateu/blob/master/design/redwood-templates/item-overview.md). In short:

- Redwood paints the page with Spectra's `oj-sp-item-overview-page` + `oj-sp-item-overview`, with
  nothing of Mateu's over the template (since 2026-10-30: the panel surface the renderer used to
  force is gone — Spectra draws the panel as its own card — and so is the forced `light` display
  mode, which is now Spectra's default or the app's `appMode`). The tabs stay an `oj-tab-bar` in the
  `main` slot.
- The page owns the page on Redwood (2026-10-30): edge to edge on the page background, compact
  tabs, sections with Spectra's header, a stacked body — what the guide's examples show.
- On Redwood the key-info panel ignores `panelWidth()` and does not collapse into a strip on small
  screens (it stacks above the tabs).
- No previous/next, search, edit/share/favourite or footer area on the archetype.
