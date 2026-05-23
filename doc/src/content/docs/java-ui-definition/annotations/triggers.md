---
title: "@Trigger"
---

Declares a lifecycle trigger that fires an action automatically in response to a specific event (page load, value change, action completion, etc.).

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

## Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `type` | `TriggerType` | — | When the trigger fires |
| `actionId` | String | — | ID of the action to execute |
| `timeoutMillis` | int | `0` | Delay in milliseconds before firing |
| `times` | int | `1` | Number of times to fire (0 = unlimited) |
| `condition` | String | `""` | Expression that must be true for the trigger to fire |
| `calledActionId` | String | `""` | ID of a preceding action that must have been called |
| `propertyName` | String | `""` | Field name to watch (used with `ON_VALUE_CHANGE`) |
| `eventName` | String | `""` | Custom event name (used with `ON_CUSTOM_EVENT`) |

## TriggerType values

| Value | When it fires |
|---|---|
| `ON_LOAD` | When the page or component is first loaded |
| `ON_VALUE_CHANGE` | When the value of `propertyName` changes |
| `ON_ACTION_SUCCESS` | After `calledActionId` completes successfully |
| `ON_ACTION_ERROR` | After `calledActionId` fails |
| `ON_ENTER` | When the user presses Enter in a field |
| `ON_CUSTOM_EVENT` | When a custom browser event named `eventName` fires |

## Usage

### Auto-load on page open

```java
@Trigger(type = TriggerType.ON_LOAD, actionId = "loadData")
public class DashboardPage implements ActionHandler {
    Component stats;

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        if ("loadData".equals(actionId)) {
            // populate stats
        }
        return null;
    }
}
```

### React to a field value change

```java
@Trigger(
    type = TriggerType.ON_VALUE_CHANGE,
    propertyName = "country",
    actionId = "loadRegions"
)
public class AddressForm implements ActionHandler {
    String country;
    String region;

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        if ("loadRegions".equals(actionId)) {
            // reload region options based on country
        }
        return null;
    }
}
```

### Run after another action succeeds

```java
@Trigger(
    type = TriggerType.ON_ACTION_SUCCESS,
    calledActionId = "save",
    actionId = "sendConfirmationEmail"
)
public class OrderForm implements ActionHandler { ... }
```

## Repeatable

`@Trigger` is repeatable — stack multiple triggers on the same class.
