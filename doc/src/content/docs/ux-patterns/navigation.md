---
title: Navigation & Menus
description: Navigation patterns for business applications — from flat tabs to deep multi-level structures.
---

Navigation is the skeleton of a backoffice application. A poorly chosen navigation pattern forces users to memorise structure instead of doing work. Mateu selects a navigation style automatically based on menu structure, and lets you override it when the inference is wrong.

## How Mateu selects the navigation style

By default, Mateu applies this inference chain:

```
Menu federates a RemoteMenu                      →  Top navigation bar
Menu has submenus (> 2 levels)                   →  Tiles hub (top nav + card grid at the depth boundary)
Menu has submenus and > 7 top-level entries      →  Hamburger menu
Menu has submenus (≤ 2 levels)                   →  Top navigation bar
Menu has no submenus                             →  Tabs
```

You can override the inference at any point with `@App`:

```java
@App(AppVariant.MENU_ON_LEFT)
public class MyAdminApp { ... }
```

---

![Menu app — navigation bar with top-level tabs](/images/docs/build/navigation.png)

## Pattern catalogue

### Tabs

**Status:** ✅ Implemented — `AppVariant.TABS`

The default for applications with a flat, shallow menu (no submenus). Each top-level section is a tab. Best for 3–8 peer sections with no hierarchy.

```
┌──────┬──────────┬──────────┬──────────┐
│ Home │ Products │ Orders   │ Reports  │
└──────┴──────────┴──────────┴──────────┘
  Content area
```

**When to use:** Flat apps, dashboards, tools with few sections.

---

### Top navigation bar

**Status:** ✅ Implemented — `AppVariant.MENU_ON_TOP`

The default for applications with up to two levels of menu hierarchy. Section groups appear as top-level items; subsections drop down on hover or click.

```
[Logo]  Catalogue ▾   Operations ▾   Reports ▾   Settings ▾
         ├ Products     ├ Orders        ├ Sales
         ├ Categories   ├ Shipments     └ Inventory
         └ Brands       └ Returns
```

**When to use:** Standard backoffice apps with 2-level structure.

---

### Sidebar (left navigation)

**Status:** ✅ Implemented — `AppVariant.MENU_ON_LEFT`

A vertical left panel with collapsible section groups. Keeps the full navigation tree visible and persistent while the user works, at the cost of horizontal space.

```
┌──────────────┬─────────────────────────────┐
│ ▼ Catalogue  │                             │
│   Products   │   Content area              │
│   Categories │                             │
│   Brands     │                             │
│ ▶ Operations │                             │
│ ▶ Reports    │                             │
│ ▶ Settings   │                             │
└──────────────┴─────────────────────────────┘
```

**When to use:** Apps where users jump frequently between sections; data-dense environments where tab/top-bar switching is disorienting.

```java
@App(AppVariant.MENU_ON_LEFT)
public class MyAdminApp { ... }
```

---

### Hamburger / Drawer

**Status:** ✅ Implemented — `AppVariant.HAMBURGER_MENU`

Navigation is hidden behind a hamburger icon and slides in as a drawer. Maximises content space. Standard on mobile; acceptable on desktop for infrequently accessed sections.

```
☰  [Logo]  [App title]                    [User ▾]
```

```
┌──────────────┐
│ ✕  Menu      │
│ ─────────    │
│ Home         │
│ ▼ Catalogue  │
│   Products   │
│   Categories │
│ Operations   │
│ Reports      │
└──────────────┘
```

**When to use:** Mobile-first apps; dense single-page tools where navigation is secondary to the content.

---

### Navigation rail

**Status:** ✅ Implemented — `AppVariant.RAIL`

A slim 72px vertical strip with icon and short label per item. Items with children open a 200px secondary panel listing their children. Narrower than the full sidebar; ideal for users who know the sections well.

```
┌────┬─────────────────────────────┐
│ 🏠 │                             │
│Home│   Content area              │
│    │                             │
│ 📦 │                             │
│Cat.│                             │
│    │                             │
│ 🛒 │                             │
│Ops │                             │
└────┴─────────────────────────────┘
```

With a parent item open:

```
┌────┬────────────┬────────────────┐
│ 🏠 │ Operations │                │
│Home│ ────────── │  Content area  │
│    │ Orders     │                │
│ 📦 │ Shipments  │                │
│Cat.│ Returns    │                │
│    │            │                │
│ 🛒 │            │                │
│Ops │            │                │
└────┴────────────┴────────────────┘
```

**When to use:** Apps targeting users who know the sections well and want compact navigation; hybrid desktop/tablet layouts.

```java
@App(AppVariant.RAIL)
public class MyAdminApp { ... }
```

Items without an `icon` field show the first letter of the label in a circle as fallback.

---

### Tiles hub

**Status:** ✅ Implemented — `AppVariant.TILES` (also auto-inferred for depth > 2)

A top nav bar where clicking an item with children shows a responsive card grid instead of a dropdown. Each card displays the section's label and optional description. Clicking a card navigates into that section; if the card itself has children, another tiles hub is shown.

```
[Logo]  Catalogue   Operations   Reports   Settings

  Operations

  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
  │   Orders     │  │  Shipments   │  │   Returns    │
  │              │  │              │  │              │
  │ Manage and   │  │ Track and    │  │ Process      │
  │ search POs   │  │ dispatch     │  │ refunds      │
  └──────────────┘  └──────────────┘  └──────────────┘
```

**When to use:** Apps with 3+ levels of menu depth where dropdowns become unwieldy; home/dashboard landing pages.

Tile descriptions are populated via `@Menu(description = "...")`:

```java
@Menu(description = "Manage and search purchase orders.")
private OrdersSection orders;

@Menu(description = "Track dispatched shipments and update delivery status.")
private ShipmentsSection shipments;
```

**Automatic inference:** when Mateu detects that any top-level menu item has grandchildren (depth > 2), it automatically selects `TILES` without any annotation.

---

### Deep-menu rule (> 2 levels)

**Status:** ✅ Implemented

When a menu exceeds two levels of depth, Mateu automatically switches to the `TILES` variant. The top-level items appear in the nav bar as flat (no dropdowns); clicking one with children shows a tiles hub in the content area.

```
Top nav:   Home  |  Catalogue  |  Operations  |  …

Click "Operations" →  shows tiles hub in content area

  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │  Orders  │  │Shipments │  │ Returns  │
  └──────────┘  └──────────┘  └──────────┘
```

The inference happens in `AppMetadataExtractor`: if any `Menu` item contains children that are also `Menu` items (i.e. submenu depth ≥ 3), the variant is set to `TILES`.

---

### Command palette

**Status:** ✅ Implemented — `⌘K` / `Ctrl+K`, available in all variants

A keyboard-triggered overlay that lets users search and jump to any section by typing. Results show the item label and its breadcrumb path (e.g. `Operations › Shipments`). Always active — no opt-in required.

```
┌─────────────────────────────────────────────┐
│ 🔍  Go to…                                  │
│ ─────────────────────────────────────────── │
│  Orders            Operations               │
│  Shipments         Operations               │
│  Returns           Operations               │
│  Products          Catalogue                │
└─────────────────────────────────────────────┘
```

**Keyboard controls:**

| Key | Action |
|---|---|
| `⌘K` / `Ctrl+K` | Open / close |
| Type | Filter results |
| `↑` `↓` | Move selection |
| `Enter` | Navigate to selected item |
| `Escape` | Close |

Results are sourced from the same menu tree used for the main navigation, flattened to leaf items only.

---

### Card menus (a group that opens as cards)

**Status:** ✅ Implemented — Vaadin, Redwood, React Native and IntelliJ; Java, .NET, Python and YAML

A menu **group** can open as a panel of **cards** instead of a plain dropdown, like the product
menus of a documentation site. Each entry is a card with a **title** (its label), a
**description**, and an **icon** or an **image**. An entry that holds entries of its own is not a
destination: its entries become **actions** (links) on its card.

```
┌ Bookings ▾ ─────────────────────────────────────────────────────────────┐
│ ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐ │
│ │ 📋 Check-in          │ │ [floor plan image]   │ │ 🧾 Billing           │ │
│ │ Sign the registration│ │ Floor plan           │ │ Folios, charges and  │ │
│ │ card and scan the ID │ │ Rooms coloured by    │ │ payments             │ │
│ │                      │ │ housekeeping status  │ │ Folio · New booking  │ │
│ └──────────────────────┘ └──────────────────────┘ └──────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

Use it when a group's entries need a word of explanation to be chosen well: a launcher for
occasional tasks, a product menu, a "quick access" group. Keep plain lists for the everyday
navigation, where the label alone is enough.

**YAML** (app shell) — `presentation` on the group and on its entries, `description` on each entry:

```yaml
type: AppShell
title: Front office
variant: MENU_ON_TOP
menu:
  - type: Menu
    label: Quick access
    presentation: {display: cards}
    submenu:
      - type: RouteLink
        label: Check-in
        route: check-in
        description: Sign the registration card and scan the ID
        presentation: {icon: "vaadin:clipboard"}
      - type: RouteLink
        label: Floor plan
        route: floor-plan
        description: Rooms coloured by housekeeping status
        presentation: {image: /img/floor.png}
      - type: Menu
        label: Billing
        description: Folios, charges and payments
        presentation: {icon: "vaadin:invoice"}
        submenu:          # not a destination: these are the card's actions
          - {type: RouteLink, label: Folio, route: billing}
          - {type: RouteLink, label: New booking, route: bookings/new}
```

**Java**:

```java
@Menu(display = MenuDisplay.cards)
QuickAccess quickAccess;

public class QuickAccess {
    @Menu(description = "Sign the registration card and scan the ID")
    @Icon(IconKey.Clipboard)
    RegistrationCard checkIn;

    @Menu(description = "Rooms coloured by housekeeping status", image = "/img/floor.png")
    FloorPlan floorPlan;

    @Menu(description = "Folios, charges and payments")
    @Icon(IconKey.Invoice)
    BillingActions billing;   // its own @Menu entries become the card's actions
}
```

In code-built shells (`MenuSupplier`, `AppSupplier`, fluent `AppShell`):
`menu.withPresentation(MenuPresentation.cards())` on the group, and
`withPresentation(MenuPresentation.card(icon, image))` / `withDescription(...)` on its entries.
**.NET**: `[MenuGroup("Quick access", Display = MenuDisplay.Cards)]` +
`[MenuItem(..., Description = ..., Icon = ..., Image = ...)]`. **Python**:
`@menu_group("Quick access", display=MenuDisplay.cards)` +
`@menu_item(..., description=..., icon=..., image=...)`.

**Where it shows.** In the top navigation bars — `MENU_ON_TOP` and the section band of
`HAMBURGER_SECTIONS` — on Vaadin and Redwood. React Native draws the cards inside its drawer
(image, title, description and action chips); IntelliJ shows two-line rows with the icon and
inline action links. The sidebar, drawer and rail variants on the web, and the narrow-viewport ☰
button, keep the plain list. A group without `display: cards` renders exactly as before.

Full reference: [Navigation and menus › Card menus](/java-user-manual/build/navigation-and-menus/#card-menus-a-group-that-opens-as-cards).

---

## Choosing a pattern

| Situation | Recommended pattern |
|---|---|
| Flat app, 3–8 sections | Tabs |
| Standard 2-level backoffice | Top navigation bar |
| Frequent cross-section jumps, data-dense | Sidebar |
| Mobile-first or navigation is secondary | Hamburger/Drawer |
| Compact, icon-familiar users | Rail |
| Deep menu (> 2 levels) | Tiles hub (auto-inferred) |
| Power users, keyboard-heavy | Command palette (always available) |
| A group whose entries need a description to be chosen | Card menu (`display: cards` on the group) |

## Combining patterns

All variants include the command palette automatically — there is nothing to configure. For the main navigation, patterns are mutually exclusive (one `AppVariant` per app), but they compose naturally with other UX patterns:

- **Tiles hub + Command palette** — deep apps where some users prefer keyboard, others prefer scanning cards
- **Sidebar + Command palette** — complex apps where the sidebar gives orientation and the palette gives speed
- **Rail + Command palette** — compact apps for expert users who want maximum content space
