---
title: Partial Forms
description: Divide a complex form into independent, collapsible sections each with its own toolbar actions.
---

**Status:** ✅ Implemented — `@FoldedLayout`, `@Section`, nested records/classes, `@Toolbar` on subforms

## Intent

Allow users to work on one part of a complex entity at a time, without being forced to save (or scroll through) the entire form at once.

## Problem

A customer record, a product sheet, or a booking with dozens of fields is overwhelming as a single flat form. Forcing a global Save on the whole page means:

- The user cannot partially save one section while leaving another incomplete.
- The page becomes a scroll prison — everything visible at once, nothing prioritised.
- Section-specific actions (e.g. "Test connection" on a credentials section) don't fit naturally alongside a global Save.

## Solution

Use `@FoldedLayout` on the page class and `@Section` to split fields into collapsible panels. Define each logical group as a **nested record or class** (a subform field). Methods annotated with `@Toolbar` or `@Button` inside those nested types become actions scoped to that section only.

```
Page
  [@FoldedLayout]
  ├── @Section "General"   → plain fields + global @Toolbar save
  ├── @Section "Address"   → Subform1 field
  │     └── Subform1.test1()  [@Toolbar]  ← section-scoped button
  └── @Section "Preferences" → Subform2 field
        └── Subform2.test2()  [@Button, shortcut ctrl+f1]  ← inline button
```

---

## Example

### Page class

```java
@Route(value = "/page3", parentRoute = "/home2")
@FoldedLayout
@Action(shortcut = "ctrl+f2", id = "save")
@ConfirmOnNavigationIfDirty
public class Page3 {

    @Section("sf0")   // plain fields — belong to the global form
    String name;
    int age;

    @Section("sf2")   // section whose content is a subform
    Subform1 subform1;

    @Section("sf1")
    Subform2 subform2;

    @Toolbar          // global save — operates on the whole page
    Object save() {
        return List.of(
            Message.builder().variant(NotificationVariant.success)
                             .text("Saved " + this).build(),
            UICommand.markAsClean()
        );
    }
}
```

### Subform with a toolbar action

```java
public record Subform1(String address, String city) {

    @Toolbar                // button appears in the "sf2" section toolbar
    Object test1() {
        return Message.builder().text("test1 on " + this).build();
    }
}
```

### Subform with an inline button and a shortcut

```java
public record Subform2(
    @Stereotype(FieldStereotype.radio) Sex sex,
    Religion religion
) {
    @Button
    @Action(shortcut = "ctrl+f1", confirmationRequired = true)
    Object test2() {
        return Message.builder().text("test2 on " + this).build();
    }
}
```

---

## How it works

| Element | Role |
|---|---|
| `@FoldedLayout` | Renders each `@Section` as a collapsible panel — the user expands only what is relevant |
| `@Section("name")` | Starts a new collapsible group; fields below it belong to this group until the next `@Section` |
| Nested record/class field | Becomes the subform rendered inside the section |
| `@Toolbar` on a subform method | Adds a button to that section's own toolbar, scoped to the subform's data |
| `@Button` on a subform method | Adds an inline button inside the section fields |
| `@Toolbar` on the page class | Global toolbar action that can access all sections |
| `@ConfirmOnNavigationIfDirty` | Warns the user before navigating away with unsaved changes |

---

## Structure

```
┌─ Page3 ──────────────────────────────────────────────────────┐
│  [Save ⌘F2]                        ← global toolbar          │
├─ sf0 ▼ ──────────────────────────────────────────────────────┤
│  Name [_________]   Age [___]                                 │
├─ sf2 ▼ ──────────────────────────────────────────────────────┤
│  [test1]                           ← Subform1 toolbar         │
│  Address [_________]  City [_____]                            │
├─ sf1 ▼ ──────────────────────────────────────────────────────┤
│  Sex  ● Male  ○ Female             ← radio (Subform2)         │
│  Religion [Catholic ▼]                                        │
│  [test2 ⌃F1]                       ← @Button inline           │
└──────────────────────────────────────────────────────────────┘
```

---

## When to use

- **Complex entities** with 15+ fields naturally grouped into independent concerns (personal data, contact, billing, preferences, …).
- **Section-specific actions** that only make sense for that group (e.g. "Validate address", "Test credentials", "Preview").
- **Progressive disclosure** — show the most important section open by default, collapse the rest.
- **Independent save per section** — each subform's `@Toolbar` action can persist only its own slice of data.

## When not to use

- Short forms (< 8 fields) — the overhead of collapsible panels is not worth it.
- Wizard flows where sections have strict ordering — use [`@WizardCompletionAction`](/ux-patterns/wizard/) instead.

---

## Principles served

- **Progressive complexity** — advanced sections are collapsed until needed
- **Workflow over screens** — section-scoped actions avoid a round-trip to a dedicated sub-page
- **Recoverability** — `@ConfirmOnNavigationIfDirty` prevents accidental data loss
