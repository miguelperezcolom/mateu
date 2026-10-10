---
title: How Mateu's UX is evaluated
description: The method behind Mateu's UX quality bar — heuristic reviews, task walkthroughs, synthetic users, task metrics and accessibility probes on every renderer — what it catches and what it cannot.
---

**Status:** 🚧 Method defined; the GA review runs it on every renderer and publishes the findings here.

## Intent

Mateu generates the screens, so the screens' usability is Mateu's responsibility, not the app
developer's. The aim for the supported renderers is that what Mateu generates is **correct** — and
optimal where possible — and **pleasant to look at**, without a brand identity of its own: each
renderer stays inside its design system (Lumo for Vaadin, Redwood tokens for the VB renderer), so a
Mateu app looks like a well-made app of that design system.

This page says how that is checked, so the bar is explicit and repeatable — every UX claim in these
docs should be traceable to one of the methods below.

## Without user testing — on purpose, and what that costs

The evaluation does **not** rely on sessions with real users. It uses inspection and simulation
methods instead, several of them, so that what one misses another tends to catch.

Be clear about the limit: no inspection method fully replaces watching real people. What it catches
less well is **domain misunderstanding** (a label that is precise to us and ambiguous to a hotel
receptionist) and **unwritten expectations** (what a user assumes a screen will do from the tools
they already use). If your organisation can run user tests on its own Mateu apps, do — and report
what you find; it improves the generator for everyone.

## The methods

### 1. Heuristic evaluation (two passes)

Every pattern and component, on every supported renderer, in light and dark, desktop and mobile
widths, reviewed against:

- **Nielsen's 10 usability heuristics** (and the NN/g guidance on forms, tables, error messages,
  empty states and dashboards) — the checklist;
- **visual craft** criteria from *Refactoring UI* (Wathan & Schoger): hierarchy, spacing on a fixed
  scale, consistent size progression, colour used for meaning, restraint.

Each finding cites the heuristic or principle it violates.

### 2. Cognitive walkthroughs per task

For each typical task — create a record, find one and edit it, filter and export, complete a wizard,
recover from a validation error, find a screen through the menu, undo a mistake — each step is
checked with four questions:

1. Will the user know what to do at this point?
2. Will they see the control that does it?
3. Will they connect the control with what they want?
4. After acting, will they understand the response?

A "no" anywhere is a finding.

### 3. Synthetic users

Agents use the demo apps in a **real browser**, knowing only the goal of the task — not the code,
not the docs. They log where they hesitate, what they looked for and did not find, wrong turns, and
how many steps and errors the task cost. Run with several profiles:

- a first-time user;
- a keyboard-only expert;
- a phone-width user;
- a screen-reader user (navigating by the accessibility tree only).

This is a simulation, not a substitute for people; its value is breadth and repeatability — the same
tasks can be re-run after every change.

### 4. Task metrics

The walkthrough tasks are also scripted with Playwright and **measured**: clicks, steps, time to
completion, recoverable errors. Every fix is measured before and after, so an improvement is a
number, not an opinion.

### 5. Accessibility

- **axe-core** on every screen of the demo and test apps;
- the **behaviour probes** that axe cannot replace (focus management in overlays, keyboard
  operation, live-region announcements, focus after navigation and after a rejected save) — see
  [Accessibility](/ux-patterns/accessibility/) — on the web renderers, Redwood, React Native and
  IntelliJ;
- **200 % zoom** and **forced-colours / high-contrast** modes;
- conformance target **WCAG 2.2 AA**, with WAI-ARIA Authoring Practices for widget behaviour.

### 6. The developer journey

The developer is a user too. From the documentation alone: new project in the IDE → first screen →
first CRUD → deploy. Every place where the docs, the IDE tooling or an error message leaves the
developer stuck is a finding.

### 7. Pattern comparison

Mateu's patterns are compared with the enterprise design systems that document theirs — IBM
Carbon, SAP Fiori, Microsoft Fluent 2, Material 3, Atlassian and Oracle Redwood — and with the
pattern literature (Tidwell's *Designing Interfaces*, Cooper's *About Face*; Silver's *Form Design
Patterns* and Wroblewski for forms; Few for dashboards). **Patterns, not style**: the question is
whether the interaction is right, never whether it looks like someone else's product.

## Visual consistency rules

Some of the bar is mechanical, so it is enforced by tests rather than reviews:

- spacing, type, colour, radius and elevation come from the **design system's tokens**; a guard test
  fails on hard-coded values in Mateu's own components;
- one icon family per renderer (no mixing a design-system icon set with emoji);
- consistent size progression for buttons and controls (S / M / L);
- dashboards: every chart names its metric and has a legend whose colours match; every number states
  its timeframe; one date format per locale; tables sorted meaningfully by default.

## How findings are handled

Each finding records: the screen and renderer, steps to reproduce, a screenshot, the method that
found it, the reference it cites, and a priority:

| Priority | Meaning |
|---|---|
| **P1** | blocks or misleads the user, or fails WCAG AA |
| **P2** | slows the user down or causes recoverable errors |
| **P3** | polish: inconsistency, visual noise, sub-optimal default |

P1 and P2 are fixed in the generator before the release they are found in; P3 are fixed or recorded
with a reason. Because the screens are generated, a fix applies to **every Mateu app** at once.

## Results

The findings of the GA review — and their fixes — will be published here when the review completes.
