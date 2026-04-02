---
title: "A real CRUD example"
weight: 11
---

# A real CRUD example

This example shows how a Mateu CRUD can fit inside a hexagonal, DDD-style service.

It is based on a real `users-service` where the UI lives inside the service itself, CRUD screens are exposed through Mateu, and the application layer remains separated into query services, use cases, and repositories.

## Entry point

A service can expose its own UI root:

```java
@UI("/_users")
@Title("Users")
public class UsersHome {

    @Menu
    UsersMenu users;
}
```

And that menu can expose multiple CRUD areas from the same service:

```java
public class UsersMenu {

    @Menu
    PermissionsCrudOrchestrator permissions;

    @Menu
    RolesCrudOrchestrator roles;

    @Menu
    UserGroupCrudOrchestrator userGroups;

    @Menu
    UsersCrudOrchestrator users;
}
```

## Orchestrator

A CRUD screen can be declared with a typed `CrudOrchestrator`:

```java
@Service
@RequiredArgsConstructor
@Scope("prototype")
@Title("Roles")
public class RolesCrudOrchestrator extends CrudOrchestrator<
        RoleViewModel,
        RoleViewModel,
        RoleViewModel,
        NoFilters,
        RoleRow,
        String
        > {

    final RoleCrudAdapter adapter;

    @Override
    public CrudAdapter<RoleViewModel,
            RoleViewModel, RoleViewModel,
            NoFilters, RoleRow, String> adapter() {
        return adapter;
    }

    @Override
    public String toId(String s) {
        return s;
    }
}
```

The orchestrator defines the CRUD flow, while the adapter provides the actual behavior.

## Adapter

The adapter connects the UI to the application layer.

In this example:

- search uses a query service
- delete uses a use case
- view and edit load a view model
- creation returns a form object

```java
@Override
public ListingData<RoleRow> search(String searchText,
                                   NoFilters filters,
                                   Pageable pageable) {
    return queryService.findAll(searchText, filters, pageable);
}

@Override
public void deleteAllById(List<String> selectedIds) {
    deleteRoleUseCase.handle(new DeleteRoleCommand(selectedIds));
}

@Override
public RoleViewModel getView(String id) {
    return viewModel.load(queryService
            .getById(id)
            .orElseThrow());
}
```

This keeps UI behavior explicit without collapsing everything into one class.

## View model

The form itself is just Java code:

```java
@Service
@Scope("prototype")
@RequiredArgsConstructor
public class RoleViewModel implements Identifiable, CrudEditorForm<String>, CrudCreationForm<String> {

    @EditableOnlyWhenCreating
    @NotEmpty
    String id;

    @NotEmpty
    String name;

    @Colspan(2)
    @Style("width: 100%;")
    String description;

    @ForeignKey(search = PermissionIdOptionsSupplier.class, label = PermissionIdLabelSupplier.class)
    @Colspan(2)
    @Style("width: 100%;")
    @Stereotype(FieldStereotype.checkbox)
    List<String> permissions;

    final CreateRoleUseCase createRoleUseCase;
    final SaveRoleUseCase saveRoleUseCase;

    @Override
    public String create(HttpRequest httpRequest) {
        createRoleUseCase.handle(new CreateRoleCommand(id, name, description, permissions));
        return id;
    }

    @Override
    public void save(HttpRequest httpRequest) {
        saveRoleUseCase.handle(new SaveRoleCommand(id, name, description, permissions));
    }
}
```

This example shows several important things at once:

- validation with `@NotEmpty`
- creation-only fields with `@EditableOnlyWhenCreating`
- layout hints such as `@Colspan`
- foreign keys with option and label suppliers
- checkbox-style multi-selection through `@Stereotype(FieldStereotype.checkbox)`
- use cases for create and save

## Another example: users with relationships

The same pattern also works for more relational forms:

```java
@Service
@Scope("prototype")
@RequiredArgsConstructor
public class UserViewModel implements Identifiable, CrudEditorForm<String>, CrudCreationForm<String> {

    @EditableOnlyWhenCreating
    @NotEmpty
    String id;

    @NotEmpty
    String name;

    String email;

    @ForeignKey(search = UserGroupIdOptionsSupplier.class, label = UserGroupIdLabelSupplier.class)
    List<String> groups;

    @ForeignKey(search = RoleIdOptionsSupplier.class, label = RoleIdLabelSupplier.class)
    @Colspan(2)
    @Style("width: 100%;")
    List<String> roles;

    final CreateUserUseCase createUserUseCase;
    final SaveUserUseCase saveUserUseCase;
}
```

That means the same declarative model can handle:

- simple CRUDs
- richer forms
- relationships across aggregates
- option lookup through query services

## Query side

The read side remains separated as well.

For example, a query service can provide rows, labels, paging, and detail DTOs:

```java
@Override
public ListingData<RoleRow> findAll(String searchText,
                                    Object filters, Pageable pageable) {
    var page = repository.findAllByNameContainingIgnoreCase(searchText, org.springframework.data.domain.Pageable
            .ofSize(pageable.size())
            .withPage(pageable.page())
    );
    return new ListingData(new Page(searchText, page.getSize(), page.getNumber(), page.getTotalElements(),
            page.getContent().stream().map(this::toDomain).toList()));
}
```

This keeps read models explicit and works naturally with listing UIs.

## Why this example matters

This is not a toy counter.

It shows a Mateu CRUD integrated with:

- typed view models
- validation
- field stereotypes
- foreign key selection
- query services
- application use cases
- repositories behind the application layer
- hexagonal boundaries
- DDD-style aggregates and value objects

## The key takeaway

Mateu lets you define the UI in code that stays close to the backend service that owns the behavior, without forcing you to abandon hexagonal architecture or DDD.

The UI becomes part of the service — not a second application you need to rebuild by hand.
