---
title: Task-Centric Page
description: A screen designed around a task, not an entity.
---

**Status:** Composition — no new primitive needed

## Intent

A screen designed around a task, not an entity.

## Problem

"Edit order" forces the user to know which fields to touch and in what order. "Confirm shipment" presents exactly what is needed for that specific job. The former exposes everything; the latter exposes only what the task requires.

## The distinction

| Entity-centric | Task-centric |
|---|---|
| Shows all fields of the entity | Shows only fields relevant to this task |
| Generic "Save" action | Named action that completes the work |
| User decides what to change | Screen guides the user to the outcome |
| One screen for all operations | One screen per distinct workflow step |

## Solution

Define a view class that exposes only the fields relevant to the task, plus the actions that complete it. There is no new annotation — this is the **Workflow over screens** principle applied at design time.

```java
// Entity-centric (avoid for complex tasks)
@UI("/orders/{id}/edit")
public class EditOrder {
    private String ref;
    private LocalDate date;
    private String customerId;
    private List<OrderLine> lines;
    private String notes;
    private String internalCode;
    // ... many more fields
    public void save() { ... }
}

// Task-centric (preferred)
@UI("/orders/{id}/confirm-shipment")
public class ConfirmShipment {
    private LocalDate shippedDate;
    private String trackingNumber;
    private ShippingCarrier carrier;

    @MainAction
    @Action(validationRequired = true)
    public ConfirmationReceipt confirm() { ... }

    @Action(confirmationRequired = true)
    public OrderDetail cancel() { ... }
}
```

Destructive or irreversible actions carry `@Action(confirmationRequired = true)`.

## Structure

```
Confirm shipment — Order #4521

  Shipped date    [2024-03-15]
  Carrier         [DHL      ▼]
  Tracking        [1Z999AA10123456784]

                 [Cancel]  [Confirm shipment →]
```

## Principles served

- **Workflow over screens** — the screen exists to complete a job
- **Progressive complexity** — irrelevant fields stay hidden
- **Recoverability** — confirmation gate on destructive paths
