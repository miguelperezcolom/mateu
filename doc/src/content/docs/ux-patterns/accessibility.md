---
title: Accessibility
description: What Mateu guarantees for keyboard and screen-reader users without any code on your part, and how it is verified.
---

**Status:** ✅ Implemented

## Intent

In a model-driven framework the developer does not write the HTML. That is usually the problem with accessibility — there is nowhere to fix it — but here it is the lever: **the generator is the only place it has to be right, and fixing it fixes every app at once**, including the ones already written, without a line of user code changing.

So none of what follows is opt-in. You get it by using Mateu.

## What you get without doing anything

### Forms

Field labels, required state and help text are wired by the design system's own components, so a screen reader announces each control properly.

**Validation is announced.** When the server rejects a save, the message is set ON the control (`invalid` + `errorMessage`), which is what makes the design system emit `aria-invalid` and `aria-describedby` inside its shadow root — something no markup outside that boundary could do. The error is also announced through a live region, and **the focus moves to the first rejected field**, so the user is taken to the problem instead of being told there is one somewhere.

> Before this, errors rendered as a detached `<ul>` beside the field. Visible, but with no relationship to the input: the control still said `aria-invalid="false"`, nothing pointed at the message, and a screen-reader user pressing Save heard nothing at all.

### Overlays

`Dialog` and `Drawer` are real modals: `role="dialog"`, `aria-modal`, and they **own the focus** while open — the focus moves in, Tab and Shift+Tab cycle inside, and closing returns it to the control that opened it. A modeless or layout drawer deliberately does none of this, because it sits alongside the page rather than over it.

### Keyboard

Every widget Mateu makes clickable is also operable: task-queue and kanban cards, calendar events, gantt bars, tree nodes, FAQ questions, timeline entries and the rest carry a role, a tab stop, Enter/Space activation and a visible focus ring.

Focus rings matter as much as reachability: an element you can Tab to but cannot see is barely better than one you cannot reach. Style them yourself if you want — every such element carries a role you can target:

```css
[role="button"]:focus-visible { outline: 2px solid var(--brand-accent); }
```

### Orientation

- **Skip to content** (WCAG 2.4.1) is the first thing Tab reaches, so the navigation is not re-read on every screen.
- The content area is a `main` landmark.
- **Navigating announces where you landed** — the page title goes into a live region, so a single-page route change is not silent.
- After navigating, the focus moves to the new content's heading instead of staying on the menu link you just clicked. Only on real navigations: a re-render never steals the focus out of a field you are editing.

### Announcements

Two live regions exist from boot (created up front on purpose — a region filled in the same tick it is created is frequently never announced). Error toasts are **assertive** and interrupt; everything else is polite and waits for a pause.

## Verifying it

Two halves, because no single tool sees both:

```bash
cd e2e && npx playwright test tests/shared/accessibility.spec.ts
cd e2e && npm run a11y          # ad-hoc audit over a set of routes
```

- **axe-core** checks the markup rules (labels, contrast, roles, names) on eight representative routes covering every shape Mateu generates. It runs as part of the shared e2e suite, so **every framework adapter gets the same guarantee** and a regression fails the build.
- The rest checks **behaviour** — focus trapping, keyboard operability, live regions, focus-on-error — which axe cannot evaluate at all. A `<div @click>` is invisible to axe: it has no way to know the div was meant to be a button. This is exactly where a hand-rolled widget fails, so it is exactly what is pinned.

### One known exclusion

`vaadin-tabs` is `role="tablist"` and puts a `<div part="tabs" tabindex="-1">` inside its own shadow root; axe counts that as a child the role does not allow. Nothing in the wire model or in any Mateu renderer can change it — the fix belongs upstream. The carve-out is scoped to that one rule on that one element, so a real tablist mistake still fails the build.

## Native renderers

The same guarantees, expressed in each platform's own accessibility API rather than in ARIA.

### React Native (iOS & Android)

Mobile screen readers read an accessibility tree that React Native builds only from explicit
props — there is nothing to infer it from. Two differences from the web matter:

- **A `TextInput` cannot be associated with a nearby label.** There is no `labelFor`, no
  `aria-labelledby`. So the field's name is handed to the control itself: `"Name, required"`, and
  `"Name, required, invalid: Cannot be empty"` once the server rejects it. The error goes in the
  NAME, not the hint — hints are announced last and can be switched off entirely in the OS
  settings, so a message the user must hear cannot live there.
- **A tappable is accessible by default but is not announced AS a button.** Every one now carries
  a role; icon-only ones ("✕", "➤", "💬") carry an explicit label, since otherwise the glyph is
  all the user hears.

Overlays are marked modal, headings are marked as headings, and a refused save or a completed
navigation is spoken through `AccessibilityInfo.announceForAccessibility` — the mobile equivalent
of the web renderers' live region.

Verify it with the probe (React Native for Web maps the props onto their DOM equivalents, which is
what makes this checkable without a device farm):

```bash
cd frontend/app/react-native && EXPO_PUBLIC_MATEU_BACKEND_PORT=8080 npx expo start --web --port 19006
cd e2e && RN_SUBMIT=1 node rn-a11y-probe.mjs
```

### IntelliJ plugin (desktop)

Desktop screen readers read Swing's `AccessibleContext`, which Swing populates almost not at all.

- **The caption is bound to the control it names** (`setLabelFor`) — the Swing analogue of
  `<label for>`. Without it the field is announced as an unnamed edit box and the label reads as
  stray text.
- **Composite fields name their inner control too.** A date field is a text box plus a button, a
  stepper is a spinner wrapping a formatted field; the screen reader follows the FOCUS, which
  lands inside, so a name on the wrapper alone is never read.
- **Required state and `@Help` are spoken**, not just drawn as an asterisk and a grey caption, and
  a validation error is folded into the control's own description.
- Icon-only buttons carry names, and the date picker's trigger is now focusable — browsing months
  used to be mouse-only.

Verify it with the render probe, which prints the accessibility tree beside the visual one:

```bash
cd frontend/app/intellij-plugin
./gradlew renderProbe -Pprobe.json=<increment.json> -Pprobe.baseUrl=http://localhost:8080
```

Each component prints `a11yName`, `a11yDesc` and `labelFor` — a control with no accessible name is
indistinguishable from a correct one in a screenshot, which is exactly why the probe reports it.

## Writing accessible screens yourself

The framework covers the generated UI. Two things are still yours:

- **Labels carry meaning.** `@Label("Name")` is what a screen reader reads; `@Help` becomes the description. A field left to its derived name is announced by that name.
- **Custom fluent components.** If you build a `Component` tree by hand with clickable divs, the framework cannot know they are interactive. Use the same helpers it uses — `onActivate` for Enter/Space, a `role`, and a tab stop.

## Related

- [Keyboard shortcuts](/ux-patterns/keyboard-shortcuts/) — action and tab shortcuts
- [Slow connections](/ux-patterns/slow-connections/) — busy states also set `aria-busy`
