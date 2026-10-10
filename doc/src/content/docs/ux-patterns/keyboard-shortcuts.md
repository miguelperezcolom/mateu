---
title: Keyboard Shortcuts
description: First-class keyboard navigation for power users.
---

**Status:** ✅ Implemented — `@Action(shortcut = ...)`, `@Tab(shortcut = ...)`

## Intent

Let expert users complete frequent tasks without touching the mouse.

## Problem

Users who spend hours in a backoffice application are slowed down every time they must reach for the mouse to trigger a common action. A keyboard-hostile interface is the *Desktop Denial* anti-pattern: it penalises the users who know the system best.

## Solution

### Action shortcuts — `@Action(shortcut = ...)`

Attach a keyboard shortcut to any action. The shortcut is active whenever the view that owns the action is focused.

```java
@Action(shortcut = "ctrl+s")
public void save() {
    orderService.save(this);
}

@Action(shortcut = "ctrl+enter")
public void submit() {
    workflowService.submit(this);
}

@Action(shortcut = "escape")
public void cancel() { }
```

Shortcut strings follow standard modifier notation: `ctrl`, `shift`, `alt`, `meta` (⌘ on Mac), combined with a key name (`s`, `enter`, `escape`, `f2`, etc.).

### Enter key

To run an action when the user presses Enter, give it `@Action(shortcut = "enter")`. (There is
no `OnEnter` trigger type.) Listings search on Enter by default (`searchOnEnter`).

### Tab shortcuts — `@Tab(shortcut = ...)`

Attach a shortcut to a tab so users can jump straight to it without the mouse. Use the same
modifier notation as action shortcuts.

```java
@UI("/order")
public class OrderForm {

    @Tab(value = "Customer", shortcut = "alt+1")
    String customer;

    @Tab(value = "Items", shortcut = "alt+2")
    String items;

    @Tab(value = "Billing", shortcut = "alt+3")
    String billing;
}
```

Pressing the shortcut selects the matching tab in place — no server round-trip, no navigation.
`alt+<number>` reads naturally as "go to tab N" and avoids clashing with text input.

:::tip[One tab strip per form]
Tabs are grouped by consecutive fields that share the same `@Tab` name. Avoid putting a
`@Section` on each tab's fields if you want a single tab strip — a section boundary per tab
splits the form into several separate one-tab strips.
:::

### Default open tab — `@Tab(open = true)`

By default the first declared tab is selected when the strip first renders. Mark a different tab
with `open = true` to have it be the one shown initially instead:

```java
@Tab(value = "Customer", shortcut = "alt+1")
String customer;

@Tab(value = "Items", shortcut = "alt+2", open = true)   // ← selected on first render
String items;

@Tab(value = "Billing", shortcut = "alt+3")
String billing;
```

`open` is independent of `shortcut`: the shortcut selects the tab on demand, `open` only sets the
initial selection. If several tabs in the same strip declare `open = true`, the first one wins.
Useful when the most relevant tab isn't the first — e.g. a detail drawer whose most-used section
should be front and center as soon as it opens.

### Section index shortcuts — `@Toc`

On a long page with a [sticky sections index](/ux-patterns/sections-index/), `Ctrl+Alt+1..9` jump to
the first nine sections (same as clicking the index entry). This is on by default whenever the index
is shown — no extra configuration. The shortcut number is shown as a faint badge on each index entry.

### Grid row selection — `@OnRowSelected(shortcut = ...)`

Give a grid's row-selection action a `shortcut` base so users can select a row by position: the base
combo plus a digit selects that row.

```java
@Stereotype(FieldStereotype.grid)
@OnRowSelected(value = "onGuestSelected", shortcut = "ctrl+shift")
List<GuestData> guests;
```

`Ctrl+Shift+1` selects the first row … up to the ninth, exactly as if the row had been clicked (it
fires the same `@OnRowSelected` method, so any master/detail wiring reacts identically).

### Keyboard-layout independence

Shortcuts are matched by physical key (`e.code`) as well as logical key, so `Ctrl+Alt+<letter>` and
`<modifier>+<digit>` work regardless of the keyboard layout — even where e.g. a Spanish layout's
AltGr remaps `Ctrl+Alt+E` to `€` — and the numeric keypad works too. Buttons that carry a shortcut
show it in their tooltip.

## Recommended shortcuts

Consistent conventions across the application reinforce the *Consistency* principle.

| Action | Suggested shortcut |
|---|---|
| Save / Submit | `Ctrl+S` |
| Confirm / Send | `Ctrl+Enter` |
| Cancel / Close | `Escape` |
| New record | `Ctrl+N` |
| Delete | `Ctrl+Delete` |
| Search / Filter | `Enter` (via `@Trigger`) |

## Access keys mode (`@App(accessKeys = true)`)

Back-office suites let the user **hold a key to see the keys** (OPERA Cloud with its access key):
annotate the app class with `@App(accessKeys = true)` and holding **Alt** shows a small badge next to
every visible button and tab —

- the **declared shortcut** when the button's `@Action(shortcut)` (or a `@Tab(shortcut)`) has one;
- otherwise a **letter of its label**, assigned automatically without repeats (word initials first,
  then any letter, then digits; letters taken by `alt+<letter>` shortcuts are skipped).

**Alt + that letter** presses it; letting go of Alt hides the badges. The letter is matched by
physical key, so it works on macOS (where Alt changes the character) and any keyboard layout.

```java
@App(value = AppVariant.HAMBURGER_SECTIONS, accessKeys = true)
public class PmsHome { … }
```

Works on Vaadin and Redwood; the IntelliJ plugin maps it to Swing **mnemonics** (its native
access keys); React Native has no hardware-key model, so the flag is ignored there. .NET:
`[App(AccessKeys = true)]`; Python: `@app(access_keys=True)`.

On **Redwood**, `@Action(shortcut)` (combinations with Ctrl, Alt or Meta) and `@Tab(shortcut)` work
the same as on Vaadin.

## Principles served

- **Keyboard-first** — frequent tasks require no mouse gesture
- **Consistency** — the same shortcut does the same thing everywhere in the app
- **Workflow over screens** — shortcuts let users stay in flow without stopping to navigate
