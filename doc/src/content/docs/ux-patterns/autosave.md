---
title: Autosave
description: Eliminate the anxiety of losing work and the doubt of whether it was saved.
---

**Status:** ✅ Implemented — `@AutoSave`

## Intent

Eliminate the anxiety of losing work and the doubt of whether changes were persisted.

## Problem

A user fills out a long form, the session times out or the tab is accidentally closed, and everything is lost. Or they are left unsure whether the last "Save" actually went through. Both are correctability failures.

## Solution

Annotate the view class with `@AutoSave`. Mateu debounces field changes and automatically triggers the designated save action, keeping the backend in sync without any user gesture.

```java
@UI("/orders/{id}/edit")
@AutoSave
public class EditOrder {

    private String ref;
    private LocalDate date;
    private String notes;

    public void save() {
        orderService.update(id, ref, date, notes);
    }
}
```

By default, `@AutoSave` targets the first eligible action on the class. You can specify the action explicitly:

```java
@AutoSave(action = "save")
```

### How it works

1. Any field change triggers a debounce timer (default: ~800 ms).
2. After the debounce window, the `save` action fires automatically.
3. The action is local — it does not trigger navigation or page reload.

### When to use it

| Use `@AutoSave` | Use explicit Save button |
|---|---|
| Long editing sessions where data loss is costly | Workflows with a discrete "commit" concept |
| Drafts, notes, configuration | Multi-step wizards |
| Any field-by-field editing workflow | Destructive operations |

## Principles served

- **Recoverability** — work is never lost to an accidental close or timeout
- **Workflow over screens** — saving becomes invisible infrastructure, not a user task
- **Minimize navigation** — no "save and stay" vs "save and go" decision required
