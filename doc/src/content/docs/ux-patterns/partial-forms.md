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

Use `@Section` to split fields into groups (and `@FoldedLayout` on the page class to lay those groups side by side). Define each logical group as a **nested record or class** (a subform field). Methods annotated with `@Toolbar` or `@Button` inside those nested types become actions scoped to that section only.

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

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

```java
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

```yaml
# src/main/resources/specs/ui/routes.yaml
type: Routes
routes:
  - route: home2
    children:
      - route: page3
        viewModel: com.example.Page3
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
| `@FoldedLayout` | Lays the `@Section` cards side by side, one column each, instead of stacking them |
| `@Section("name")` | Starts a new collapsible group; fields below it belong to this group until the next `@Section` |
| Nested record/class field | Becomes the subform rendered inside the section |
| `@Toolbar` on a subform method | Adds a button to that section's own toolbar, scoped to the subform's data |
| `@Button` on a subform method | Adds an inline button inside the section fields |
| `@Toolbar` on the page class | Global toolbar action that can access all sections |
| `@ConfirmOnNavigationIfDirty` | Warns the user before navigating away with unsaved changes |

### Unsaved changes in dialogs and drawers

A tracked form opened in a **dialog or drawer** (a CRUD's create/edit drawer — `editInDrawer()` or
an `Editable` listing without `Navigable` — is tracked automatically) is guarded too: closing the
overlay by hand (Cancel, ✕, Esc, a click outside, the drawer's record arrows) with unsaved edits asks
*"Discard your changes?"* first; staying keeps the overlay open with what was typed. The question
is about that overlay only — the page behind keeps its own dirty state — and a close the server
sends after a successful save (`UICommand.markAsClean()` + `closeModal()`) never asks. Every
renderer behaves the same way: Vaadin through the same confirmation the navigation guard uses,
Redwood through Spectra's unsaved-changes banner.

Leaving the **screen** while an overlay is open — the browser's Back or Forward, a menu entry, a
link, a `NavigateTo` — asks *once* when the page **or** an open dialog/drawer holds unsaved changes.
Staying keeps everything as it was (the drawer and what was typed in it; after a Back or Forward the
address is put back); leaving discards the changes and closes every open dialog and drawer before
the new page loads. A navigation with nothing unsaved closes them too, so no drawer is left over
the next page. Vaadin and Redwood behave alike here (on Redwood the question is the navigation
guard's, not the drawer template's banner, which belongs to closing the drawer itself).

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
