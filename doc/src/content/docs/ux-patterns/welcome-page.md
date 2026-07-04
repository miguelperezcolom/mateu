---
title: Welcome page
description: A friendly introduction to a flow with clear calls to action.
---

**Status:** ✅ Implemented

## Intent

Give first-time or occasional users a friendly entry point to a flow: a big hero that explains what this is, one or two clear calls to action, and highlight tiles with the most important information or steps.

## Problem

Dropping occasional users straight into a dense operational screen forces them to reconstruct "what do I do first?" every time. A hand-built landing page is easy to write once but tends to drift stylistically from the rest of the app.

## Solution

Extend `Welcome`. `Button` fields become call-to-action buttons inside the hero; component fields annotated with `@Panel` become highlight tiles on a responsive grid below.

```java
@UI("/welcome")
@Title("Welcome")
public class WelcomeDemo extends Welcome {

    Button start = Button.builder()
            .label("Start check-in").actionId("startCheckin")
            .buttonStyle(ButtonStyle.primary).build();

    @Panel(title = "1 · Search the booking")
    Markdown step1 = new Markdown("Find the reservation by locator, guest name or room.", null, null);

    @Panel(title = "2 · Verify the guests")
    Markdown step2 = new Markdown("Scan documents and confirm the cardex.", null, null);

    @Override protected String heroTitle() { return "Front desk check-in"; }
    @Override protected String heroSubtitle() { return "Everything you need, in three steps"; }

    @Action
    Object startCheckin() { return URI.create("/checkin"); }
}
```

![Welcome page](/images/docs/welcome/welcome-demo.png)

The CTA's `actionId` runs the matching `@Action` method — return a `URI` to navigate into the flow. Override `heroImage()` for a background image (a dark overlay keeps text readable).

## When to use it

Use a welcome page as the entry route of flows used by **occasional or first-time users** (self-service portals, guided processes, seasonal tasks). Power users working the same screen all day are better served by a [Dashboard](/ux-patterns/dashboard) or by the operational screen itself.
