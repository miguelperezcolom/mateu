---
title: "End-to-end example"
weight: 18
---

# End-to-end example

This example shows how several Mateu concepts fit together in one screen.

```java
@UI("/users")
@Title("Users")
public class UsersPage {

  @Tab("General")
  @NotEmpty
  String name;

  @Tab("Security")
  @ForeignKey(search = PermissionIdOptionsSupplier.class, label = PermissionIdLabelSupplier.class)
  @Stereotype(FieldStereotype.checkbox)
  List<String> permissions;

  @Action(
    id = "save",
    validationRequired = true,
    confirmationRequired = true,
    confirmationTitle = "Save user",
    confirmationMessage = "Do you want to save these changes?"
  )
  @Button
  public Message save() {
    return new Message("Saved successfully");
  }

}
```

## What this one example contains

- routing with `@UI`
- page metadata with `@Title`
- tabs with `@Tab`
- validation with `@NotEmpty`
- relationships with `@ForeignKey`
- rendering intent with `@Stereotype`
- action behavior with `@Action`
- browser feedback with `Message`

## Why this matters

This is the core promise of Mateu:

one screen, one model, one place to define the behavior.
