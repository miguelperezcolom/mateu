---
title: "Validation annotations"
---

---

# @Validation

Declares a cross-field validation rule on a class. When the condition expression evaluates to `true` the validation fails and the message is shown on the specified field.

```java
@Repeatable(Validations.class)
@Retention(RetentionPolicy.RUNTIME)
public @interface Validation {
    String condition();
    String fieldId();
    String message();
}
```

## Attributes

| Attribute | Type | Description |
|---|---|---|
| `condition` | String | Expression that evaluates to `true` when the validation fails |
| `fieldId` | String | ID of the field that shows the error message |
| `message` | String | Error message displayed when validation fails |

## Usage

```java
@Validation(condition = "startDate > endDate", fieldId = "endDate", message = "End date must be after start date")
@Validation(condition = "amount <= 0", fieldId = "amount", message = "Amount must be positive")
public class BookingForm {
    LocalDate startDate;
    LocalDate endDate;
    double amount;
}
```

## Multiple validations

`@Validation` is repeatable — stack multiple annotations on the same class.

---

# @Rule

Applies a conditional UI rule that changes a field's attribute (visibility, value, enabled state) based on an expression.

```java
@Repeatable(Rules.class)
@Retention(RetentionPolicy.RUNTIME)
public @interface Rule {
    String filter();
    RuleAction action();
    String fieldName();
    RuleFieldAttribute fieldAttribute();
    String value();
    String expression();
    String actionId();
    RuleResult result();
}
```

## Attributes

| Attribute | Type | Description |
|---|---|---|
| `filter` | String | Condition expression that activates this rule |
| `action` | `RuleAction` | What to do when the condition is met |
| `fieldName` | String | The field to affect |
| `fieldAttribute` | `RuleFieldAttribute` | Which attribute to change (`visible`, `enabled`, `value`, etc.) |
| `value` | String | Static value to assign to the attribute |
| `expression` | String | Dynamic expression for the attribute value |
| `actionId` | String | Action to trigger when the rule fires |
| `result` | `RuleResult` | Expected result type |

## Usage

```java
@Rule(
    filter = "accountType == 'BUSINESS'",
    action = RuleAction.set,
    fieldName = "vatNumber",
    fieldAttribute = RuleFieldAttribute.visible,
    value = "true"
)
@Rule(
    filter = "accountType == 'PERSONAL'",
    action = RuleAction.set,
    fieldName = "vatNumber",
    fieldAttribute = RuleFieldAttribute.visible,
    value = "false"
)
public class AccountForm {
    String accountType;   // "PERSONAL" or "BUSINESS"
    String vatNumber;
    String name;
}
```

## Multiple rules

`@Rule` is repeatable — stack multiple rules on the same class.
