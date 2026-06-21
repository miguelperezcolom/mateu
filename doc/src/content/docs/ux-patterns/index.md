---
title: UX Patterns
description: Design patterns for productive business applications in Mateu.
---

Backoffice applications are work tools. Their quality is measured not by visual flair but by productivity, safety, and the reduction of cognitive effort. Users spend hours inside these systems — every unnecessary click, every lost filter, every context switch carries a real operational cost.

Mateu's thesis is that good business UX is regular enough to be codified once, on the backend, and applied consistently without writing frontend code. This section documents the patterns Mateu supports and how to express each one.

## Principles

Seven principles drive every pattern in this catalogue. Each exists to eliminate a concrete cost.

| # | Principle | What it prevents |
|---|-----------|-----------------|
| 01 | **Preserve context** | Users should never lose their orientation or mental state. Leaving a screen to come back is the most expensive form of context loss. |
| 02 | **Minimize navigation** | Fewer screens and fewer jumps equal more productivity. Composing beats navigating. |
| 03 | **Keyboard-first** | Power users live on the keyboard. If a frequent task requires a mouse, it is badly designed. |
| 04 | **Workflow over screens** | The unit of design is the task, not the screen. Design to complete work, not to display an entity. |
| 05 | **Progressive complexity** | Show complexity only when it adds value. Advanced features are revealed, not imposed. |
| 06 | **Recoverability** | Every error must be correctable. Confirm destructive actions, undo reversible ones, never lose work in progress. |
| 07 | **Consistency** | Patterns repeat predictably. What a user learns on one screen works on all. |

## Pattern catalogue

| Pattern | Status | Key primitive |
|---------|--------|---------------|
| [Navigation & Menus](./navigation) | ✅ Implemented | `@App(AppVariant.*)`, `⌘K` command palette |
| [Split View](./split-view) | ✅ Implemented | `@SplitCrud` |
| [Filters & Listing](./filters-and-listing) | ✅ Implemented | `@List`, `@Filterable`, `@RowAction` |
| [Wizard](./wizard) | ✅ Implemented | `@WizardCompletionAction` |
| [Entity Picker](./entity-picker) | ✅ Implemented | `@Lookup`, `@Composition` |
| [Workspace](./workspace) | Composition | `@SplitLayout`, `@Tabs`, `@Accordion` |
| [Task-centric page](./task-centric) | Composition | `@Action`, `@MainAction` |
| [Long-running jobs](./long-running-jobs) | ✅ Implemented | `@Action(background, sse)`, `@Trigger` |
| [Autosave](./autosave) | ✅ Implemented | `@AutoSave` |
| [Keyboard Shortcuts](./keyboard-shortcuts) | ✅ Implemented | `@Action(shortcut = ...)`, `@Trigger(OnEnter)` |
| [Push Notifications](./notifications) | ✅ Implemented | `@Trigger(OnLoad + OnSuccess)`, `Hydratable`, `MicroFrontend` |
| [Partial Forms](./partial-forms) | ✅ Implemented | `@FoldedLayout`, `@Section`, nested subform records |
| [High-density screens](./high-density) | ✅ Implemented | `@Compact`, `StyleConstants.COMPACT` |

## Anti-patterns

Each anti-pattern has a name so it can be recognised quickly — and a pattern that prevents it.

| Anti-pattern | Description | Solved by |
|---|---|---|
| **CRUD Tunnel** | List → detail → back, breaking the flow on every row visit. | [Split View](./split-view) |
| **Modal Hell** | Nested modals that destroy orientation. | [Split View](./split-view), [Task-centric page](./task-centric) |
| **Spinner Prison** | Freezing the entire screen while something loads. | [Long-running jobs](./long-running-jobs) |
| **Filter Amnesia** | Losing filters when navigating away. | Filter state synced to URL — browser bookmarks become saved views |
| **Desktop Denial** | Ignoring the keyboard and penalising the expert user. | [Keyboard Shortcuts](./keyboard-shortcuts) — `@Action(shortcut = ...)` |
