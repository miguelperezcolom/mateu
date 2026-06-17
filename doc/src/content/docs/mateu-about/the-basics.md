---
title: "The basics"
---

A Mateu UI is a Java class. Fields hold state. Methods trigger actions. Annotations control layout, routing, and rendering behavior.

## The simplest possible UI

```java
@UI("/counter")
public class Counter {

    @ReadOnly
    int count = 0;

    @Button
    Runnable increment = () -> count++;
}
```

Mateu reads this class and produces a browser form with one read-only number field and one button. No additional code needed.

## Routing

The `@UI` annotation registers a class as a UI root and maps it to a URL path.

```java
@UI("/products")
public class ProductsRoot { ... }
```

The value passed to `@UI` is the path where the UI is accessible. Mateu wires up the routing automatically.

## State

Fields on a ViewModel class become form fields. Their Java type determines the input type:

| Java type | Default input |
|---|---|
| `String` | text field |
| `int` / `Integer` | number field |
| `boolean` / `Boolean` | checkbox |
| `LocalDate` | date picker |
| `LocalDateTime` | date-time picker |
| `enum` | select / dropdown |
| `List<T>` | grid or checkbox group |

You can override the default with `@Stereotype`.

## Actions

Any method annotated with `@Button` becomes a clickable action in the UI.

```java
@Button
public Message submit() {
    // call use case, validate, etc.
    return new Message("Saved successfully");
}
```

Returning a `Message` from an action sends a browser notification. You can also return a `UICommand` to navigate, refresh, or open dialogs.

## Validation

Mateu uses Bean Validation. Annotate fields as you normally would:

```java
@NotEmpty
String name;

@Min(1)
int quantity;

@Email
String contactEmail;
```

Mateu enforces these constraints in the browser before the action fires, and again on the backend.

## Layout

A few annotations control how fields are arranged:

- `@Colspan(2)` — makes a field span two columns
- `@Style("width: 100%;")` — applies inline CSS
- `@Section("Shipping")` — groups fields under a heading

## Navigation

The `@Menu` annotation exposes a field or nested class as a navigation entry.

```java
@UI("/admin")
public class AdminRoot {

    @Menu
    OrdersMenu orders;

    @Menu
    ProductsMenu products;
}
```

Each `@Menu` field creates a navigation item. Nesting `@Menu` fields produces a tree.

## Relationships

The `@Lookup` annotation resolves foreign keys through backend suppliers.

```java
@Lookup(search = ProductOptionsSupplier.class, label = ProductLabelSupplier.class)
String productId;
```

`ProductOptionsSupplier` provides the search results. `ProductLabelSupplier` resolves the display label for a given id. Both are plain Java classes injected by the DI container — they can call query services, repositories, or any backend component.

## AutoCrud

For standard business entities, `AutoCrud` gives you a full CRUD flow from a single class:

```java
@UI("/orders")
public class Orders extends AutoCrud<Order> {}
```

This produces list, view, edit, and create screens automatically. The entity type must implement `Identifiable`.

## Crud

When you need explicit control, `Crud` lets you define each part separately:

```java
public class OrdersOrchestrator extends Crud<
    OrderView,
    OrderEditor,
    OrderCreationForm,
    OrderFilters,
    OrderRow,
    String> { ... }
```

- `OrderView` — the read-only detail screen
- `OrderEditor` — the edit form
- `OrderCreationForm` — the creation form
- `OrderFilters` — the filter bar on the list
- `OrderRow` — the columns in the list
- `String` — the id type

Each type is an independent ViewModel class. You can make each one as simple or as detailed as needed.

## Fluent API

For cases where annotations are not expressive enough, Mateu provides a fluent Java API for building UI descriptions programmatically. This is useful for dynamic layouts and computed structures.

## Two declarative styles, one system

Both the annotation-based approach and the fluent API produce the same internal UI definition format. They can be combined in the same application.

## Next

- [How to think in Mateu](/mateu-about/how-to-think-in-mateu) — the mindset shift required to work effectively with Mateu
- [The Mateu mental model](/mateu-about/mental-model) — how definitions become UIs
- [Build a full backoffice in 10 minutes](/build-a-full-backoffice-in-10-minutes) — a worked example with Products, Orders, and Roles
