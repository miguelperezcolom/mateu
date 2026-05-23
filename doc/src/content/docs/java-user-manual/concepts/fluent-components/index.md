---
title: "Fluent components"
---

The fluent API lets you build UI programmatically — composing components in code using builders and Java objects instead of relying only on annotations and field declarations.

---

## When to use the fluent API

Use the fluent API when:

- you need dynamic layout or content based on runtime state
- you want to compose complex UIs that annotations alone cannot express
- you are building reusable component classes
- you need fine-grained control over component properties

The declarative (annotation-based) and fluent approaches are **composable** — you can mix them freely.

---

## The core pattern

A fluent page implements `ComponentTreeSupplier` and returns a `Form` (or any `Component`) from its `component()` method:

```java
@Route(value = "/my-page", parentRoute = "")
public class MyPage implements ComponentTreeSupplier {

    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("My page")
                .content(List.of(
                        new Text("Hello world")
                ))
                .build();
    }
}
```

---

## Key interfaces

| Interface | Purpose |
|---|---|
| `ComponentTreeSupplier` | Provides the component tree — implement `component()` |
| `ActionHandler` | Handles action calls — implement `handleAction()` |
| `ActionSupplier` | Declares available actions — implement `actions()` |
| `RuleSupplier` | Declares client-side rules — implement `rules()` |
| `ValidationSupplier` | Declares validations — implement `validations()` |
| `TriggersSupplier` | Declares triggers — implement `triggers()` |
| `ListingBackend` | Powers a data listing — implement `search()` |
| `AppSupplier` | Defines a nested app with its own navigation — implement `getApp()` |

A class can implement as many of these as needed.

---

## Reading order

If you are new to the fluent API, start with [Fluent API basics](/java-user-manual/concepts/fluent-components/fluent-api-basics/), then follow the topics in order: layouts and form fields for structure, actions and triggers for behavior, then listings and nested apps for larger screens.

---

## Topics

### Core

- [Fluent API basics](/java-user-manual/concepts/fluent-components/fluent-api-basics/) — ComponentTreeSupplier, Form, state management (6 counter patterns)
- [Layouts](/java-user-manual/concepts/fluent-components/fluent-layouts/) — HorizontalLayout, VerticalLayout, TabLayout, AccordionLayout, SplitLayout, BoardLayout
- [Form fields](/java-user-manual/concepts/fluent-components/fluent-form-fields/) — FormField, FieldDataType, FieldStereotype

### Behavior

- [Actions](/java-user-manual/concepts/fluent-components/fluent-actions/) — foreground, background, SSE, confirmation, href, JS, custom events
- [Rules](/java-user-manual/concepts/fluent-components/fluent-rules/) — visibility, enabled, style, CSS class, data value, run action, run JS
- [Triggers](/java-user-manual/concepts/fluent-components/fluent-triggers/) — OnLoad, OnValueChange, OnSuccess, OnError, OnCustomEvent
- [Validations](/java-user-manual/concepts/fluent-components/fluent-validations/) — required, conditional, form-wise, min/max, pattern, server-side

### Data and state

- [Data contexts](/java-user-manual/concepts/fluent-components/fluent-data-contexts/) — state, data, appState, appData
- [Using state in fluent components](/java-user-manual/concepts/fluent-components/fluent-components-state/)

### Advanced UI

- [Commands and messages](/java-user-manual/concepts/fluent-components/fluent-commands/) — CloseModal, SetWindowTitle, SetFavicon, RunAction, Dialog
- [Listings](/java-user-manual/concepts/fluent-components/fluent-listings/) — Listing.builder(), columns, filters, sorting, row actions
- [Nested apps](/java-user-manual/concepts/fluent-components/fluent-nested-apps/) — AppSupplier, AppVariant, menu on left/top/tabs
- [Display components](/java-user-manual/concepts/fluent-components/fluent-display-components/) — Badge, Card, Chart, Grid, Map, Dialog, Avatar, Status, Amount

---

## Next

- [Fluent API basics](/java-user-manual/concepts/fluent-components/fluent-api-basics/)
- [Use cases](/java-user-manual/use-cases/)
- [Build guides](/java-user-manual/build/)
