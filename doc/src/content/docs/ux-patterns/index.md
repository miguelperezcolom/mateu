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
| [Tree CRUD](./tree-crud) | ✅ Implemented | `gridLayout() = GridLayout.tree`, `@SplitCrud` |
| [Filters & Listing](./filters-and-listing) | ✅ Implemented | `@List`, `@Filterable`, `@RowAction` |
| [Bulk actions](./bulk-actions) | ✅ Implemented | `@ListToolbarButton` + typed `List<Row>` selection |
| [Saved views](./saved-views) | ✅ Implemented | Smart search bar bookmark — named condition sets, default view |
| [Totals & row grouping](./aggregates) | ✅ Implemented | `@Aggregate(sum/avg/…)` footer + `@GroupBy` subtotal rows |
| [Column chooser](./column-chooser) | ✅ Implemented | Show/hide/reorder columns per user, per listing |
| [Concurrent edit conflicts](./optimistic-locking) | ✅ Implemented | `@Version` — conflict dialog: reload / overwrite |
| [Notification inbox](./notification-inbox) | ✅ Implemented | `NotificationsSupplier` — header bell, unread count, mark-as-read |
| [Undo](./undo) | ✅ Implemented | `Message.undoable(...)` — toast with an Undo button |
| [Session expiry](./session-expiry) | ✅ Implemented | `onSessionExpired` — re-auth + retry, work intact |
| [Audit version diff](./audit-diff) | ✅ Implemented | History grouped by save moment — old → new per field |
| [Global entity search](./global-search) | ✅ Implemented | `GlobalSearchSupplier` — ⌘K searches data, grouped by category |
| [Planning board](./planning-board) | ✅ Implemented | `PlanningBoard` — resources × days tape chart, drag to move |
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
| [Audience projection](./audience-projection) | ✅ Implemented | `@Audience` + `@AppContext` field named `audience` |
| [Front-office screens](./front-office) | Composition | `TaskQueue` + `EntityHeader` + `Wizard` + `Ledger` + … |
| [Entity header](./entity-header) | ✅ Implemented | `EntityHeader` (title, badges, facts, metric) |
| [Meter](./meter) | ✅ Implemented | `Meter` (value/max, warn/danger thresholds) |
| [Task progress](./task-progress) | ✅ Implemented | `TaskProgress` (done/total pills + CTA) |
| [Status list](./status-list) | ✅ Implemented | `StatusList` + `StatusItem` (status chip or action) |
| [Task queue](./task-queue) | ✅ Implemented | `TaskQueue` + `QueueGroup`/`QueueItem` |
| [Resource grid](./resource-grid) | ✅ Implemented | `ResourceGrid` + `ResourceItem` (availability picker) |
| [Offer card](./offer-card) | ✅ Implemented | `OfferCard` (features, price delta, CTA) |
| [Add-on picker](./addon-picker) | ✅ Implemented | `AddOnPicker` + `AddOn` (running total) |
| [Ledger](./ledger) | ✅ Implemented | `Ledger` + `LedgerLine` (folio breakdown) |
| [Payment picker](./payment-picker) | ✅ Implemented | `PaymentPicker` + `PaymentMethod` |
| [Process monitor](./process-monitor) | ✅ Implemented | `ProcessMonitor` + `ProcessItem` (health + fix) |
| [Notice](./notice) | ✅ Implemented | `Notice` / `@Notice` (inline banner, status, action) |
| [Kanban](./kanban) | ✅ Implemented | `Kanban` + `KanbanColumn`/`KanbanCard` |
| [Timeline](./timeline) | ✅ Implemented | `Timeline` + `TimelineItem` (activity feed) |
| [Progress steps](./progress-steps) | ✅ Implemented | `ProgressSteps` (also `@WizardProgress(STEPS)`) |
| [Stat / KPI tile](./stat) | ✅ Implemented | `Stat` (value, trend, sparkline) |
| [Calendar](./calendar) | ✅ Implemented | `Calendar` month view + `CalendarEvent` |
| [Pricing table](./pricing-table) | ✅ Implemented | `PricingTable` + `PricingPlan` |
| [Org chart](./org-chart) | ✅ Implemented | `OrgChart` + `OrgNode` |
| [Heatmap](./heatmap) | ✅ Implemented | `Heatmap` (calendar heatmap) |
| [Funnel](./funnel) | ✅ Implemented | `Funnel` + `FunnelStage` |
| [Trend chart](./trend-chart) | ✅ Implemented | `TrendChart` (line/area, dependency-free) |
| [Feature grid](./feature-grid) | ✅ Implemented | `FeatureGrid` + `Feature` tiles |
| [Testimonials](./testimonials) | ✅ Implemented | `Testimonials` + `Testimonial` |
| [FAQ](./faq) | ✅ Implemented | `Faq` + `FaqItem` (collapsible) |
| [Callout card](./callout-card) | ✅ Implemented | `CalloutCard` (title, body, CTA) |
| [Comment thread](./comment-thread) | ✅ Implemented | `CommentThread` + `Comment` |
| [File list](./file-list) | ✅ Implemented | `FileList` + `FileItem` (attachments) |
| [Comparison card](./comparison-card) | ✅ Implemented | `ComparisonCard` (side-by-side options) |
| [Checklist](./checklist) | ✅ Implemented | `Checklist` + `ChecklistItem` (progress) |

## Anti-patterns

Each anti-pattern has a name so it can be recognised quickly — and a pattern that prevents it.

| Anti-pattern | Description | Solved by |
|---|---|---|
| **CRUD Tunnel** | List → detail → back, breaking the flow on every row visit. | [Split View](./split-view) |
| **Modal Hell** | Nested modals that destroy orientation. | [Split View](./split-view), [Task-centric page](./task-centric) |
| **Spinner Prison** | Freezing the entire screen while something loads. | [Long-running jobs](./long-running-jobs) |
| **Filter Amnesia** | Losing filters when navigating away. | Filter state synced to URL — browser bookmarks become saved views |
| **Desktop Denial** | Ignoring the keyboard and penalising the expert user. | [Keyboard Shortcuts](./keyboard-shortcuts) — `@Action(shortcut = ...)` |
