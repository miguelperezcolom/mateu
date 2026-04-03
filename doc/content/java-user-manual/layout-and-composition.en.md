---
title: "Layout and composition"
weight: 8
---

# Layout and composition

Mateu organizes UI declaratively using layouts and regions.

---

## Layouts

Layout defines how elements are arranged:

- `@VerticalLayout` (default)
- `@HorizontalLayout`
- `@FormLayout`
- `@SplitLayout`
- `@Accordion`
- `@Tab`

Example:

```java
@FormLayout(columns = 2)
public class UserForm {}
```

---

## Page regions

In addition to layout, Mateu supports **UI regions**.

These are predefined areas of the page where content can be projected.

---

## Footer

Use `@Footer` to define content that appears in the page footer.

```java
public class UserDetail {

    @Footer
    String footer = "You could also be interested in " +
        "<a href=\"/roles\">Roles</a>, " +
        "<a href=\"/permissions\">Permissions</a> " +
        "or <a href=\"/user-groups\">User Groups</a>";

    @Footer
    String alsoInFooter = "Copyright - Mateu 2026";
}
```

---

## Key ideas

- footer content is part of the ViewModel  
- multiple `@Footer` fields are supported  
- content is rendered in a dedicated footer region  
- HTML can be used when needed  

---

## Mental model

Footer is not a separate layout system.

It is:

> another projection of your model into a specific UI region

---

## Summary

- layout → structure  
- regions → placement  
- model → source of truth  

Mateu combines all three to generate the UI.
