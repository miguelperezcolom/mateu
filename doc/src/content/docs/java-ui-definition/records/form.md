---
title: "Form"
---

The standard fluent content container. Use `Form` to wrap the content of a page — it provides a title, subtitle, header, footer, toolbar, and button areas alongside its main content list.

```java
@Builder
public record Form(
    String id,
    String title,
    String subtitle,
    boolean noHeader,
    Component avatar,
    List<Component> content,
    List<Component> header,
    List<Component> footer,
    List<UserTrigger> toolbar,
    List<UserTrigger> buttons,
    String style,
    String cssClasses)
    implements Component, ContentSupplier, PageMainContent { }
```

## Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `id` | String | — | Optional component ID |
| `title` | String | — | Page/section heading |
| `subtitle` | String | — | Subheading shown below the title |
| `noHeader` | boolean | `false` | Hides the title/subtitle header area |
| `avatar` | `Component` | — | Avatar component shown in the header |
| `content` | `List<Component>` | `[]` | Main body components |
| `header` | `List<Component>` | `[]` | Components placed above the content |
| `footer` | `List<Component>` | `[]` | Components placed below the content |
| `toolbar` | `List<UserTrigger>` | `[]` | Action buttons in the toolbar |
| `buttons` | `List<UserTrigger>` | `[]` | Action buttons at the bottom |
| `style` | String | — | Inline CSS |
| `cssClasses` | String | — | CSS class names |

## Basic usage

```java
return Form.builder()
    .title("Customer")
    .subtitle("Customer detail view")
    .contentItem(new Text("Name: John Doe"))
    .contentItem(new Text("Email: john@example.com"))
    .build();
```

## With toolbar actions

```java
return Form.builder()
    .title("Edit Customer")
    .contentItem(FormLayout.builder()
        .content(List.of(
            FormField.builder().id("name").label("Name").dataType(FieldDataType.string).build(),
            FormField.builder().id("email").label("Email").dataType(FieldDataType.email).build()
        ))
        .build())
    .toolbarItem(Action.builder().id("save").build())
    .toolbarItem(Action.builder().id("cancel").build())
    .build();
```

## With header and footer

```java
return Form.builder()
    .title("Report")
    .headerItem(new Text("Generated: " + LocalDate.now()))
    .contentItem(reportContent)
    .footerItem(new Text("Confidential — do not distribute"))
    .build();
```

## No header

```java
return Form.builder()
    .noHeader(true)
    .contentItem(content)
    .build();
```

## Notes

- `Form` is the most common return type of `ComponentTreeSupplier.component()`.
- The builder uses `@Singular` for list properties, so methods like `contentItem(...)`, `headerItem(...)`, `footerItem(...)`, `toolbarItem(...)`, and `buttons(...)` add a single item at a time.
