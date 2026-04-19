---
title: "Foreign keys and options"
weight: 3
aliases:
  - /java-user-manual/foreign-keys-and-options/
---

# Foreign keys and options

Mateu lets you declare relationships in your view models with `@Lookup`.

Instead of hardcoding options in the UI, Mateu delegates option search and label resolution to backend services.

## A field with a foreign key

```java
@Lookup(search = RoleOptionsSupplier.class, label = RoleLabelSupplier.class)
@Stereotype(FieldStereotype.checkbox)
List<String> roles;
```

This tells Mateu:

- how to search available options
- how to resolve labels for selected values
- how to render the relationship in the UI

## Using Spring beans

In real applications, your ViewModel, `LookupOptionsSupplier`, and `LabelSupplier` will often be Spring beans.

This allows you to:

- inject repositories
- call external APIs
- reuse business logic
- keep your UI layer thin

### Rule of thumb

If a class contains logic, make it a Spring bean.

## ViewModel as a bean

```java
@Service
@Route("/users/:id/edit")
@Style(StyleConstants.CONTAINER)
@FormLayout(columns = 1)
public class UserEditorPage {

    final UserRepository userRepository;

    String id;

    @NotEmpty
    String name;

    @NotEmpty
    @Email
    String email;

    @Lookup(search = RoleOptionsSupplier.class, label = RoleLabelSupplier.class)
    @Stereotype(FieldStereotype.checkbox)
    List<String> roles;

    public UserEditorPage(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Button
    Object save() {
        return List.of(
                new Message("User saved"),
                new State(this)
        );
    }
}
```

## Options supplier as a bean

The `LookupOptionsSupplier` provides searchable and pageable options:

```java
@Service
public class RoleOptionsSupplier implements LookupOptionsSupplier {

    final RoleRepository roleRepository;

    public RoleOptionsSupplier(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public ListingData<Option> search(
            String fieldName,
            String searchText,
            Pageable pageable,
            HttpRequest httpRequest) {

        return ListingData.of(
                roleRepository.findAll().stream()
                        .map(r -> new Option(r.getId(), r.getName()))
                        .toList()
        );
    }
}
```

### Notes

- `fieldName`: which field is requesting the lookup
- `searchText`: user input for filtering
- `pageable`: pagination info
- `httpRequest`: request context

## Label supplier as a bean

The `LabelSupplier` resolves a human-readable label for a selected id:

```java
@Service
public class RoleLabelSupplier implements LabelSupplier {

    final RoleRepository roleRepository;

    public RoleLabelSupplier(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public String label(String fieldName, Object id, HttpRequest httpRequest) {
        return roleRepository.findById((String) id)
                .map(Role::getName)
                .orElse("?");
    }
}
```

## Why this matters

This keeps the UI declarative while still allowing relationships to be resolved dynamically from repositories, services, or external APIs.

It also means:

- no hardcoded dropdown data
- no frontend-side relationship logic
- support for search and pagination
- better fit for large datasets
- clean integration with Spring and enterprise backends

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
- an `OptionsSupplier` bean to search candidates
- a `LabelSupplier` bean to render labels
- a `@Stereotype` to choose how the field is presented
