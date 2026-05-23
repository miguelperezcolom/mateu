---
title: "Notification"
---

A toast-style notification that appears briefly to inform the user. Typically returned from an action handler rather than embedded statically.

## Basic usage

```java
new Notification("Operation completed successfully.")
```

## Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `title` | String | `""` | Bold heading line |
| `text` | String | — | Body text |
| `style` | String | `""` | Inline CSS |
| `cssClasses` | String | `""` | CSS class names |

## Constructors

```java
// text only
new Notification("Saved!")

// title + text
new Notification("Success", "Record has been saved.")

// builder
Notification.builder()
    .title("Error")
    .text("Could not connect to the server.")
    .build()
```

## Returning from an action

The most common pattern is to return a `Notification` from an action handler so it appears as a toast after the action completes:

```java
@Override
public Object handleAction(String actionId, HttpRequest request) {
    if ("save".equals(actionId)) {
        save(formData);
        return new Notification("Saved!", "Your changes have been stored.");
    }
    return new State(this);
}
```

## Embedded in a form

A `Notification` can also be placed statically inside a `Form`'s `header` to display a persistent message:

```java
Form.builder()
    .header(List.of(
        Notification.builder().title("Draft").text("This record has unsaved changes.").build()
    ))
    .content(formContent)
    .build()
```
