---
title: Timeline / activity feed
description: Show a chronological sequence of events — an audit trail, an order history, a changelog.
---

**Status:** ✅ Implemented

## Intent

Show *what happened, in order* — an order's journey, an audit trail, a case history, a release changelog — as a vertical feed so the sequence and timing read top-to-bottom.

## Solution

Use the `Timeline` component: one `TimelineItem` per event, each a dot on a vertical rail with a title, an optional description, a free-form `timestamp` label and an emoji `icon`. `color` tints the dot; an `actionId` makes the entry clickable (dispatches the standard `action-requested` event).

```java
@Section("History")
Component feed = Timeline.builder()
        .items(List.of(
                TimelineItem.builder().title("Order placed")
                        .timestamp("Mar 3 · 09:02").icon("🛒").color("#3b82f6").build(),
                TimelineItem.builder().title("Shipped")
                        .description("Tracking #RH-88213 — click for details")
                        .timestamp("Mar 4 · 08:15").icon("🚚").color("#f59e0b")
                        .actionId("openTracking").build(),
                TimelineItem.builder().title("Delivered")
                        .timestamp("Mar 5 · 13:22").icon("✅").color("#10b981").build()))
        .build();
```

![Order activity](/images/docs/timeline/activity-feed.png)

The renderer is dependency-free, themes through the standard CSS variables, and works in dark mode. The rail line connects consecutive dots and stops at the last entry.

## When to use it

Use a Timeline to **narrate** a sequence of past events. The `timestamp` is a free-form label (`"2h ago"`, `"Mar 3 14:20"`) so you format it however you like. For editable/interactive histories, make entries `actionId`-clickable and open a detail view. Demo: `/timeline-demo`.
