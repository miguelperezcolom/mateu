---
title: "Field stereotypes"
weight: 6
---

# Field stereotypes

Mateu lets you control how fields are rendered through `@Stereotype`.

## Why this matters

A field is not only data.

It also has a presentation intent.

For example:

- a `String` might be rendered as regular text
- or as an email field
- or as a password field
- or as a textarea
- or as markdown
- or even as an image, color picker, slider, or rich text editor

`@Stereotype` lets you express that intent explicitly.

## The annotation

```java
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD})
public @interface Stereotype {

  FieldStereotype value();
}
```

## Example

```java
@Stereotype(FieldStereotype.email)
String email;

@Stereotype(FieldStereotype.password)
String password;

@Stereotype(FieldStereotype.textarea)
String description;

@Stereotype(FieldStereotype.checkbox)
List<String> permissions;
```

This keeps the UI definition declarative while still giving you control over how specific fields are presented.

## Available stereotypes

```java
public enum FieldStereotype {
  regular,
  radio,
  checkbox,
  textarea,
  toggle,
  combobox,
  select,
  email,
  password,
  richText,
  listBox,
  html,
  markdown,
  image,
  icon,
  link,
  money,
  grid,
  color,
  choice,
  popover,
  slider,
  button,
  stars
}
```

## Mental model

Use field types to express data.

Use stereotypes to express how that data should be presented.

## Example use cases

### Text-like fields

- `regular`
- `textarea`
- `email`
- `password`
- `richText`
- `markdown`
- `html`

### Choice and selection

- `radio`
- `checkbox`
- `toggle`
- `combobox`
- `select`
- `listBox`
- `choice`

### Visual and special-purpose fields

- `image`
- `icon`
- `link`
- `money`
- `color`
- `slider`
- `stars`
- `button`
- `popover`
- `grid`

## In practice

A stereotype does not replace your data model.

It complements it.

For example, a field may still be a `String`, but `@Stereotype(FieldStereotype.email)` tells Mateu to render it as an email-oriented field instead of a generic one.
