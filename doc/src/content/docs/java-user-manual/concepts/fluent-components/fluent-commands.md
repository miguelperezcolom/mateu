---
title: "Commands and messages"
---

In addition to returning `State` or `Data`, actions can return `UICommand` objects to trigger browser-level behavior — closing dialogs, setting the window title, changing the favicon, or chaining actions.

---

## Message (toast notification)

Return a `Message` to show a toast notification in the browser:

```java
@Override
public Object handleAction(String actionId, HttpRequest httpRequest) {
    return Message.builder().text("Operation successful!").build();
}
```

See [UI effects](/java-user-manual/concepts/ui-effects/) for full `Message` options (variant, position, title, duration).

---

## Dialogs

Return a `Dialog` to open a modal:

```java
@Override
public Object handleAction(String actionId, HttpRequest httpRequest) {
    if ("open-dialog".equals(actionId)) {
        return Dialog.builder()
                .closeButtonOnHeader(true)
                .content(Form.builder()
                        .title("Dialog form")
                        .content(List.of(
                                Button.builder()
                                        .label("Close dialog")
                                        .actionId("close-dialog")
                                        .build()
                        ))
                        .build())
                .build();
    }
    return null;
}
```

The `Dialog` wraps any component as its content. Set `closeButtonOnHeader(true)` to show an X button.

---

## Close dialog

Return `UICommand` with type `CloseModal` to close the currently open dialog:

```java
if ("close-dialog".equals(actionId)) {
    return UICommand.builder().type(UICommandType.CloseModal).build();
}
```

This is typically used by a button inside the dialog itself.

```java
// Full open-and-close-dialog example
@Override
public Object handleAction(String actionId, HttpRequest httpRequest) {
    if ("open-dialog".equals(actionId)) {
        return Dialog.builder()
                .closeButtonOnHeader(true)
                .content(Form.builder()
                        .title("Confirm")
                        .content(List.of(
                                Button.builder()
                                        .label("Close")
                                        .actionId("close-dialog")
                                        .build()
                        ))
                        .build())
                .build();
    }
    if ("close-dialog".equals(actionId)) {
        return UICommand.builder().type(UICommandType.CloseModal).build();
    }
    return null;
}
```

---

## Set window title

Change the browser tab/window title:

```java
if ("setWindowTitle".equals(actionId)) {
    String title = httpRequest.getString("title");
    return UICommand.builder()
            .type(UICommandType.SetWindowTitle)
            .data(title)
            .build();
}
```

The `data` field carries the new title string.

---

## Set favicon

Change the browser favicon:

```java
if ("setFavicon".equals(actionId)) {
    String iconUrl = httpRequest.getString("favIcon");
    return UICommand.builder()
            .type(UICommandType.SetFavicon)
            .data(iconUrl)
            .build();
}
```

`data` is the URL or path to the icon file.

---

## Run action

Chain to another action without user interaction:

```java
// Returning this command immediately triggers "action-2"
return UICommand.runAction("action-2");
```

The shorthand `UICommand.runAction(actionId)` is equivalent to:

```java
UICommand.builder().type(UICommandType.RunAction).data("action-2").build()
```

Use for: redirect after save, auto-refresh after a background operation.

```java
@Override
public Object handleAction(String actionId, HttpRequest httpRequest) {
    if ("action-2".equals(actionId)) {
        return Message.builder().text("action-2 ran").build();
    }
    // Any other action chains to action-2
    return UICommand.runAction("action-2");
}
```

---

## Navigate

Navigate the browser to a route:

```java
return UICommand.navigateTo("/dashboard");
```

Or using `URI`:

```java
return URI.create("/dashboard");
```

Both navigate the user to the given path.

---

## UICommand summary

| `UICommandType` | Effect | `data` field |
|---|---|---|
| `CloseModal` | Close the current open dialog | — |
| `SetWindowTitle` | Set the browser tab title | New title string |
| `SetFavicon` | Change the browser favicon | Favicon URL |
| `RunAction` | Trigger another action | Target actionId |

---

## Next

- [Data contexts](/java-user-manual/concepts/fluent-components/fluent-data-contexts/)
- [Listings](/java-user-manual/concepts/fluent-components/fluent-listings/)
- [UI effects](/java-user-manual/concepts/ui-effects/)
