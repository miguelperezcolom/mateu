---
title: "Golden example: Orders, Customers and Order lines"
weight: 8
aliases:
  - /java-user-manual/orders-customers-order-lines/
---

# Golden example: Orders, Customers and Order lines

This example shows how to build a realistic business UI with Mateu.

It combines:

- a main CRUD (`Orders`)
- a lightweight relationship (`Customer`)
- a child CRUD (`OrderLines`)
- validation
- backend services / repositories
- master-detail composition

The goal is to show the preferred Mateu way to model a real business screen.

---

## What we are building

We want an order management UI with:

- a list of orders
- create / edit / view order screens
- a customer selector
- order lines embedded inside the order detail
- CRUD behavior for order lines

---

## Mental model

Use:

- `@Lookup` for lightweight references
- scalar ids for relationships
- embedded orchestrators for child collections
- `Callable<?>` to compose dynamic child UI after hydration

Do **not** model child collections as `List<Entity>` when you want full CRUD behavior.

---

# 1. Order CRUD

The main entry point is a standard CRUD UI.

```java
@Service
@UI("/orders")
public class Orders extends AutoCrudOrchestrator<Order> {

    final OrderAdapter adapter;

    public Orders(OrderAdapter adapter) {
        this.adapter = adapter;
    }

    @Override
    public AutoCrudAdapter<Order> simpleAdapter() {
        return adapter;
    }
}
```

With this, Mateu provides the standard CRUD flow:

- `/orders` → list
- `/orders/:id` → readonly detail
- `/orders/:id/edit` → edit
- `/orders/new` → create

---

# 2. Order model

The order stores a customer id, not a `Customer` entity.

```java
public record Order(

        @NotEmpty
        @EditableOnlyWhenCreating
        String id,

        @NotEmpty
        @Lookup(
                search = CustomerOptionsSupplier.class,
                label = CustomerLabelSupplier.class
        )
        String customerId,

        @NotNull
        LocalDate orderDate,

        @NotNull
        @Stereotype(FieldStereotype.radio)
        OrderStatus status

) implements Identifiable {

    @Override
    public String toString() {
        return id != null ? "Order " + id : "New order";
    }
}
```

```java
public enum OrderStatus {
    Draft,
    Confirmed,
    Shipped,
    Cancelled
}
```

---

## Why `customerId` and not `Customer`

This is intentional.

```java
@Lookup(search = CustomerOptionsSupplier.class, label = CustomerLabelSupplier.class)
String customerId;
```

This keeps the UI decoupled from the domain model.

Mateu only needs:

- the stored value (`customerId`)
- a way to search customers
- a way to render labels

---

# 3. Customer lookup

The lookup has two parts:

- `LookupOptionsSupplier` → searches available customers
- `LabelSupplier` → resolves selected customer labels

---

## Customer options

```java
@Service
public class CustomerOptionsSupplier implements LookupOptionsSupplier {

    final CustomerRepository repository;

    public CustomerOptionsSupplier(CustomerRepository repository) {
        this.repository = repository;
    }

    @Override
    public ListingData<Option> search(
            String fieldName,
            String searchText,
            Pageable pageable,
            HttpRequest httpRequest) {

        return ListingData.of(
                repository.findAll(searchText, pageable).stream()
                        .map(customer -> new Option(customer.id(), customer.name()))
                        .toList()
        );
    }
}
```

---

## Customer labels

```java
@Service
public class CustomerLabelSupplier implements LabelSupplier {

    final CustomerRepository repository;

    public CustomerLabelSupplier(CustomerRepository repository) {
        this.repository = repository;
    }

    @Override
    public String label(String fieldName, Object id, HttpRequest httpRequest) {
        return repository.findById(String.valueOf(id))
                .map(Customer::name)
                .orElse("?");
    }
}
```

---

# 4. Order adapter and repository

```java
@Service
public class OrderAdapter extends AutoCrudAdapter<Order> {

    final OrderRepository repository;

    public OrderAdapter(OrderRepository repository) {
        this.repository = repository;
    }

    @Override
    public CrudRepository<Order> repository() {
        return repository;
    }
}
```

```java
@Service
public class OrderRepository implements CrudRepository<Order> {

    private final Map<String, Order> db = new LinkedHashMap<>();

    @Override
    public Optional<Order> findById(String id) {
        return Optional.ofNullable(db.get(id));
    }

    @Override
    public String save(Order entity) {
        db.put(entity.id(), entity);
        return entity.id();
    }

    @Override
    public List<Order> findAll() {
        return db.values().stream().toList();
    }

    @Override
    public void deleteAllById(List<String> selectedIds) {
        selectedIds.forEach(db::remove);
    }
}
```

---

# 5. Adding order lines

Order lines are child records.

They have their own lifecycle:

- list
- create
- edit
- delete

So we do **not** put them in the order as:

```java
List<OrderLine> lines;
```

That would be inferred as an editable structure, not as a child CRUD.

Instead, we embed a child orchestrator.

---

# 6. Order detail with embedded lines

If you want to add custom content to the order detail, compose it as dynamic UI.

```java
@Service
@Route("/orders/:id")
@Style(StyleConstants.CONTAINER)
public class OrderDetail {

    final OrderRepository orderRepository;

    String id;

    @ReadOnly
    String customerId;

    @ReadOnly
    LocalDate orderDate;

    @ReadOnly
    OrderStatus status;

    public OrderDetail(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public void onHydrated(HttpRequest httpRequest) {
        orderRepository.findById(id).ifPresent(order -> {
            customerId = order.customerId();
            orderDate = order.orderDate();
            status = order.status();
        });
    }

    Callable<?> lines = () -> MateuBeanProvider
            .getBean(OrderLines.class)
            .withOrderId(id);
}
```

> Depending on your application structure, you may rely on the default detail generated by `AutoCrudOrchestrator`, or provide an explicit route when you need custom composition.

---

# 7. Order line model

```java
public record OrderLine(

        @NotEmpty
        @EditableOnlyWhenCreating
        String id,

        @NotEmpty
        @HiddenInList
        String orderId,

        @NotEmpty
        String productName,

        @NotNull
        Integer quantity,

        @NotNull
        BigDecimal unitPrice

) implements Identifiable {

    @Override
    public String toString() {
        return productName != null ? productName : "New line";
    }
}
```

---

# 8. Embedded child CRUD

```java
@Service
public class OrderLines extends AutoListOrchestrator<OrderLine> {

    final OrderLineAdapter adapter;

    String orderId;

    public OrderLines(OrderLineAdapter adapter) {
        this.adapter = adapter;
    }

    public OrderLines withOrderId(String orderId) {
        this.orderId = orderId;
        adapter.withOrderId(orderId);
        return this;
    }

    @Override
    public AutoCrudAdapter<OrderLine> simpleAdapter() {
        return adapter;
    }
}
```

---

# 9. Filtering the child CRUD by parent id

The important part is that the child adapter receives the parent context.

```java
@Service
public class OrderLineAdapter extends AutoCrudAdapter<OrderLine> {

    final OrderLineRepository repository;

    String orderId;

    public OrderLineAdapter(OrderLineRepository repository) {
        this.repository = repository;
    }

    public OrderLineAdapter withOrderId(String orderId) {
        this.orderId = orderId;
        return this;
    }

    @Override
    public CrudRepository<OrderLine> repository() {
        return new CrudRepository<>() {

            @Override
            public Optional<OrderLine> findById(String id) {
                return repository.findById(id);
            }

            @Override
            public String save(OrderLine entity) {
                return repository.save(new OrderLine(
                        entity.id(),
                        orderId,
                        entity.productName(),
                        entity.quantity(),
                        entity.unitPrice()
                ));
            }

            @Override
            public List<OrderLine> findAll() {
                return repository.findByOrderId(orderId);
            }

            @Override
            public void deleteAllById(List<String> selectedIds) {
                repository.deleteAllById(selectedIds);
            }
        };
    }
}
```

---

## Why this matters

The child CRUD is scoped by the parent order id.

That means:

- order lines are listed only for the current order
- new lines are automatically assigned to the current order
- the child UI stays independent
- the domain model does not leak into the parent view model

---

# 10. Order line repository

```java
@Service
public class OrderLineRepository {

    private final Map<String, OrderLine> db = new LinkedHashMap<>();

    public Optional<OrderLine> findById(String id) {
        return Optional.ofNullable(db.get(id));
    }

    public String save(OrderLine entity) {
        db.put(entity.id(), entity);
        return entity.id();
    }

    public List<OrderLine> findByOrderId(String orderId) {
        return db.values().stream()
                .filter(line -> Objects.equals(orderId, line.orderId()))
                .toList();
    }

    public void deleteAllById(List<String> ids) {
        ids.forEach(db::remove);
    }
}
```

---

# What this example demonstrates

This example shows several important Mateu principles:

## 1. Prefer model-driven UI

The main CRUD is defined from the `Order` model.

## 2. Use lookups for references

Customer is represented as a scalar id with search and label suppliers.

## 3. Use embedded CRUDs for child collections

Order lines have their own lifecycle, so they are modeled as a child CRUD.

## 4. Use `Callable<?>` for dynamic composition

The child CRUD needs the hydrated `orderId`, so it is created lazily.

## 5. Keep boundaries explicit

Nothing is loaded implicitly through `List<Entity>`.

The parent decides what child UI to embed.

---

# Common mistakes

## Mistake 1: using `Customer customer`

Prefer:

```java
String customerId;
```

with:

```java
@Lookup(search = CustomerOptionsSupplier.class, label = CustomerLabelSupplier.class)
```

## Mistake 2: using `List<OrderLine>`

Prefer:

```java
Callable<?> lines = () -> MateuBeanProvider
        .getBean(OrderLines.class)
        .withOrderId(id);
```

## Mistake 3: creating pages too early

For standard CRUD, start with the model and orchestrator.

Create explicit pages only when you need custom composition or custom flows.

---

# Summary

The Mateu way for this example is:

- `Orders extends AutoCrudOrchestrator<Order>`
- `Order.customerId` uses `@Lookup`
- `OrderLines extends AutoListOrchestrator<OrderLine>`
- parent detail embeds child CRUD with `Callable<?>`
- child CRUD is filtered by parent context

This gives you a real business UI without creating a separate frontend application.
