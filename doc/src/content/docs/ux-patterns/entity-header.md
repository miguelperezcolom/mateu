---
title: Entity header
description: A persistent context banner — identity, key facts and one highlighted metric of the entity a flow operates on.
---

**Status:** ✅ Implemented

## Intent

Keep the *who/what* of a flow always in sight — the guest of a check-in, the customer of a case, the order of a fulfilment screen — as a compact banner with the identity, a few key facts and one highlighted metric, so the operator never loses context while working through the steps below.

## Solution

Use the `EntityHeader` component: a `title` with `badges` (badge-palette `Chip`s), a `subtitle` line, a list of `Fact`s (label-over-value pairs) and an optional right-side metric (`metricLabel` / `metricValue` / `metricCaption`) rendered big in the accent color.

```java
@Section("Guest")
Component guest = EntityHeader.builder()
        .title("María Fernández")
        .badges(List.of(Chip.builder().label("PLATINUM").color("contrast").build()))
        .subtitle("Ocean Suite · 30 Apr → 07 May · 7N · 2pax · All Inclusive")
        .facts(List.of(
                Fact.builder().label("TOTAL RESERVA").value("€ 4.890,00").build(),
                Fact.builder().label("AGENCIA").value("TUI Group · TUI Magic Life").build()))
        .metricLabel("FIDELIDAD").metricValue("48.500").metricCaption("23 estancias")
        .build();
```

![Entity header](/images/docs/entity-header/entity-header.png)

The banner itself is display-only. The renderer is dependency-free, themes through the standard CSS variables and works in dark mode.

### A fact with an action

A single fact can carry an action — e.g. a pencil right after the company a stay is billed to, which opens a drawer to choose or change it. Give the `Fact` an `actionId` (and, optionally, `parameters`, an `icon` and an `actionLabel`):

```java
Fact.builder()
        .label("EMPRESA")
        .value("Acme Corporation Ltd")
        .actionId("changeCompany")           // the action the button dispatches
        .actionLabel("Cambiar empresa")       // accessible name and tooltip (default: the fact's label)
        .parameters(Map.of("stayId", stayId)) // sent with the action, like a Button's
        .build()                              // icon: a pencil unless you set .icon("vaadin:...")
```

The renderers draw a compact icon-only button immediately after the value, on the same line. Clicking it dispatches `actionId` with `parameters` exactly like a `Button` with that `actionId` does, so it reaches the action method (or the `handleAction(actionId, …)`) of the view that owns the header — a public method with that name is advertised automatically, as with any [action referenced by a component](/java-ui-definition/annotations/actions/#actions-referenced-by-components). When the page hoists its leading `EntityHeader` into the page header (Vaadin, and Redwood's `oj-sp` header), the button travels with the fact. A fact without `actionId` is unchanged: just its label and value, on the wire too.

The ports spell it the same way: C# `new Fact { Label = "EMPRESA", Value = "…", ActionId = "changeCompany", ActionLabel = "Cambiar empresa", Parameters = … }`, Python `Fact(label="EMPRESA", value="…", action_id="changeCompany", action_label="Cambiar empresa", parameters={…})`.

## When to use it

Use an `EntityHeader` at the **top of a task screen or wizard** so the entity being worked on stays pinned while the user moves through steps — e.g. the guest card above a check-in wizard. For a full record page with tabs, use the [Item Overview](/ux-patterns/item-overview/) archetype instead; for a standalone KPI use [Stat](/ux-patterns/stat/). See it composed into a whole screen in [Front-office screens](/ux-patterns/front-office/). Demo: `/entity-header-demo`.
