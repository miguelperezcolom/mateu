---
title: Navigation & Menus
description: Navigation patterns for business applications — from flat tabs to deep multi-level structures.
---

Navigation is the skeleton of a backoffice application. A poorly chosen navigation pattern forces users to memorise structure instead of doing work. Mateu selects a navigation style automatically based on menu structure, and lets you override it when the inference is wrong.

## How Mateu selects the navigation style

By default, Mateu applies this inference chain:

```
Menu has no submenus           →  Tabs
Menu has submenus (≤ 2 levels) →  Top navigation bar
Menu has submenus (> 2 levels) →  Top navigation bar + Tiles hub for deep sections  (proposed)
```

You can override the inference at any point with `@App`:

```java
@App(AppVariant.MENU_ON_LEFT)
public class MyAdminApp { ... }
```

---

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

**Status:** ✅ Implemented — `AppVariant.HAMBURGUER_MENU`

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

**Status:** 🔲 Proposed — `AppVariant.RAIL`

A slim vertical strip with icons and short labels. Narrower than the full sidebar; wider than pure icons. Common in Material Design-style applications and modern productivity tools.

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

**When to use:** Apps targeting users who know the sections well and want compact navigation; hybrid desktop/tablet layouts.

**Proposed primitive:** `@App(AppVariant.RAIL)`

---

### Tiles hub

**Status:** 🔲 Proposed — `AppVariant.TILES`

A landing page that presents navigation options as a grid of cards, each with an icon, title, and optional description. Used as a top-level entry point or as an intermediate page for a section that would otherwise require 3+ navigation levels.

```
┌──────────────────────────────────────────────┐
│  Operations                                  │
│                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  📦      │  │  🚚      │  │  ↩       │   │
│  │ Orders   │  │Shipments │  │ Returns  │   │
│  │          │  │          │  │          │   │
│  │ Manage   │  │ Track &  │  │ Process  │   │
│  │ purchase │  │ dispatch │  │ refunds  │   │
│  └──────────┘  └──────────┘  └──────────┘   │
└──────────────────────────────────────────────┘
```

**When to use:** Home/dashboard pages; any section with 3+ levels of depth where a dropdown or nested sidebar would be unwieldy.

**Proposed primitive:** `@App(AppVariant.TILES)` and `@Menu(description = "...")` on items to populate tile descriptions.

---

### Deep-menu rule (> 2 levels)

**Status:** 🔲 Proposed

When a menu exceeds two levels of depth, neither a top-bar dropdown nor a sidebar renders well. The proposed rule:

1. The top two levels are rendered in the main navigation (top-bar or sidebar).
2. Any section at level 2 that itself has children navigates to a **Tiles hub page** instead of expanding inline.
3. The tiles hub renders the level-3 items as cards with their descriptions.

```
Top nav:   Home  |  Catalogue ▾  |  Operations ▾  |  …

Click "Operations" →  navigates to /operations

/operations  (Tiles hub page):
  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │  Orders  │  │Shipments │  │ Returns  │
  │          │  │          │  │          │
  └──────────┘  └──────────┘  └──────────┘
```

This avoids three-level dropdowns and gives each deep section a proper entry point that can include descriptions and icons.

**Proposed inference rule addition:**
```
depth > 2  →  MENU_ON_TOP (or MENU_ON_LEFT) + TILES hub at level 2→3 boundary
```

**Populate tile descriptions via `@Menu(description = ...)`:**
```java
@Menu(description = "Create, search and manage purchase orders.")
private OrdersSection orders;

@Menu(description = "Track dispatched shipments and update delivery status.")
private ShipmentsSection shipments;
```

---

### Command palette

**Status:** 🔲 Proposed

A keyboard-triggered overlay (typically `⌘K` / `Ctrl+K`) that lets users search and jump to any section or action by typing. The fastest possible navigation for expert users who know what they want but not where it lives.

```
┌─────────────────────────────────────┐
│ 🔍  Go to…                          │
│ ─────────────────────────────────── │
│ 📦  Orders                          │
│ 👤  Customers                       │
│ ⚙   Settings → Notifications        │
│ ✚   New order                       │
└─────────────────────────────────────┘
```

**When to use:** Any application. Always beneficial as a secondary navigation layer; essential for power users.

**Proposed primitive:** `@App(commandPalette = true)` — opt-in per app. Items are sourced from the same menu tree used for the main navigation.

---

## Choosing a pattern

| Situation | Recommended pattern |
|---|---|
| Flat app, 3–8 sections | Tabs |
| Standard 2-level backoffice | Top navigation bar |
| Frequent cross-section jumps, data-dense | Sidebar |
| Mobile-first or navigation is secondary | Hamburger/Drawer |
| Compact, icon-familiar users | Rail |
| Deep menu (> 2 levels) | Top/Sidebar + Tiles hub at boundary |
| Power users, keyboard-heavy | Add command palette to any of the above |

## Combining patterns

Patterns are not mutually exclusive. The most productive configurations layer them:

- **Top nav + Tiles hub** for deep content hierarchies
- **Sidebar + Command palette** for complex apps with many sections
- **Top nav + Command palette** for the typical backoffice with keyboard-first users

