---
title: Progress steps
description: Show where a multi-step process stands — a checkout, an onboarding, an approval.
---

**Status:** ✅ Implemented

## Intent

Show a user *where they are* in a linear, multi-step process — a checkout, an onboarding, an approval chain — as a row of numbered steps, so what's done, what's active and what's ahead reads at a glance.

Unlike a `Wizard` (which *drives* a multi-step form), `ProgressSteps` only **visualizes** progress. Use it to annotate any screen with a status bar; drive the actual navigation however you like.

## Solution

Use the `ProgressSteps` component: one `Step` per stage, each with a title, optional description and a `status` of `"done"`, `"current"` or `"upcoming"` (the default). Done steps show a check mark and a filled dot; the current step is ringed; upcoming steps are muted.

```java
@Section("Progress")
Component progress = ProgressSteps.builder()
        .steps(List.of(
                Step.builder().title("Cart").description("3 items").status("done").build(),
                Step.builder().title("Address").description("Madrid").status("done").build(),
                Step.builder().title("Payment").description("Enter your card").status("current").build(),
                Step.builder().title("Review").status("upcoming").build(),
                Step.builder().title("Done").status("upcoming").build()))
        .build();
```

![Checkout progress](/images/docs/progress-steps/checkout.png)

The renderer is dependency-free, themes through the standard CSS variables, and works in dark mode. The connector line before each done/current step is highlighted so the "filled" portion of the bar tracks progress. On mobile (React Native) the same steps render as a compact vertical stepper.

## When to use it

Use `ProgressSteps` to **orient** the user inside a process you render across several screens or sections. For a self-driving multi-step form, use a `Wizard` instead. Demo: `/steps-demo`.
