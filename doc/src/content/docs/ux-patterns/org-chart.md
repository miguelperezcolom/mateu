---
title: Org chart
description: Show a hierarchy top-down — an org chart, a category tree, a reporting line.
---

**Status:** ✅ Implemented

## Intent

Show a hierarchy — who reports to whom, a category tree, a decision tree — as a classic top-down chart, so the structure and depth read at a glance.

## Solution

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

Use the `OrgChart` component: a single `root` `OrgNode` whose `children` fan out below it, connected by lines. Each node has a title, optional subtitle, an `avatar` (emoji or image URL) and accent `color`. A node with an `actionId` is clickable.

```java
@Section("Leadership")
Component org = OrgChart.builder()
        .root(OrgNode.builder().title("Ada Lovelace").subtitle("CEO").avatar("👑").color("#1a73e8")
                .actionId("openPerson")
                .children(List.of(
                        OrgNode.builder().title("Alan Turing").subtitle("CTO").avatar("💻")
                                .children(List.of(
                                        OrgNode.builder().title("Grace Hopper").subtitle("VP Eng").build()))
                                .build(),
                        OrgNode.builder().title("Katherine J.").subtitle("CFO").avatar("📊").build()))
                .build())
        .build();
```

![Company org chart](/images/docs/org-chart/company-org.png)

The renderer is dependency-free (CSS-connector tree), themes through the standard CSS variables, works in dark mode and scrolls horizontally when wide. On mobile (React Native) and in the IntelliJ plugin the same tree renders **indented** — the natural narrow-viewport adaptation.

### In focus — one level at a time

A large organisation does not read as one tree. Set `display(OrgChartDisplay.focus)` and the chart
shows **one node in focus**, its chain of managers above it and its reports below it; picking a
manager or a report moves the focus there (in the browser — the whole tree is already on the wire),
and the name of a node with an `actionId` still runs its action. `focus` is the id of the node it
opens on (the root when null or unknown) — a person's page opens their own org chart on them:

```java
@Section("Organigrama")
Component org = OrgChart.builder()
        .root(company)                    // the whole tree, as above
        .display(OrgChartDisplay.focus)
        .focus("p:" + userId)             // the OrgNode id to open on
        .build();
```

In YAML: `display: focus` and `focus: <node id>` on the `OrgChart`.

How each renderer draws it:

| Renderer | `tree` | `focus` |
| :-- | :-- | :-- |
| Vaadin / web | the CSS-connector tree | focus card, collapsible chain above, reports grid below |
| Redwood | — (Spectra has no tree: drawn in focus) | Spectra's hierarchy viewer (`oj-sp-hierarchy-viewer` + `oj-sp-hierarchy-card`), its animations included |
| React Native, IntelliJ | indented tree | focus card with its chain and its reports |

`display` and `focus` are `@Experimental` (3.0-beta.38).

## When to use it

Use an `OrgChart` for **top-down hierarchies** you want to see whole — and `display: focus` for people directories and reporting lines that are too big to see whole. For a large, navigable tree (file explorer, deep taxonomy) use a `GridLayout.tree` listing or a tree select instead. Demo: `/orgchart-demo`.
