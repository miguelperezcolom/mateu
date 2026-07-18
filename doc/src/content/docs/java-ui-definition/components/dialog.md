---
title: "Dialog"
---

A modal overlay panel. Can contain any component as its header, body, and footer.

## Basic usage

```java
Dialog.builder()
    .headerTitle("Information")
    .content(new Text("This action cannot be undone."))
    .closeButtonOnHeader(true)
    .build()
```

## Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `headerTitle` | String | — | Text shown in the dialog header bar |
| `header` | `Component` | — | Custom header component (replaces `headerTitle`) |
| `content` | `Component` | — | Main body content |
| `footer` | `Component` | — | Footer content (typically buttons) |
| `noPadding` | boolean | false | Removes the default content padding |
| `modeless` | boolean | false | Allows interaction with the page behind the dialog |
| `top` | String | — | CSS top position (for positioned dialogs) |
| `left` | String | — | CSS left position |
| `draggable` | boolean | false | Lets users drag the dialog |
| `width` | String | — | CSS width |
| `height` | String | — | CSS height |
| `resizable` | boolean | false | Lets users resize the dialog |
| `closeButtonOnHeader` | boolean | false | Adds an × close button to the header |
| `style` | String | — | Inline CSS |
| `cssClasses` | String | — | CSS class names |

## Dialog with form

```java
Dialog.builder()
    .headerTitle("Edit user")
    .content(FormLayout.builder()
        .content(List.of(
            FormField.builder().id("name").label("Name").dataType(FieldDataType.string).build(),
            FormField.builder().id("email").label("Email").dataType(FieldDataType.string).build()
        ))
        .build())
    .footer(new HorizontalLayout(
        Button.builder().label("Save").actionId("save_user").build(),
        Button.builder().label("Cancel").actionId("cancel").build()
    ))
    .closeButtonOnHeader(true)
    .width("500px")
    .build()
```

## Draggable dialog

```java
Dialog.builder()
    .headerTitle("Floating panel")
    .content(new Text("Drag me around"))
    .draggable(true)
    .top("100px")
    .left("200px")
    .build()
```

## Resizable dialog

```java
Dialog.builder()
    .headerTitle("Resizable")
    .content(detailContent)
    .resizable(true)
    .width("600px")
    .height("400px")
    .build()
```

## Tip

For simple yes/no confirmations use [ConfirmDialog](./confirm-dialog/) instead, which wires the confirm/cancel buttons automatically.
