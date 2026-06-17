---
title: "CrudAdapter"
description: "The interface that connects a Crud to its data source."
---

`CrudAdapter` is the data layer interface for `Crud`. It defines five methods — one for each data operation — and is the only seam between the orchestrator and your persistence layer.

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

---

## Type parameters

| Type | Description |
|---|---|
| `View` | Object returned for the read-only detail screen |
| `Editor` | Object returned for the edit form — must implement `CrudEditorForm<IdType>` |
| `CreationForm` | Object returned for the create form — must implement `CrudCreationForm<IdType>` |
| `Filters` | DTO used as the filter bar above the grid |
| `Row` | DTO used as a grid row in the listing |
| `IdType` | Type of the entity identifier |

---

## Methods

| Method | Called when… | Must return |
|---|---|---|
| `search` | User searches, filters, paginates, or sorts | `ListingData<Row>` with the matching rows |
| `deleteAllById` | User selects rows and clicks Delete | — (void) |
| `getView` | User clicks a row — opens the read-only detail | A `View` object |
| `getEditor` | User clicks Edit — opens the edit form | An `Editor` implementing `CrudEditorForm<IdType>` |
| `getCreationForm` | User clicks New — opens the create form | A `CreationForm` implementing `CrudCreationForm<IdType>` |

---

## Full example

```java
@Service
public class ProductCrudAdapter
    implements CrudAdapter<ProductView, ProductEditor, ProductCreationForm,
                           ProductFilters, ProductRow, String> {

    private final ProductService service;

    public ProductCrudAdapter(ProductService service) {
        this.service = service;
    }

    @Override
    public ListingData<ProductRow> search(
            String searchText, ProductFilters filters,
            Pageable pageable, HttpRequest httpRequest) {
        return service.search(searchText, filters, pageable);
    }

    @Override
    public void deleteAllById(List<String> ids, HttpRequest httpRequest) {
        service.deleteAll(ids);
    }

    @Override
    public ProductView getView(String id, HttpRequest httpRequest) {
        return service.findView(id);
    }

    @Override
    public ProductEditor getEditor(String id, HttpRequest httpRequest) {
        return service.findEditor(id);
    }

    @Override
    public ProductCreationForm getCreationForm(HttpRequest httpRequest) {
        return new ProductCreationForm();
    }
}
```

---

## Relation to the auto adapters

`AutoCrud<T>` and `FilteredAutoCrud<F,T>` cover the common case where the entity type is used for every screen — implement `repository()` and you're done. Implement `CrudAdapter` directly when:

- `View`, `Editor`, and `CreationForm` are genuinely different types.
- The search requires a custom query.
- You need full control over delete behaviour (auditing, soft-delete, etc.).

| | `AutoCrud<T>` / `FilteredAutoCrud<F,T>` | `CrudAdapter` (direct) |
|---|---|---|
| View / Editor / CreationForm types | All `T` | Separate types |
| Search | In-memory (override via `AutoCrudAdapter` to customise) | Fully custom |
| Save / Create | Via `AutoNamedView` + `repository()` | Fully custom |
| Boilerplate | Minimal | Full |

---

## Next

- [AutoCrudAdapter](/java-user-manual/build/auto-adapters/) — pre-built adapters for the common single-type case
- [Full control with Crud](/java-user-manual/build/full-control-crud-orchestrator/) — the orchestrator that consumes this adapter
- [CrudEditorForm and CrudCreationForm](/java-user-manual/build/crud-forms/) — the interfaces your editor and creation form must implement
