---
title: "Trigger Annotations"
description: "Annotations for defining reactive triggers that fire on UI events."
---

Triggers let a component react to lifecycle events — page load, field value changes, completed actions, custom browser events, and more — by automatically invoking a named action without the user clicking a button.

---

## @Trigger

Declares a single reactive trigger. Repeatable via the `@Triggers` container, so multiple triggers can be stacked on the same class or method.

```java
@Repeatable(Triggers.class)
@Retention(RetentionPolicy.RUNTIME)
public @interface Trigger {
    TriggerType type();
    String actionId();
    int timeoutMillis() default 0;
    int times() default 1;
    String condition() default "";
    String calledActionId() default "";
    String propertyName() default "";
    String eventName() default "";
}
```

### Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `type` | `TriggerType` | — | The event that fires this trigger (required). |
| `actionId` | `String` | — | ID of the action to execute when the trigger fires (required). |
| `timeoutMillis` | `int` | `0` | Delay in milliseconds before the action is invoked. |
| `times` | `int` | `1` | How many times the trigger may fire. `0` means unlimited. |
| `condition` | `String` | `""` | Expression that must evaluate to `true` for the trigger to fire. |
| `calledActionId` | `String` | `""` | For `OnSuccess` / `OnError` — the preceding action whose completion fires this trigger. |
| `propertyName` | `String` | `""` | For `OnValueChange` — the field name to watch. |
| `eventName` | `String` | `""` | For `OnCustomEvent` — the name of the browser custom event to listen for. |

---

## TriggerType

| Value | When it fires |
|---|---|
| `OnLoad` | Once when the component is first rendered. |
| `OnSuccess` | After the action identified by `calledActionId` completes successfully. |
| `OnError` | After the action identified by `calledActionId` fails. |
| `OnValueChange` | When the value of the field named `propertyName` changes. |
| `OnCustomEvent` | When a browser custom event named `eventName` is dispatched. |
| `OnEnter` | When the user presses Enter inside an input field. |

---

## @Triggers

Container annotation that holds multiple `@Trigger` declarations on the same element. You do not normally need to write `@Triggers` by hand — the Java compiler generates it automatically when you stack two or more `@Trigger` annotations.

```java
@Retention(RetentionPolicy.RUNTIME)
public @interface Triggers {
    Trigger[] value();
}
```

---

## When to use triggers vs. plain action methods

| Situation | Use |
|---|---|
| The user clicks a button to invoke logic | An action method (`@Button`, `@Toolbar`, `@Action`, etc.) |
| Logic must run as soon as the page loads | `@Trigger(type = TriggerType.OnLoad, actionId = "...")` |
| One field update must reload another field's options | `@Trigger(type = TriggerType.OnValueChange, ...)` |
| An action must chain automatically after another succeeds | `@Trigger(type = TriggerType.OnSuccess, calledActionId = "...")` |
| A third-party widget fires a custom browser event | `@Trigger(type = TriggerType.OnCustomEvent, eventName = "...")` |

Triggers are declared on the **class** (not on the action method itself), which keeps reactive wiring at the top of the file and keeps action methods focused on logic.

---

## Examples

### Auto-search on load

The listing fires the built-in `search` action as soon as it renders, so the table is populated without the user pressing a search button.

```java
// Changes.java
@Title("Changes")
@Service
@Scope("prototype")
@Trigger(type = TriggerType.OnLoad, actionId = "search")
public class Changes extends Listing<NoFilters, ChangeRow> {

    @Override
    public ListingData<ChangeRow> search(
            String searchText, NoFilters filters, Pageable pageable, HttpRequest httpRequest) {
        // ...
    }
}
```

### React to a field value change

```java
@Trigger(
    type = TriggerType.OnValueChange,
    propertyName = "country",
    actionId = "reloadRegions"
)
public class AddressForm {
    String country;
    String region;

    Object reloadRegions() {
        // reload region options based on the current value of `country`
        return this;
    }
}
```

### Chain after a successful action

```java
@Trigger(
    type = TriggerType.OnSuccess,
    calledActionId = "save",
    actionId = "sendConfirmation"
)
public class OrderForm {

    @Toolbar
    @Action(validationRequired = true)
    void save() { /* persist */ }

    void sendConfirmation() { /* send email */ }
}
```

### Multiple triggers on one class

Stack `@Trigger` annotations directly — the `@Triggers` container is implicit.

```java
@Trigger(type = TriggerType.OnLoad, actionId = "loadDefaults")
@Trigger(type = TriggerType.OnValueChange, propertyName = "planType", actionId = "recalcPrice")
public class PricingForm {
    String planType;
    double price;

    void loadDefaults() { planType = "standard"; }
    Object recalcPrice() { price = pricingService.calc(planType); return this; }
}
```

### Delayed polling with a timeout

```java
@Trigger(type = TriggerType.OnLoad, actionId = "pollStatus", timeoutMillis = 3000, times = 0)
public class JobStatusPage {
    String status;

    Object pollStatus() {
        status = jobService.getStatus(jobId);
        return this;
    }
}
```

`times = 0` means the trigger fires indefinitely every `timeoutMillis` milliseconds until the user navigates away.
