---
title: "Foreign keys and options"
weight: 7
---

# Foreign keys and options

Mateu lets you declare relationships in your view models with `@Lookup`.

Instead of hardcoding options in the UI, Mateu delegates option search and label resolution to backend services.

## A field with a foreign key

```java
@Lookup(search = PermissionIdOptionsSupplier.class, label = PermissionIdLabelSupplier.class)
@Colspan(2)
@Style("width: 100%;")
@Stereotype(FieldStereotype.checkbox)
List<String> permissions;
```

This tells Mateu:

- how to search available options
- how to resolve labels for selected values
- how to render the relationship in the UI

## Options supplier

The `LookupOptionsSupplier` provides searchable and pageable options:

```java
@Service
@RequiredArgsConstructor
public class PermissionIdOptionsSupplier implements LookupOptionsSupplier {

    final PermissionQueryService queryService;

    @Override
    public ListingData<Option> search(String searchText, Pageable pageable, HttpRequest httpRequest) {
        var found = queryService.findAll(searchText, null, pageable);
        return new ListingData<>(new Page<>(
                searchText,
                found.page().pageSize(),
                found.page().pageNumber(),
                found.page().totalElements(),
                found.page().content().stream().map(permission ->
                        new Option(permission.id(), permission.name())).toList()));
    }
}
```

## Label supplier

The `LabelSupplier` resolves a human-readable label for a selected id:

```java
@Service
@RequiredArgsConstructor
public class PermissionIdLabelSupplier implements LabelSupplier {

    final PermissionQueryService queryService;

    @Override
    public String label(Object id, HttpRequest httpRequest) {
        return queryService.getLabel((String) id);
    }
}
```

## Why this matters

This keeps the UI declarative while still allowing relationships to be resolved dynamically from backend query services.

It also means:

- no hardcoded dropdown data
- no frontend-side relationship logic
- support for search and pagination
- better fit for large datasets

## Rendering

`@Lookup` defines the relationship.

Other annotations can define presentation:

- `@Stereotype(FieldStereotype.checkbox)`
- `@Style(...)`
- `@Colspan(...)`

This means data resolution and visual rendering stay separate but composable.

## Mental model

Use:

- `@Lookup` to define a relationship
- an `OptionsSupplier` to search candidates
- a `LabelSupplier` to render labels
- a `@Stereotype` to choose how the field is presented
