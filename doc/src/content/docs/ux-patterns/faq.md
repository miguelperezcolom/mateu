---
title: FAQ
description: A collapsible list of questions and answers — a help section, a support page.
---

**Status:** ✅ Implemented

## Intent

Answer common questions compactly — a help section, a pricing-page FAQ, a support article — as a list of collapsible question/answer rows, so the page stays scannable and the reader expands only what they need.

## Solution

Use the `Faq` component: a list of `FaqItem`s (question, answer, and an `open` flag that starts a row expanded). Expanding and collapsing is client-side — no server round-trip.

```java
@Section("Frequently asked questions")
Component faq = Faq.builder()
        .items(List.of(
                FaqItem.builder().question("Do I need to write any JavaScript?")
                        .answer("No. You annotate Java classes and Mateu generates the full UI.")
                        .open(true).build(),
                FaqItem.builder().question("Which frameworks are supported?")
                        .answer("Spring MVC, WebFlux, Micronaut, Quarkus and Helidon.").build()))
        .build();
```

![Help FAQ](/images/docs/faq/help.png)

The renderer is dependency-free, themes through the standard CSS variables and works in dark mode; the chevron rotates as a row opens.

## When to use it

Use `Faq` for **question/answer help content**. For arbitrary collapsible sections use `AccordionLayout`; for a timeline of events use `Timeline`. Demo: `/faq-demo`.
