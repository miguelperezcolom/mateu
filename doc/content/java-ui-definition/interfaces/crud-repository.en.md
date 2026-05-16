---
title: "CrudRepository / CrudAdapter"
weight: 6
---

# CrudRepository

A simple CRUD interface for entities identified by a string ID. Use it when your entity management follows the standard find/save/list/delete pattern.

```java
public interface CrudRepository<T extends Identifiable> {
    Optional<T> findById(String id);
    String save(T entity);
    List<T> findAll();
    void deleteAllById(List<String> selectedIds);
}
```

## Methods

| Method | Description |
|---|---|
| `findById(id)` | Returns the entity with the given ID, or empty |
| `save(entity)` | Persists the entity and returns its ID |
| `findAll()` | Returns all entities |
| `deleteAllById(ids)` | Deletes all entities with the given IDs |

## Usage

```java
@Service
public class CustomerRepository implements CrudRepository<Customer> {

    private final Map<String, Customer> store = new HashMap<>();

    @Override
    public Optional<Customer> findById(String id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public String save(Customer customer) {
        if (customer.getId() == null) customer = customer.withId(UUID.randomUUID().toString());
        store.put(customer.getId(), customer);
        return customer.getId();
    }

    @Override
    public List<Customer> findAll() {
        return new ArrayList<>(store.values());
    }

    @Override
    public void deleteAllById(List<String> ids) {
        ids.forEach(store::remove);
    }
}
```

---

# CrudAdapter

A richer interface that separates the list view, detail view, editor form, and creation form into distinct types. Use it when you need full control over what is shown in each CRUD mode.

```java
public interface CrudAdapter<View, Editor, CreationForm, Filters, Row, IdType> {

    ListingData<Row> search(
        String searchText, Filters filters, Pageable pageable, HttpRequest httpRequest);

    void deleteAllById(List<IdType> selectedIds, HttpRequest httpRequest);

    View getView(IdType id, HttpRequest httpRequest);

    Editor getEditor(IdType id, HttpRequest httpRequest);

    CreationForm getCreationForm(HttpRequest httpRequest);
}
```

## Type parameters

| Parameter | Description |
|---|---|
| `View` | Read-only detail view form class |
| `Editor` | Editable form class |
| `CreationForm` | Form class shown when creating a new record |
| `Filters` | Filters class for the listing |
| `Row` | Row class for the listing grid |
| `IdType` | Type of the entity identifier |

## Methods

| Method | Description |
|---|---|
| `search(...)` | Returns paginated rows for the listing |
| `deleteAllById(ids, httpRequest)` | Deletes the selected rows |
| `getView(id, httpRequest)` | Returns the read-only view object for the given ID |
| `getEditor(id, httpRequest)` | Returns the editable form object for the given ID |
| `getCreationForm(httpRequest)` | Returns a blank creation form |

## Usage

```java
@Route("/invoices")
public class InvoiceAdapter implements CrudAdapter<InvoiceView, InvoiceEditor, InvoiceCreation, InvoiceFilters, InvoiceRow, String> {

    @Override
    public ListingData<InvoiceRow> search(String searchText, InvoiceFilters filters, Pageable pageable, HttpRequest httpRequest) {
        return invoiceRepository.search(searchText, filters, pageable);
    }

    @Override
    public void deleteAllById(List<String> ids, HttpRequest httpRequest) {
        invoiceRepository.deleteAllById(ids);
    }

    @Override
    public InvoiceView getView(String id, HttpRequest httpRequest) {
        return invoiceRepository.findViewById(id).orElseThrow();
    }

    @Override
    public InvoiceEditor getEditor(String id, HttpRequest httpRequest) {
        return invoiceRepository.findEditorById(id).orElseThrow();
    }

    @Override
    public InvoiceCreation getCreationForm(HttpRequest httpRequest) {
        return new InvoiceCreation();
    }
}
```
