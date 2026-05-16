---
title: "Workflow and forms integration"
weight: 5
---

# Workflow and forms integration

Mateu acts as the UI layer for workflow and form-driven processes. The UI triggers workflow steps, collects user input, and displays progress — while the workflow engine handles orchestration.

---

## The pattern

```
User → Mateu UI → Workflow engine → Backend services
                ↑                          |
                └──── status updates ──────┘
```

The Mateu page:
1. Shows the current workflow state
2. Collects user input (a form)
3. Submits input to the workflow engine via an action
4. Displays the updated state or next step

---

## Starting a workflow

```java
@Route(value = "/orders/new", parentRoute = "")
public class CreateOrderPage implements ComponentTreeSupplier, ActionHandler {

    String customerId;
    String notes;

    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("New order")
                .toolbar(List.of(
                        Button.builder().label("Submit").actionId("submit").build()
                ))
                .content(List.of(
                        FormField.builder().id("customerId").label("Customer")
                                .dataType(FieldDataType.string)
                                .stereotype(FieldStereotype.combobox)
                                .build(),
                        FormField.builder().id("notes").label("Notes")
                                .dataType(FieldDataType.string)
                                .stereotype(FieldStereotype.textarea)
                                .build()
                ))
                .build();
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        customerId = httpRequest.getString("customerId");
        notes      = httpRequest.getString("notes");

        String workflowId = workflowEngine.start("create-order", Map.of(
                "customerId", customerId,
                "notes", notes
        ));

        return URI.create("/orders/" + workflowId);   // navigate to the workflow detail page
    }
}
```

---

## Displaying workflow state

```java
@Route(value = "/orders/:workflowId", parentRoute = "")
public class OrderWorkflowPage implements ComponentTreeSupplier, ActionHandler, TriggersSupplier {

    @Override
    public Form component(HttpRequest httpRequest) {
        String workflowId = httpRequest.getPathVariable("workflowId");
        var state = workflowEngine.getState(workflowId);

        return Form.builder()
                .title("Order " + workflowId)
                .content(List.of(
                        new Text("Status: " + state.currentStep()),
                        new ProgressBar.builder().value(state.progress()).build(),
                        // show step-specific form fields based on state.currentStep()
                ))
                .build();
    }

    @Override
    public List<Trigger> triggers(HttpRequest httpRequest) {
        return List.of(new OnLoadTrigger("refresh"));
    }
}
```

---

## Long-running steps with SSE

For steps that take time, stream progress updates using SSE:

```java
Action.builder()
        .id("process")
        .sse(true)
        .build()

@Override
public Object handleAction(String actionId, HttpRequest httpRequest) {
    return Flux
            .fromIterable(workflowEngine.executeSteps("order-processing"))
            .map(step -> new State(Map.of(
                    "currentStep", step.name(),
                    "progress", step.progressFraction()
            )));
}
```

Each emitted value updates the browser progressively. The user sees live progress without polling.

---

## Form-per-step

Complex workflows with multi-step forms can use a different page (or the same page rendering different content) for each step:

```java
@Override
public Form component(HttpRequest httpRequest) {
    String step = httpRequest.getPathVariable("step");
    return switch (step) {
        case "customer"  -> renderCustomerStep();
        case "items"     -> renderItemsStep();
        case "payment"   -> renderPaymentStep();
        case "confirm"   -> renderConfirmStep();
        default          -> renderCustomerStep();
    };
}
```

Each step returns the user's input to the next step's page via `URI.create("/order/new/" + nextStep)`.

---

## Next

- [Actions](/java-user-manual/concepts/fluent-components/fluent-actions/) — SSE, background, confirmation
- [Triggers](/java-user-manual/concepts/fluent-components/fluent-triggers/) — OnLoad, OnSuccess
- [UI effects](/java-user-manual/concepts/ui-effects/) — URI navigation, State, Message
