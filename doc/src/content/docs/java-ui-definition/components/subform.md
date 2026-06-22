---
title: "Subform"
---

A subform is a nested form rendered inside a parent form. It has its own title, toolbar, button bar, and fields — and its actions are dispatched directly to the nested object, not to the parent.

Mateu detects subforms automatically from the type of a field. No special annotation is needed on the field itself.

---

## When a nested type becomes a subform

A field of a complex type (class or record) is rendered as a **subform** when its type meets both of these conditions:

1. It has at least one method (or field) annotated with `@Button` or `@Toolbar`.
2. It has at least one non-action data field.

If neither condition is met, the nested type is rendered as an **embedded field group** (the legacy behaviour): the sub-fields appear inline inside the parent form with no chrome around them.

---

## Example

```java
// Nested type — qualifies as a subform because it has @Toolbar and data fields
public record Subform1(String address, String city) {

    @Toolbar
    Object save() {
        return Message.builder()
                .text("Saved: " + this)
                .build();
    }
}

// Another nested type — qualifies as a subform because it has @Button
public record Subform2(@Stereotype(FieldStereotype.radio) Sex sex, Religion religion) {

    @Button
    Object confirm() {
        return Message.builder()
                .text("Confirmed: " + this)
                .build();
    }
}

// Parent form
@Route("/page3")
public class Page3 {

    String name;
    int age;

    @Section("Address")
    Subform1 subform1;   // → rendered as a subform with a toolbar

    @Section("Preferences")
    Subform2 subform2;   // → rendered as a subform with a button bar

    @Toolbar
    Object save() {
        return Message.builder()
                .text("Saved page: " + this)
                .build();
    }
}
```

`Page3` renders as a single page that contains:

- Its own toolbar with the `save` action.
- A section titled "Address" containing a subform with `address` and `city` fields and a `save` toolbar button scoped to `Subform1`.
- A section titled "Preferences" containing a subform with `sex` and `religion` fields and a `confirm` button scoped to `Subform2`.

---

## Action scoping

When the user clicks a button inside a subform, the action is dispatched to the **nested object**, not to the parent. The nested object receives the current values of its own fields and executes the annotated method.

This means the parent form does not need to know about or delegate to the child's actions. Each subform manages its own behaviour independently.

---

## Toolbar vs buttons

The same rules that apply to top-level forms apply inside a subform:

| Annotation | Rendered as |
|---|---|
| `@Toolbar` | Button in the subform toolbar (top area) |
| `@Button` | Button in the subform footer (bottom area) |

---

## Embedded field group (no actions)

If the nested type has data fields but **no** `@Button` or `@Toolbar` annotations, it is rendered as an embedded field group without any chrome:

```java
public record Address(String street, String city, String zip) {}

public class CustomerForm {
    String name;
    Address address;   // → fields embedded inline, no subform chrome
}
```

Use a subform when the nested object has its own actions. Use an embedded group when it is pure data with no actions.

---

## @Inline subforms

Adding `@Inline` on the field merges the nested type's fields directly into the parent section — no `Card` wrapper, no separate header. The parent field's `@Section` annotation supplies the section title.

`@Toolbar` and `@Button` methods on the nested type still work, but their placement shifts to match the inline context:

| Annotation | Rendered as |
|---|---|
| `@Toolbar` | Button(s) in the **section title row**, same line as the heading |
| `@Button` | Button row **below** the section content |

Actions are still scoped to the nested object; clicking a toolbar button calls the method on the `GuestsSection` instance, not on the parent form.

### Example

```java
@PlainText
@Compact
public class GuestsSection {

    @Label("")
    @Stereotype(FieldStereotype.grid)
    List<GuestData> guests = new ArrayList<>();

    @Toolbar
    @Label("Welcome card")
    Object printWelcomeCard(HttpRequest httpRequest) {
        return Message.success("Sent to printer");
    }

    @Button
    @Label("Wi-Fi code")
    Object showWifiCode(HttpRequest httpRequest) {
        return Message.success("Code: HOTEL-GUEST");
    }
}

@UI("/checkin/:id")
@Zones({ @Zone(name = "left", width = "64%"), @Zone(name = "right", width = "36%") })
public class CheckInForm {

    @Section(value = "Guests", columns = 1, zone = "left")
    @Label("") @Inline
    GuestsSection guestList = new GuestsSection();
}
```

Rendered result for the "Guests" section:

```
┌─ Guests ──────────────── [Welcome card] ──────────────────────┐
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Name          Room    Arrival     Departure             │  │
│  │  …                                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                              [Wi-Fi code]      │
└────────────────────────────────────────────────────────────────┘
```

The section heading and `@Toolbar` button share the same row. The `@Button` sits below the grid.

### When to use `@Inline`

Use `@Inline` when:

- The section should have **no visual chrome** (no card shadow, no nested card border) around the nested content — the parent `@Section` card provides the only container.
- The nested type is tightly coupled to its section and does not need its own standalone visual identity.
- Dense screens (`@Compact`, `@Zones`) where an extra card nesting would add too much visual weight.

Use the default (non-`@Inline`) subform when the nested type should appear as its own clearly separated card with a title and toolbar inside the section.
