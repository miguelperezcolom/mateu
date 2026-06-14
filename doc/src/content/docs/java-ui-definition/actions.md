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

## ActionSupplier

**Interface** — `io.mateu.uidl.fluent.ActionSupplier`

When a ViewModel implements `ActionSupplier`, Mateu calls `actions()` to obtain the list of `Action` objects that define which named actions the component exposes. The default implementation returns a wildcard action (`id = "*"`), which means all actions are allowed.

```java
public interface ActionSupplier {
    default List<Action> actions(HttpRequest httpRequest) {
        return List.of(Action.builder().id("*").build());
    }
}
```

Use this to restrict or dynamically configure the set of actions available on a component — for example, to expose only certain actions depending on user role or entity state.

### Example

```java
@UI("/orders/{id}")
public class OrderForm implements ActionSupplier {

    public String status;

    @Override
    public List<Action> actions(HttpRequest httpRequest) {
        if ("draft".equals(status)) {
            return List.of(
                Action.builder().id("submit").build(),
                Action.builder().id("discard").build());
        }
        if ("pending".equals(status)) {
            return List.of(
                Action.builder().id("approve").build(),
                Action.builder().id("reject").build());
        }
        return List.of();
    }
}
```

> **Note:** `ActionSupplier` controls which actions are exposed at the component level. For hiding or disabling individual buttons in the UI, use `VisibilitySupplier` or `DisabledSupplier` instead.

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
