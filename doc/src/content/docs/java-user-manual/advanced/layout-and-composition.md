---
title: "Layout and composition"
---

Mateu composes page layout from three orthogonal concerns: structure (layout type), placement (regions and fieldsets), and constraints (inline style). All are declared with annotations — no template files required.

**When to use:** reach for layout annotations when the default vertical stacking of fields is not enough, or when you want to enforce consistent width and centering across pages.

---

## Layout types

Apply a layout annotation to a class or a nested section. Available options:

| Annotation | Effect |
|---|---|
| `@Section` | Stack sections top to bottom (default) |
| `@Zones` / `@Zone` | Arrange sections side by side, in columns |
| `@FormLayout` | Responsive multi-column form grid |
| `@MasterDetail` | Master/detail panel |
| `@FoldedLayout` | Collapsible sections |
| `@Tab` | Tabbed sections |

```java
public class UserEditorPage {
    @Tab("Personal") PersonalInfo personalInfo;
    @Tab("Contact") ContactDetails contact;
    @Tab("Roles") RolesSection roles;
}
```

Consecutive fields sharing a `@Tab` name become one tab. Mateu renders the container and wires navigation between sections.

---

## Page-level styling with `@Style`

`@Style` applies an inline CSS string to the root element of the page. The most common use is constraining width and centering content:

```java
public class StyleConstants {
    public static final String CONTAINER = "max-width:900px;margin:auto;";
    public static final String WIDE      = "max-width:1200px;margin:auto;";
}
```

```java
@Style(StyleConstants.CONTAINER)
public class UserDetail {}
```

```yaml
# src/main/resources/specs/ui/routes.yaml
type: Routes
routes:
  - route: users/:id
    viewModel: com.example.UserDetail
```

Define the constants once and reuse them across pages to keep widths consistent.

---

## Field-level colspan

Fields in a form grid default to one column. Use `@Colspan` to let a field span the full row:

```java
@Colspan(2)
String notes;
```

This works inside any class rendered with `@FormLayout`.

---

## Combining layout and rules

Layout annotations compose with field rules. A `@Hidden` field still occupies no space; a field with `@Colspan(2)` widens only when it is visible.

```java
public record ProductForm(
    String sku,
    int quantity,
    boolean hasVariants,
    @Colspan(2) @Hidden("!state.hasVariants") String variantNotes
) {}
```

---

## Mental model

- **Layout annotation** — controls how top-level sections or nested classes are arranged
- **`@Style`** — CSS string applied to the page root; use shared constants to keep it consistent
- **`@Colspan`** — makes a form field span multiple grid columns

---

## Next

- [Rules](/java-user-manual/advanced/rules/) — conditional visibility and display transformations
- [Custom web components](/java-user-manual/advanced/custom-web-components/) — embed arbitrary HTML elements inside a page
- [Customizing CRUD and listings](/java-user-manual/build/customizing-crud-and-listings/) — apply layout to editor and listing pages
