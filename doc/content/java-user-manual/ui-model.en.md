---
title: "UI model in Mateu"
weight: 5
---

# UI model in Mateu

Mateu does not build UIs the traditional way.

You don’t assemble components manually.

Instead, the UI emerges from:

- field types (inference)
- stereotypes (**rendering type**)
- layout annotations (structure)
- style (fine control)

---

## 1. Inference

Mateu infers UI controls from Java types.

- `String` → text field
- `enum` → combobox
- `boolean` → checkbox-like control

You usually don’t need to think about components.

---

## 2. Stereotypes = rendering type

Use `@Stereotype` to override rendering.

```java
@Stereotype(FieldStereotype.radio)
Status status;
```

In practical terms, a stereotype is the rendering type for a field.

You don’t choose low-level components — you express presentation intent.

---

## 3. Layout

Layout is also declarative.

- `@VerticalLayout` (default)
- `@HorizontalLayout`
- `@FormLayout`
- `@SplitLayout`
- `@Accordion`
- `@Tab`

Example:

```java
@FormLayout(columns = 2)
public class UserForm {
}
```

---

## 4. Style

Use `@Style` when you need full control.

```java
@Style("width: 100%;")
String description;
```

This maps directly to the HTML `style` attribute.

---

## Mental model

Mateu UI is:

> inferred → structured → refined

1. inference chooses defaults
2. layout organizes structure
3. stereotypes adjust rendering type
4. style fine-tunes appearance

---

## Summary

- no manual UI composition
- no component wiring
- no duplicated frontend

You define data and intent.  
Mateu renders the UI.
