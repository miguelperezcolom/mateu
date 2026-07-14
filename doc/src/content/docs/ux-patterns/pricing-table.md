---
title: Pricing table
description: Compare plans side by side — a pricing page, a plan chooser, a feature matrix.
---

**Status:** ✅ Implemented

## Intent

Let a user compare options side by side and pick one — a SaaS pricing page, an in-app plan chooser, an upgrade prompt — so the differences and the recommended choice read at a glance.

## Solution

Use the `PricingTable` component: one `PricingPlan` per column, each with a name, a price and period, a list of feature lines and a call-to-action (`ctaLabel` + `actionId`). Mark one plan `featured` to lift and ring it as the recommended option; its CTA runs the `@Action` named by its `actionId`.

```java
@Section("Choose a plan")
Component pricing = PricingTable.builder()
        .plans(List.of(
                PricingPlan.builder().name("Starter").price("0€").period("/mo")
                        .features(List.of("1 project", "Community support"))
                        .ctaLabel("Start free").actionId("choosePlan").build(),
                PricingPlan.builder().name("Pro").price("29€").period("/mo").featured(true)
                        .features(List.of("Unlimited projects", "Priority support"))
                        .ctaLabel("Go Pro").actionId("choosePlan").build(),
                PricingPlan.builder().name("Enterprise").price("Custom")
                        .features(List.of("SSO & SAML", "99.9% SLA"))
                        .ctaLabel("Contact sales").actionId("contactSales").build()))
        .build();
```

The `actionId` method receives the click; read which plan was chosen from the button context, or give each plan a distinct `actionId`.

![Pricing plans](/images/docs/pricing-table/plans.png)

The renderer is dependency-free, themes through the standard CSS variables, and works in dark mode. Cards wrap onto multiple rows on narrow viewports; features render as a check list; the featured plan is highlighted with a "Recommended" badge and an accent CTA.

## When to use it

Use a `PricingTable` for **side-by-side plan comparison with a choice to make**. For a plain feature grid without CTAs, a `Grid`/table is lighter. Demo: `/pricing-demo`.
