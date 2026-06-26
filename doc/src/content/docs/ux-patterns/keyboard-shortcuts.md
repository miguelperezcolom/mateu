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
