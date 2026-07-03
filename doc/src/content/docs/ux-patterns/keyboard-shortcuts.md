---
title: Keyboard Shortcuts
description: First-class keyboard navigation for power users.
---

**Status:** ✅ Implemented — `@Action(shortcut = ...)`, `@Trigger(type = OnEnter)`, `@Tab(shortcut = ...)`

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

### Enter key on forms — `@Trigger(type = OnEnter)`

Use `@Trigger(type = TriggerType.OnEnter)` to fire an action when the user presses Enter anywhere in a form, without attaching the shortcut to a specific action button.

```java
@Trigger(type = TriggerType.OnEnter, calledActionId = "search")
public class ProductSearch {
    private String name;

    public List<Product> search() {
        return productRepo.search(name);
    }
}
```

### Tab shortcuts — `@Tab(shortcut = ...)`

Attach a shortcut to a tab so users can jump straight to it without the mouse. Use the same
modifier notation as action shortcuts.

```java
@UI("/order")
@Tabs
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

## Principles served

- **Keyboard-first** — frequent tasks require no mouse gesture
- **Consistency** — the same shortcut does the same thing everywhere in the app
- **Workflow over screens** — shortcuts let users stay in flow without stopping to navigate
