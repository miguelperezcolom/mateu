---
title: "@UISpec"
---

Declares that a Java class uses a **YAML file** to define its component tree instead of `ComponentTreeSupplier` or reflection-based rendering.

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface UISpec {
    String value();   // classpath path to the YAML spec file
}
```

## What it does

When Mateu renders a class annotated with `@UISpec` it:

1. Loads the component tree from the YAML file at the given classpath path.
2. Uses the Java instance for **state** (field values), **actions** (methods), **rules**, **validations**, and **triggers** — exactly as it would for any other ViewModel.

This gives you the layout flexibility of YAML without losing the server-side logic of a Java class.

## Usage

```java
@Route("customer-form")
@UISpec("specs/ui/customer-form.yaml")
public class CustomerFormViewModel {

    public String name;
    public String email;
    public LocalDate birthDate;

    @Button
    public void save() {
        // server-side logic here
    }
}
```

`specs/ui/customer-form.yaml` (place under `src/main/resources`):

```yaml
type: VerticalLayout
spacing: true
padding: true
content:
  - type: FormLayout
    content:
      - type: FormField
        id: name
        label: "Name"
        dataType: string
        required: true
      - type: FormField
        id: email
        label: "Email"
        dataType: string
        stereotype: email
      - type: FormField
        id: birthDate
        label: "Birth date"
        dataType: date
  - type: HorizontalLayout
    content:
      - type: Button
        label: "Save"
        actionId: save
        buttonStyle: primary
```

## Difference from `ComponentTreeSupplier`

| | `ComponentTreeSupplier` | `@UISpec` |
|---|---|---|
| Component tree defined in | Java code | YAML file |
| State / actions / rules | From the same class | From the same class |
| Designer-editable layout | No — Java code only | Yes — YAML file |
| Dependency injection | Full access | Full access |
| Dynamic / computed layout | Yes — arbitrary Java logic | No — static YAML |

## Precedence rules

- If the class **implements `ComponentTreeSupplier`**, `@UISpec` is ignored — the `component()` method takes precedence.
- If the YAML file is **not found** at the given path, Mateu falls back to the normal reflection-based rendering of the class.

## File path convention

The path is a classpath resource path. The recommended convention mirrors the route:

| Route | `@UISpec` value |
|---|---|
| `customer-form` | `"specs/ui/customer-form.yaml"` |
| `admin/users/edit` | `"specs/ui/admin/users/edit.yaml"` |

Place files under `src/main/resources/specs/ui/`.

## When to use

Use `@UISpec` when:

- You want a **designer-managed layout** for a page that still has server-side logic.
- You are separating **UI structure** (YAML, owned by the team's designer) from **behaviour** (Java, owned by the backend developer).
- You want the layout to be **externally configurable** without recompiling Java code.

Use `ComponentTreeSupplier` instead when the component tree must be **computed at runtime** from Java logic.
