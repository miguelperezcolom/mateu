---
title: "RuleSupplier and ValidationSupplier"
description: "Programmatic control of client-side conditional rules and field validations."
---

These interfaces let a ViewModel provide conditional UI rules and cross-field validations programmatically, as an alternative to using the `@Rule` annotation or bean validation constraints.

---

## RuleSupplier

**Interface** — `io.mateu.uidl.interfaces.RuleSupplier`

When a ViewModel implements `RuleSupplier`, Mateu merges the returned rules with any annotation-defined rules before sending them to the client. Rules are evaluated client-side: when the `filter` expression is truthy, the `action` is executed against the target field or action.

```java
public interface RuleSupplier {
    List<Rule> rules();
}
```

### Rule fields

| Field | Type | Description |
|---|---|---|
| `filter` | `String` | Client-side JS expression; rule fires when this evaluates to truthy |
| `action` | `RuleAction` | What to do when the rule fires |
| `fieldName` | `String` | Target field name |
| `fieldAttribute` | `RuleFieldAttribute` | Which attribute of the field to modify |
| `value` | `Object` | Static value to set |
| `expression` | `String` | Client-side JS expression whose result is set as the value |
| `actionId` | `String` | Target action id (for `RunAction`) |
| `result` | `RuleResult` | `Continue` to keep evaluating rules, `Stop` to halt |

### RuleAction values

| Value | Description |
|---|---|
| `SetDataValue` | Sets a field attribute (hidden, disabled, required, style, …) |
| `SetStateValue` | Sets a field value in the component state |
| `SetAppStateValue` | Sets a value in the application-level state |
| `SetAppDataValue` | Sets a data value at application level |
| `RunAction` | Triggers a named action |
| `RunJS` | Executes arbitrary JavaScript |
| `SetAttributeValue` | Sets an HTML attribute on the field element |
| `SetCssClass` | Adds or removes a CSS class |
| `SetStyle` | Sets an inline CSS style |

### RuleFieldAttribute values

`required`, `disabled`, `hidden`, `pattern`, `minValue`, `maxValue`, `minLength`, `maxLength`, `css`, `style`, `theme`, `errorMessage`, `description`

### Example

```java
@UI("/orders/{id}")
public class OrderForm implements RuleSupplier {

    public String status;
    public double discount;

    @Override
    public List<Rule> rules() {
        return List.of(
            Rule.builder()
                .filter("state.status === 'closed'")
                .action(RuleAction.SetDataValue)
                .fieldName("discount")
                .fieldAttribute(RuleFieldAttribute.disabled)
                .expression("true")
                .result(RuleResult.Continue)
                .build(),
            Rule.builder()
                .filter("state.discount > 50")
                .action(RuleAction.SetDataValue)
                .fieldName("discount")
                .fieldAttribute(RuleFieldAttribute.errorMessage)
                .value("Discount cannot exceed 50%")
                .result(RuleResult.Continue)
                .build());
    }
}
```

> **Note:** `RuleSupplier` is evaluated once on the server and the rules are sent to the client for repeated evaluation. For purely server-side visibility/disabled control, use `VisibilitySupplier` or `DisabledSupplier` instead — they remove or disable fields at render time without sending client expressions.

---

## ValidationSupplier

**Interface** — `io.mateu.uidl.interfaces.ValidationSupplier`

When a ViewModel implements `ValidationSupplier`, Mateu merges the returned validations with any bean-validation constraints before processing a form submission. Validations are evaluated server-side when an action is triggered.

```java
public interface ValidationSupplier {
    List<Validation> validations();
}
```

### Validation fields

| Field | Type | Description |
|---|---|---|
| `condition` | `String` | Server-side SpEL expression; validation fails when this evaluates to `true` |
| `fieldId` | `String` | The field to highlight when the validation fails |
| `message` | `String` | Error message shown to the user |

### Example

```java
@UI("/orders/{id}")
public class OrderForm implements ValidationSupplier {

    public LocalDate startDate;
    public LocalDate endDate;
    public double discount;

    @Override
    public List<Validation> validations() {
        return List.of(
            Validation.builder()
                .condition("endDate != null && startDate != null && endDate.isBefore(startDate)")
                .fieldId("endDate")
                .message("End date must be after start date")
                .build(),
            Validation.builder()
                .condition("discount < 0 || discount > 100")
                .fieldId("discount")
                .message("Discount must be between 0 and 100")
                .build());
    }
}
```
