---
title: "Rules"
---

Rules define reactive browser-side behavior that runs automatically when form state changes.

Implement `RuleSupplier` and return a list of `Rule` objects from `rules()`. Mateu evaluates them in the browser whenever any field value changes.

---

## The pattern

```java
@Route(value = "/my-page", parentRoute = "")
public class MyPage implements ComponentTreeSupplier, RuleSupplier {

    @Override
    public Form component(HttpRequest httpRequest) { ... }

    @Override
    public List<Rule> rules() {
        return List.of(
            Rule.builder()
                    .filter("true")              // when to run
                    .action(RuleAction.SetDataValue)
                    .fieldName("myField")        // target component id
                    .fieldAttribute(RuleFieldAttribute.hidden)
                    .expression("!state.show")   // computed value
                    .result(RuleResult.Continue) // keep evaluating other rules
                    .build()
        );
    }
}
```

Each rule has:
- `filter` — a JS expression; the rule only runs if this evaluates to truthy
- `action` — what to do
- `fieldName` — the component(s) to target (comma-separated for multiple)
- `expression` or `value` — the new value to apply
- `result` — `Continue` (keep evaluating) or `Stop` (stop after this rule)

---

## Visibility rule

Show or hide a component based on state.

```java
Rule.builder()
        .filter("true")
        .action(RuleAction.SetDataValue)
        .fieldName("texto")
        .fieldAttribute(RuleFieldAttribute.hidden)
        .expression("state.hidden")   // true = hidden, false = visible
        .result(RuleResult.Continue)
        .build()
```

The target component needs an `id`:

```java
Text.builder()
        .id("texto")
        .text("Now you see me")
        .build()
```

---

## Enabled/disabled rule

Enable or disable a component based on state.

```java
Rule.builder()
        .filter("true")
        .action(RuleAction.SetDataValue)
        .fieldName("aButton,aField")        // multiple targets
        .fieldAttribute(RuleFieldAttribute.disabled)
        .expression("!state.enable")        // true = disabled
        .result(RuleResult.Continue)
        .build()
```

---

## Enable/disable from backend

Toggle enabled/disabled state from an action return value using `Data`:

```java
boolean buttonDisabled = false;
boolean fieldDisabled = false;

Form component = Form.builder()
        .content(List.of(
                new Button("A Button"),
                FormField.builder().id("aField")...build(),
                new Button("Toggle", () ->
                        new Data(
                                Map.of(
                                        "aButton.disabled", buttonDisabled = !buttonDisabled,
                                        "aField.disabled", fieldDisabled = !fieldDisabled
                                ),
                                this))
        ))
        .build();
```

`Data(Map, state)` updates specific component attributes directly without a `Rule`.

Similarly, use `"componentId.hidden"` to toggle visibility from the backend.

---

## Set style rule

Apply inline CSS to a component based on state.

```java
// When trigger is checked → blue border
Rule.builder()
        .filter("state.trigger")
        .action(RuleAction.SetStyle)
        .fieldName("text")
        .expression("border")          // CSS property name
        .value("3px solid blue")       // CSS value
        .result(RuleResult.Continue)
        .build(),

// When trigger is unchecked → red border
Rule.builder()
        .filter("!state.trigger")
        .action(RuleAction.SetStyle)
        .fieldName("text")
        .expression("border")
        .value("3px solid red")
        .result(RuleResult.Continue)
        .build()
```

---

## Set CSS class rule

Add or remove CSS classes based on state.

```java
Rule.builder()
        .filter("state.trigger")
        .action(RuleAction.SetCssClass)
        .fieldName("text")
        .value("red-theme")            // CSS class name
        .result(RuleResult.Continue)
        .build(),

Rule.builder()
        .filter("!state.trigger")
        .action(RuleAction.SetCssClass)
        .fieldName("text")
        .value("blue-theme")
        .result(RuleResult.Continue)
        .build()
```

---

## Set attribute value rule

Set any HTML attribute on a component.

```java
Rule.builder()
        .filter("state.trigger")
        .action(RuleAction.SetAttributeValue)
        .fieldAttribute(RuleFieldAttribute.style)
        .fieldName("text")
        .value("border: 3px solid blue;")
        .result(RuleResult.Continue)
        .build()
```

---

## Set data value rule

Write a computed value to the `data` context. Useful for derived values accessible via `${data.field}`.

```java
Rule.builder()
        .filter("true")
        .action(RuleAction.SetDataValue)
        .fieldAttribute(RuleFieldAttribute.none)
        .fieldName("calculated")
        .expression("state.trigger")    // compute from state
        .result(RuleResult.Continue)
        .build()
```

Read the value in a component:

```java
new Text("${JSON.stringify(data)}")
```

---

## Run action rule

Trigger a backend action automatically when a condition is met.

```java
Rule.builder()
        .filter("true")
        .action(RuleAction.RunAction)
        .actionId("action_id")
        .result(RuleResult.Continue)
        .build()
```

The page must also implement `ActionHandler` to handle `"action_id"`.

---

## Run JavaScript rule

Execute JavaScript in the browser when a condition is met.

```java
Rule.builder()
        .filter("true")
        .action(RuleAction.RunJS)
        .value("console.log('hola!', state, data, appState, appData);")
        .result(RuleResult.Continue)
        .build()
```

The JS runs with `state`, `data`, `appState`, and `appData` in scope.

---

## Rule actions summary

| `RuleAction` | Effect |
|---|---|
| `SetDataValue` | Set a field attribute (`hidden`, `disabled`) or data value |
| `SetStyle` | Set a CSS property on a component |
| `SetCssClass` | Set CSS classes on a component |
| `SetAttributeValue` | Set any HTML attribute on a component |
| `RunAction` | Trigger a declared action |
| `RunJS` | Run JavaScript in the browser |

## Field attribute targets

| `RuleFieldAttribute` | Controls |
|---|---|
| `hidden` | Visibility of the component |
| `disabled` | Enabled/disabled state |
| `style` | Inline CSS style string |
| `none` | Used when writing to data context |

---

## Next

- [Triggers](/java-user-manual/concepts/fluent-components/fluent-triggers/)
- [Validations](/java-user-manual/concepts/fluent-components/fluent-validations/)
- [Actions](/java-user-manual/concepts/fluent-components/fluent-actions/)
