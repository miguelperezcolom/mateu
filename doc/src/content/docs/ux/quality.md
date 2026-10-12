---
title: "How UX quality is kept"
description: "Why a Mateu app gets its UX quality without per-screen work, the principles behind every pattern, how they are checked, and what is guaranteed for accessibility and slow networks on every renderer."
---

In a hand-built UI, quality is decided screen by screen. In Mateu it is decided **once**, in the
derivation and in the renderers, and every app inherits it: a fix to how a rejected save is
announced, or how a slow request is shown, reaches every screen of every app at the next release.
That is also why your screens should stay inside the model as long as they can (see
[extending the UI](/ux/extending/)): what you draw yourself, you have to get right yourself.

## The principles

Every pattern exists to remove a concrete cost from people who spend their day in the app:
preserve context, minimise navigation, keyboard first, workflow over screens, progressive
complexity, recoverability and consistency. The [pattern catalogue](/ux-patterns/) lists them with
the anti-pattern each one prevents (the CRUD tunnel, modal hell, filter amnesia…).

## How it is checked

[How Mateu's UX is evaluated](/ux-patterns/how-ux-is-evaluated/) describes the method: heuristic
reviews on every renderer in light and dark and at desktop and phone widths, cognitive
walkthroughs of typical tasks, synthetic users with several profiles (first-time, keyboard-only,
phone, screen reader), task metrics, and visual consistency rules. It also says plainly what those
methods cannot replace.

## Accessibility

Keyboard and screen-reader support is part of the renderers, not of your screens: labelled
fields with their errors announced, focus moved to the first rejected field, dialogs and drawers
that trap and return focus, a skip link, landmarks, live regions for navigation and messages, and
keyboard activation for every clickable element. The same guarantees are expressed natively in
React Native and IntelliJ, and probes check them on every change.

- [Accessibility](/ux-patterns/accessibility/): what is guaranteed, per renderer, and how it is
  verified.
- [Accessibility in your code](/java-user-manual/advanced/accessibility/): what remains yours
  (labels that make sense, alternatives for images, custom components).

## Slow and unreliable connections

A business app is used on hotel Wi-Fi and in basements. The renderers show a skeleton when a page
has no content yet, mark the pressed control as busy instead of freezing the screen, refuse double
submits, retry safe reads, explain failures in plain language with a *Retry* control, and show
when the connection is lost and when it is back. Writes are never repeated behind your back.
See [slow connections](/ux-patterns/slow-connections/).

## Recoverability

Mistakes are expected, so they are cheap: [undo](/ux-patterns/undo/) on reversible actions,
confirmation on destructive ones, an unsaved-changes guard before leaving a dirty form,
[conflict resolution](/ux-patterns/optimistic-locking/) when two people edit the same record,
[session expiry](/ux-patterns/session-expiry/) that keeps the work, and an
[error boundary](/java-user-manual/advanced/security/) that shows a readable message with a
reference instead of a stack trace.

## Consistency across renderers and backends

The same model must produce the same screen wherever it runs. The
[renderer contract](/design-systems/renderer-contract/) measures each renderer against shared
fixtures; the conformance corpus requires the Java, .NET and Python backends to produce identical
wire output; and the [parity matrix](/reference/parity/) states what each one supports. More in
[Quality](/quality/).
