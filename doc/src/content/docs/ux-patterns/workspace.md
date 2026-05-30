---
title: Workspace
description: A multi-panel environment where several related views coexist simultaneously.
---

**Status:** Composition — no new primitive needed

## Intent

A multi-panel environment where several related views coexist at once.

## Difference from Split View

[Split View](./split-view) is two panels — master list and detail — for the same collection. A Workspace is the composition of several heterogeneous views on one screen: a queue, a detail, KPIs, a context panel.

## Problem

Complex tasks require looking at several things simultaneously: an inbox plus a message detail, a queue plus a customer record, KPIs plus the underlying data. Resolving them by jumping between screens multiplies cognitive load.

## Solution

Compose existing layout primitives. No new annotation is required.

```java
@UI("/support")
public class SupportWorkspace {

    @Section("Open tickets")
    private TicketQueue queue;       // list component

    @Section("Ticket detail")
    private TicketDetail detail;     // form component

    @Section("Customer context")
    private CustomerSummary context; // read-only summary
}
```

Use `@SplitLayout` for two-pane splits, `@HorizontalLayout` / `@VerticalLayout` for arrangement, `@Tabs` or `@Accordion` to hide secondary panels until needed, and `@KPI` in a header row for live metrics.

## Structure

```
┌─────────────┬──────────────────────┬──────────────┐
│ KPIs: 12 open · 3 urgent · SLA 94%               │
├─────────────┼──────────────────────┼──────────────┤
│ Inbox       │ Ticket #4521         │ Customer     │
│ ─────────── │ ──────────────────── │ ──────────── │
│ #4521 ●     │ Subject: ...         │ Acme Corp    │
│ #4498       │ Priority: High       │ Plan: Pro    │
│ #4477       │                      │ 3 open tix   │
│             │ [Resolve] [Escalate] │              │
└─────────────┴──────────────────────┴──────────────┘
```

## Principles served

- **Preserve context** — all relevant information is visible simultaneously
- **Minimize navigation** — zero page transitions for related data
- **Workflow over screens** — the screen is designed around the support task, not an entity
