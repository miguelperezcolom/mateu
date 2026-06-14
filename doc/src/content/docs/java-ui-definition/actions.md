---
title: "Actions"
---

Actions represent user interactions.

## Example

```java
@Button
Runnable save = () -> {};
```

Mateu renders a button.

## Key idea

Methods = actions.

---

## ButtonsSupplier

**Interface** — `io.mateu.uidl.interfaces.ButtonsSupplier`

When a ViewModel implements `ButtonsSupplier`, Mateu calls `buttons()` to obtain the full list of page buttons. This completely replaces annotation-based button discovery (fields and methods annotated with `@Button`).

```java
public interface ButtonsSupplier {
    Collection<UserTrigger> buttons();
}
```

Use this when you need full programmatic control over which buttons are shown and how they are configured, including label, color, variant, icon, and shortcut.

### Example

```java
@UI("/orders/{id}")
public class OrderForm implements ButtonsSupplier {

    public String status;

    @Override
    public Collection<UserTrigger> buttons() {
        var buttons = new ArrayList<UserTrigger>();
        if ("draft".equals(status)) {
            buttons.add(Button.builder().label("Submit").actionId("submit")
                .color(ButtonColor.primary).build());
            buttons.add(Button.builder().label("Discard").actionId("discard").build());
        }
        if ("pending".equals(status)) {
            buttons.add(Button.builder().label("Approve").actionId("approve")
                .color(ButtonColor.success).build());
            buttons.add(Button.builder().label("Reject").actionId("reject")
                .color(ButtonColor.error).build());
        }
        return buttons;
    }

    public void submit() { ... }
    public void discard() { ... }
    public void approve() { ... }
    public void reject() { ... }
}
```

> **Note:** `ButtonsSupplier` takes full control of buttons. If you only need to hide or disable individual buttons dynamically, use `VisibilitySupplier` or `DisabledSupplier` instead — they work alongside annotation-based discovery.

---

## ToolbarSupplier

**Interface** — `io.mateu.uidl.interfaces.ToolbarSupplier`

When a ViewModel implements `ToolbarSupplier`, Mateu calls `toolbar()` to obtain the full list of toolbar items. This completely replaces annotation-based toolbar discovery (fields and methods annotated with `@Toolbar`).

```java
public interface ToolbarSupplier {
    Collection<UserTrigger> toolbar();
}
```

Same semantics as `ButtonsSupplier` but for the toolbar area of the page.
