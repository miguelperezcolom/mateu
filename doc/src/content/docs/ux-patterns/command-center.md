---
title: Command Center (Ask Oracle)
description: An always-present FAB that opens a full-screen palette to reach any screen, search all your data and open recent work from anywhere — and, optionally, replace the app bar entirely.
---

**Status:** ✅ Implemented

## Intent

Traditional menus run out of room: as an app grows, the navigation bar can only surface a
fraction of what the user can actually do. The **command center** — Mateu's take on Oracle
Redwood's *Ask Oracle* pattern — solves this with a single **floating action button (FAB)** that is
always present in the bottom-right corner. Pressing it (or `⌘K` / `Ctrl+K`) opens a **full-screen
palette** that unifies, from anywhere in the app:

- **Go to any screen** — the whole menu, flattened and searchable (including nested submenus).
- **Search all your data** — entity results across the app, when the app class implements
  [`GlobalSearchSupplier`](/ux-patterns/global-search/).
- **Recent screens** — the last places the user visited (kept client-side).
- **Ask the AI assistant** — when the app has an AI assistant configured, a one-tap hand-off.

Because everything reachable lives behind one discoverable, touch-friendly control, you can
optionally **drop the app bar entirely** for a cleaner, more focused UI.

## Enabling it

Opt in on the `@App` class. Nothing else changes — the FAB is simply added on top of your existing
shell:

```java
@UI("")
@App(commandCenter = true)
public class MyApp implements GlobalSearchSupplier { // GlobalSearchSupplier is optional
    @Menu MyDashboard dashboard;
    @Menu Customers customers;
    // ...
}
```

- The **FAB** appears bottom-right. If the app also has FABs (`@Fab`) or the AI assistant, they
  stack above it.
- **Global data search** lights up automatically when the app class implements `GlobalSearchSupplier`
  (same contract as the ⌘K palette). Without it, the palette still offers navigation and recents.
- **Recent screens** are remembered per app in the browser (`localStorage`), most-recent-first.

## Chromeless: replacing the app bar

To go further and remove the navigation chrome — no header, no menu/tabs, content filling the
viewport — use `chromeless`. The command center becomes the **only** way to move around, so
`chromeless` implies `commandCenter`:

```java
@UI("")
@App(chromeless = true)      // no app bar; navigate purely through the command center
public class FocusedApp { /* ... */ }
```

Use this for immersive, single-surface apps (a console, a kiosk, a focused editor) where a
persistent menu would only add noise.

## How it behaves

- **Open:** click the FAB, or press `⌘K` / `Ctrl+K` anywhere.
- **Empty state:** navigation tiles for every menu screen on the left, a **Recientes** list on the
  right.
- **As you type:** matching screens first, then entity search results grouped by category (each with
  a short description), with a loading shimmer while the server responds. An **Ask AI** row appears at
  the top when an assistant is configured.
- **Keyboard:** `↑`/`↓` move the selection, `Enter` opens it, `Esc` closes the palette.
- **Close:** `Esc`, the ✕ button (bottom-right), or clicking the backdrop.

## Renderers

The command center is a single shared, design-system-neutral web component
(`mateu-command-center`), so it renders on every shell — Vaadin, Oracle Redwood, SAP UI5,
PatternFly and SLDS. On the Vaadin shell, `chromeless` also removes the header/menu; on the other
shells the FAB is added over the shell's own chrome.

## Demo

The reference admin panel (`demo-admin-panel`, `Home2`) enables `@App(commandCenter = true)` and
implements `GlobalSearchSupplier`, so the FAB is available on every screen and its palette searches
demo entities.

## Related

- [Global search](/ux-patterns/global-search/) — the `GlobalSearchSupplier` contract the palette uses
  for entity results.
- [Navigation & menus](/ux-patterns/navigation/) — the menu the palette flattens.
