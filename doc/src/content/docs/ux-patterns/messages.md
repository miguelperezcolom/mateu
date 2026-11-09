---
title: Messages
description: Tell the user what happened — with a severity, how long it stays, what they can do about it, and a key so the same message never stacks.
---

**Status:** ✅ Implemented — `Message`; persistence, actions and keys are 🧪 `@Experimental` (3.0)

## Intent

After an action the user needs to know what happened, sometimes act on it ("Undo", "View",
"Retry"), and sometimes find it again later. A message says **what** it is; each renderer decides
**how** to show it on its platform — a toast on the web, a JET notification on Redwood, a snackbar
on the phone, a balloon in IntelliJ.

## Solution

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

Return a `Message` from an action (alone, or in a list with the new state and commands):

```java
@Button
public Message save() {
    var order = orders.save(this);
    return Message.success("Order saved")
            .withAction(MessageAction.open("View", "/orders/" + order.id()))
            .withAction(MessageAction.run("Share", "share", Map.of("id", order.id())))
            .withPersistence(MessagePersistence.inbox)
            .withKey("order-" + order.id());
}
```

| Dimension | Values | Meaning |
|---|---|---|
| `variant` | success, info, warning, error, contrast, primary | The severity |
| `persistence` | `toast`, `sticky`, `inbox` | Goes away on its own · stays until dismissed · a toast that also lands in the [inbox](/ux-patterns/notification-inbox/) |
| `actions` | `MessageAction.run(label, actionId[, parameters])`, `MessageAction.open(label, route)`, `.withStyle(primary/secondary/danger/undo)` | What the user can do; an action runs on the component that ran the action |
| `key` | any string | A message with the same key replaces the one on screen (and the inbox entry) instead of stacking |
| `position` | topEnd, bottomStretch… | A hint for the web renderers only; the others ignore it |

An **error is sticky** unless it says otherwise: read in three seconds and gone, the user often
never saw why the save failed. Everything else is a toast. [Undo](/ux-patterns/undo/) is one of the
actions (style `undo`, labelled by the renderer's own "Undo" when unlabelled) — `Message.undoable`
fills both the action and the older `undo*` fields.

## Wire

`MessageDto {variant, position, title, text, duration, persistence, actions: [{label, actionId,
parameters, route, style}], key}` plus the legacy `undoLabel/undoActionId/undoParameters`. The
.NET and Python servers send the same.

## Related

- [Notification inbox](/ux-patterns/notification-inbox/) — messages that must survive the moment
- [Long-running jobs](/ux-patterns/long-running-jobs/) — tasks, with their own progress and result
- [Undo](/ux-patterns/undo/)
