---
title: "Forms"
---

Forms are generated from fields.

## Example

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

```java
@UI("")
public class FormExample {

  String name;
  int age;

}
```

Mateu generates inputs automatically.

## Key idea

Fields = inputs.

## How many columns

Unless you say otherwise, a form lays out in **one column when it has up to 6 visible fields, and in
two columns from 7 on**. A short form reads best top to bottom; two columns only pay off once the
form is long enough to scroll.

- The count is over the **whole form**: every section of it shares the result (a 7-field form split
  into a 3-field and a 4-field section is two columns in both).
- Only the fields that **render as form fields** count: not `@Hidden` (without a condition), `@KPI`,
  `@BadgeInHeader`, `@Timestamp`, `@AppContext`, `@Aside`, `@Menu`, `@Composition` or `@Version`
  fields, nor component holders (`Callable`/`Supplier`/`Runnable`/`Component` fields, which bring
  their own content). A grid or list field counts as one (it takes a full row anyway), and an
  `@Inline` nested form counts its own fields.
- It is decided per **class**, never per caller: a field only some users see (`@EyesOnly`,
  `@Audience`, a conditional `@Hidden("…")`) still counts, so one screen has one layout.
- Each **wizard step** is its own form, and a CRUD's create/edit/view form counts the entity's fields.

Anything you declare wins:

```java
@UI("/customer")
@FormLayout(columns = 2)          // keep two columns on a small form (the previous default)
public class CustomerForm { /* … */ }
```

- `@FormLayout(columns = N)` on the class fixes the whole form;
- `@Section(value = "…", columns = N)` fixes one section (the others keep the form's count);
- a `@Zones` form keeps two columns per section (its layout is declared);
- a fluent or YAML `FormLayout` has no inferred count: it uses its own `maxColumns` (absent = the
  renderer's auto-responsive layout).

The .NET (`[FormLayout(Columns = N)]`) and Python (`@form_layout(columns=N)`) servers apply the same
rule and the same counting.

## Labels on top vs labels aside

By default every field label renders **on top** of its input. For dense backoffice data-entry
forms, Mateu can render labels **aside** (to the left of the input, in a fixed label column) —
the classic enterprise idiom: one compact row per field and a scannable label column, at the cost
of some horizontal room.

You never toggle it by hand unless you want to: Mateu **infers** the mode from the form's shape.
Labels render aside only when the form is *all* of this:

1. **Single-column by declaration** — `@FormLayout(columns = 1)` or `@Section(columns = 1)`. In
   multi-column forms the label would eat too much of each field's width; and a form that is
   single-column only because it is small ([How many columns](#how-many-columns)) keeps labels on
   top, or every short form would flip to labels aside.
2. **Dense** — six fields or more; below that, top reads better and there is space to spare.
3. **Short-labelled** — no label longer than ~20 characters (the aside column is 10rem).
4. **Single-line widgets** — no `textarea`/rich text, collections, nested forms or component
   fields, which need the field's full width.

If any rule fails, the whole form keeps labels on top (consistency beats mixing modes). In doubt,
the answer is always top — also the Redwood form convention.

Force the mode explicitly with `@FormLayout(labelsAside = …)` on the view class:

```java
@UI("/customer-editor")
@FormLayout(columns = 1, labelsAside = LabelsAsideMode.ASIDE)
public class CustomerEditor { /* … */ }
```

`LabelsAsideMode` is `AUTO` (default, infer), `ASIDE` (force aside) and `TOP` (force top). The
explicit value always wins over the inference.
