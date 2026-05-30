---
title: Keyboard Shortcuts
description: First-class keyboard navigation for power users.
---

**Status:** ✅ Implemented — `@Action(shortcut = ...)`, `@Trigger(type = OnEnter)`

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
