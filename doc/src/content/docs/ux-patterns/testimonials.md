---
title: Testimonials
description: A grid of customer quote cards with author and star rating.
---

**Status:** ✅ Implemented

## Intent

Show social proof — customer quotes, reviews, endorsements — as a grid of quote cards, each with an author (avatar, name, role) and an optional star rating.

## Solution

Use the `Testimonials` component: a list of `Testimonial`s (quote, author, role, avatar, rating 0–5). The renderer lays them out in an auto-fitting grid; the rating renders as filled/empty stars.

```java
@Section("Testimonials")
Component testimonials = Testimonials.builder()
        .items(List.of(
                Testimonial.builder()
                        .quote("We shipped our internal tool in a weekend. Zero frontend code.")
                        .author("Ada Lovelace").role("CTO, Analytical Engines")
                        .avatar("👩‍💼").rating(5).build(),
                Testimonial.builder()
                        .quote("Solid, pragmatic, and the AI chat is a genuine time-saver.")
                        .author("Grace Hopper").role("VP Engineering").avatar("👩‍🔬").rating(4).build()))
        .build();
```

![Customer voices](/images/docs/testimonials/customer-voices.png)

The renderer is dependency-free, reflows on narrow viewports, themes through the standard CSS variables and works in dark mode. `avatar` accepts an emoji or an image URL.

## When to use it

Use `Testimonials` for **social proof** on landing/marketing pages. Demo: `/testimonials-demo`.
