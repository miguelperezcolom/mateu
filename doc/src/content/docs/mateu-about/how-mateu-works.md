---
title: "How Mateu works"
description: "The mental model, building blocks, and stateless cycle behind Mateu UIs."
---

The shift Mateu requires is not technical — it is conceptual. You are not building screens. You are defining a model that becomes a UI.

## Three concepts

Everything in Mateu maps to three things:

**State** — the fields that describe the current situation.

**Actions** — the methods that change it.

**Structure** — annotations that control layout, routing, navigation, and rendering behavior.

```java
public class OrderEditor {

    // state
    String orderId;
    OrderStatus status;
    List<OrderLine> lines;

    // action
    @Button
    public Message confirm() {
        confirmOrderUseCase.handle(new ConfirmOrderCommand(orderId));
        return new Message("Order confirmed");
    }
}
```

That class is a complete UI definition. Mateu produces the form, the button, the validation, and the browser feedback from it.

## From definition to UI

Mateu works in three steps:

```text
ViewModel (Java class)
  -> UI definition (Mateu internal representation)
  -> rendered UI (browser)
```

You only write the ViewModel. Mateu introspects its fields, methods, and annotations to produce a UI description. The renderer turns that description into a working browser interface.

## Stop thinking in pages

Traditional frontend development starts with a page. You design the page, then you wire it to the backend.

In Mateu, you start with the model. The page is a consequence of the model, not the starting point.

When you need a product management screen, do not ask "what does this screen look like?" Ask "what is the state of a product, and what can you do with it?"

```java
public record Product(
    String id,
    String name,
    BigDecimal price,
    ProductStatus status
) implements Identifiable {}
```

That question — answered in Java — is the UI definition.

## Building blocks

### Routing

`@UI` registers a class as a UI root at a given path. Mateu wires the routing automatically.

```java
@UI("/products")
public class ProductsRoot { ... }
```

### State — field types

Fields on a ViewModel class become form fields. Their Java type determines the input:

| Java type | Default input |
|---|---|
| `String` | text field |
| `int` / `Integer` | number field |
| `boolean` / `Boolean` | checkbox |
| `LocalDate` | date picker |
| `LocalDateTime` | date-time picker |
| `enum` | select / dropdown |
| `List<T>` | grid or checkbox group |

Override the default with `@Stereotype`.

### Actions

Any method annotated with `@Button` becomes a clickable action. Returning a `Message` sends a browser notification. Returning any Java object navigates to it as a new view.

```java
@Button
public Message submit() {
    saveOrderUseCase.handle(command);
    return new Message("Saved");
}
```

Actions belong to the backend. The button in the browser is just a signal — the backend decides what it means.

### Validation

Mateu uses Bean Validation. Constraints are enforced in the browser before the action fires, and again on the backend.

```java
@NotEmpty String name;
@Min(1) int quantity;
@Email String contactEmail;
```

### Layout

A few annotations control how fields are arranged:

- `@Section("Shipping")` — groups fields under a heading
- `@Colspan(2)` — makes a field span two columns
- `@Zones` / `@Zone` — side-by-side column layout
- `@Tabs` / `@Accordion` — tabbed or collapsible groupings

### Navigation

`@Menu` exposes a field or nested class as a navigation entry. Nesting `@Menu` fields produces a tree.

```java
@UI("/admin")
public class AdminRoot {
    @Menu OrdersMenu orders;
    @Menu ProductsMenu products;
}
```

### Relationships

`@Lookup` resolves foreign keys through backend suppliers — plain Java classes that can call any query service or repository.

```java
@Lookup(search = ProductOptionsSupplier.class, label = ProductLabelSupplier.class)
String productId;
```

The browser does not know how to resolve the relationship. It asks the backend. The backend returns options. The browser displays them.

### AutoCrud and Crud

For standard business entities, `AutoCrud` gives you a full CRUD flow from a single class:

```java
@UI("/orders")
public class Orders extends AutoCrud<Order> {}
```

When you need explicit control, `Crud` lets you define each screen separately:

```java
public class OrdersOrchestrator extends Crud<
    OrderView, OrderEditor, OrderCreationForm,
    OrderFilters, OrderRow, String> { ... }
```

## The stateless cycle

Mateu does not store UI state on the server between requests. Each browser interaction follows this path:

```text
1. browser sends: current field values + action id
2. Mateu instantiates the ViewModel
3. Mateu hydrates it from the request
4. Mateu executes the action
5. Mateu serializes the result as a UI definition
6. browser renders the result
```

ViewModels are plain Java classes with no server-side lifecycle. They are created, used, and discarded per request.

## What you define — full reference

| Concept | How |
|---|---|
| State | fields |
| Actions | methods annotated `@Button` or `@Toolbar` |
| Validation | Bean Validation (`@NotEmpty`, `@NotNull`, `@Size`, …) |
| Layout | `@Colspan`, `@Section`, `@Zones`, `@Tabs`, `@Accordion` |
| Routing | `@UI`, `@Route` |
| Navigation | `@Menu` |
| Rendering intent | `@Stereotype` |
| Relationships | `@Lookup` |
| Dynamic rules | `@Rule`, `@Hidden` |
| Browser feedback | return `Message`, navigate by returning any object |

## What you do not do

- write HTML or JSX
- configure frontend routes
- write API clients
- manage frontend state
- duplicate validation
- synchronize models across layers

## Next

- [Technical architecture](/mateu-about/architecture) — how the Mateu system is structured internally
- [Mateu and system architecture](/mateu-about/system-architecture) — where Mateu fits in DDD and hexagonal designs
- [Build a full backoffice in 10 minutes](/build-a-full-backoffice-in-10-minutes) — a complete worked example
