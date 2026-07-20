---
title: "Forms"
---

Forms are generated from fields.

## Example

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

## Labels on top vs labels aside

By default every field label renders **on top** of its input. For dense backoffice data-entry
forms, Mateu can render labels **aside** (to the left of the input, in a fixed label column) —
the classic enterprise idiom: one compact row per field and a scannable label column, at the cost
of some horizontal room.

You never toggle it by hand unless you want to: Mateu **infers** the mode from the form's shape.
Labels render aside only when the form is *all* of this:

1. **Single-column** — in multi-column forms the label would eat too much of each field's width.
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
