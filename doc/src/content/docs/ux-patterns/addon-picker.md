---
title: Add-on picker
description: Priced extras as toggleable cards with a live running total.
---

**Status:** ✅ Implemented

## Intent

Sell small extras — parking, late check-out, an all-inclusive package — as a grid of toggleable cards where the operator (or the customer) sees the running total update live, instead of hunting prices through a form.

## Solution

Use the `AddOnPicker` component: a `totalLabel` and `currency` for the header-right running total, an optional `actionId`, and a list of `AddOn` cards. Each card has an `icon` chip, a `title`, a muted `description`, and either a price line (`price`, optionally `/ unit`) with a `+`/`✓` toggle, or an `includedLabel` (e.g. a loyalty perk) shown instead of a price and with no toggle. `added(true)` pre-selects a card.

```java
@Section("Extras")
Component extras = AddOnPicker.builder()
        .totalLabel("Añadidos").currency("€").actionId("extrasChanged")
        .items(List.of(
                AddOn.builder().id("allinc").icon("🍹").title("Paquete All Inclusive")
                        .description("Todo incluido · 7 noches · 2 pax")
                        .price(343.0).unit("estancia").build(),
                AddOn.builder().id("parking").icon("🅿").title("Parking")
                        .description("Cubierto · Vigilancia 24h")
                        .includedLabel("Incluido Platinum").build(),
                AddOn.builder().id("late").icon("🕕").title("Late check-out")
                        .description("Hasta las 18:00h")
                        .price(40.0).added(true).build()))
        .build();
```

![Add-on picker](/images/docs/addon-picker/addon-picker.png)

Toggling happens client-side (the total recomputes live as the sum of added prices, formatted like the money stereotype). On every toggle, when `actionId` is present, the component dispatches the standard `action-requested` event with parameters `{ "_item": id, "_added": bool, "_total": number }`, so the server can persist each change incrementally.

## When to use it

Use an `AddOnPicker` for **multiple optional priced items** attached to a booking/order, where the running total is the feedback that drives the sale. For one big contextual upsell use an [Offer card](./offer-card); to compare plans use a [Pricing table](./pricing-table); the resulting charges land in a [Ledger](./ledger) at check-out. See it composed into a whole screen in [Front-office screens](./front-office). Demo: `/addon-picker-demo`.
