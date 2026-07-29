---
title: "Build a full backoffice in 10 minutes"
---

This is the fastest way to understand what Mateu is really for.

In a few minutes, you can go from a Spring Boot project to a working backoffice with:

- forms
- validation
- actions
- navigation
- relationships
- browser feedback

And you do it all in Java.

---

## What you'll build

A small admin app with:

- a home screen
- a menu
- a CRUD screen
- validation
- a foreign key relationship
- a success notification

No frontend project. No REST controllers for each screen. No duplicated models.

---

## Step 1 — Create the UI root

Start with a screen:

```java
@UI("/admin")
@Title("Admin")
public class AdminHome {

  @Menu
  AdminMenu admin;

}
```

```java
public class AdminMenu {

  @Menu
  RolesCrud roles;

}
```

This already gives you:

- a UI root
- a navigation entry
- a place to expose your backoffice modules

---

## Step 2 — Create a real form

Now define the form for one entity.

```java
public class RoleViewModel implements Identifiable {

  @EditableOnlyWhenCreating
  @NotEmpty
  String id;

  @NotEmpty
  String name;

  @Colspan(2)
  @Style("width: 100%;")
  String description;

  @Lookup(search = PermissionIdOptionsSupplier.class, label = PermissionIdLabelSupplier.class)
  @Colspan(2)
  @Style("width: 100%;")
  @Stereotype(FieldStereotype.checkbox)
  List<String> permissions;

  @Override
  public String id() {
    return id;
  }

  public String create(HttpRequest httpRequest) {
    return id;
  }

  public void save(HttpRequest httpRequest) {
  }
}
```

In one class, you just defined:

- state
- validation
- layout hints
- rendering intent
- a relationship
- create/save lifecycle

---

## Step 3 — Connect it to your application layer

Now wire the form to your actual use cases.

```java
public class RoleViewModel implements Identifiable {

  @EditableOnlyWhenCreating
  @NotEmpty
  String id;

  @NotEmpty
  String name;

  @Colspan(2)
  @Style("width: 100%;")
  String description;

  @Lookup(search = PermissionIdOptionsSupplier.class, label = PermissionIdLabelSupplier.class)
  @Colspan(2)
  @Style("width: 100%;")
  @Stereotype(FieldStereotype.checkbox)
  List<String> permissions;

  final CreateRoleUseCase createRoleUseCase;
  final SaveRoleUseCase saveRoleUseCase;

  public RoleViewModel(CreateRoleUseCase createRoleUseCase, SaveRoleUseCase saveRoleUseCase) {
    this.createRoleUseCase = createRoleUseCase;
    this.saveRoleUseCase = saveRoleUseCase;
  }

  public String create(HttpRequest httpRequest) {
    createRoleUseCase.handle(new CreateRoleCommand(id, name, description, permissions));
    return id;
  }

  public void save(HttpRequest httpRequest) {
    saveRoleUseCase.handle(new SaveRoleCommand(id, name, description, permissions));
  }

  @Override
  public String id() {
    return id;
  }
}
```

Mateu does not replace your application architecture.

It sits on top of it.

---

## Step 4 — Expose the CRUD

Now expose the form through a `Crud`. The whole lifecycle — listing, view, edit, create, delete, persistence — lives on the orchestrator, wired straight to your query services and use cases.

```java
@Title("Roles")
public class RolesCrud extends Crud<
        RoleViewModel,
        RoleViewModel,
        RoleViewModel,
        NoFilters,
        RoleRow,
        String> {

  final RoleViewModel viewModel;
  final RoleQueryService queryService;
  final DeleteRoleUseCase deleteRoleUseCase;

  public RolesCrud(
      RoleViewModel viewModel,
      RoleQueryService queryService,
      DeleteRoleUseCase deleteRoleUseCase) {
    this.viewModel = viewModel;
    this.queryService = queryService;
    this.deleteRoleUseCase = deleteRoleUseCase;
  }

  @Override
  public Object search(String searchText, Object filters, Pageable pageable, HttpRequest httpRequest) {
    return queryService.findAll(searchText, (NoFilters) filters, pageable);
  }

  @Override
  public RoleViewModel view(String id, HttpRequest httpRequest) {
    return viewModel.load(queryService.getById(id).orElseThrow());
  }

  @Override
  public RoleViewModel edit(String id, HttpRequest httpRequest) {
    return viewModel.load(queryService.getById(id).orElseThrow());
  }

  @Override
  public RoleViewModel creationForm(HttpRequest httpRequest) {
    return viewModel;
  }

  @Override
  public void deleteAllById(List<String> selectedIds, HttpRequest httpRequest) {
    deleteRoleUseCase.handle(new DeleteRoleCommand(selectedIds));
  }

  @Override
  public Object save(HttpRequest httpRequest) {
    var form = httpRequest.getComponentState(RoleViewModel.class);
    form.save(httpRequest);
    return form.id();
  }

  @Override
  public Object saveNew(HttpRequest httpRequest) {
    var form = httpRequest.getComponentState(RoleViewModel.class);
    return form.create(httpRequest);
  }

  @Override
  public String getIdFieldForRow() {
    return "id";
  }

  @Override
  public String toId(String s) {
    return s;
  }
}
```

Now you have a real CRUD screen in your backoffice.

---

## Step 5 — Resolve relationships dynamically

Mateu can resolve foreign keys dynamically through backend suppliers.

### Options supplier

```java
public class PermissionIdOptionsSupplier implements LookupOptionsSupplier {

  final PermissionQueryService queryService;

  public PermissionIdOptionsSupplier(PermissionQueryService queryService) {
    this.queryService = queryService;
  }

  @Override
  public ListingData<Option> search(String searchText, Pageable pageable, HttpRequest httpRequest) {
    var found = queryService.findAll(searchText, null, pageable);
    return new ListingData<>(new Page<>(
        searchText,
        found.page().pageSize(),
        found.page().pageNumber(),
        found.page().totalElements(),
        found.page().content().stream()
            .map(permission -> new Option(permission.id(), permission.name()))
            .toList()
    ));
  }
}
```

### Label supplier

```java
public class PermissionIdLabelSupplier implements LabelSupplier {

  final PermissionQueryService queryService;

  public PermissionIdLabelSupplier(PermissionQueryService queryService) {
    this.queryService = queryService;
  }

  @Override
  public String label(Object id, HttpRequest httpRequest) {
    return queryService.getLabel((String) id);
  }
}
```

So your form can work with real relationships without moving logic into the frontend.

---

## Step 6 — Return user feedback directly

You can return browser feedback straight from backend methods.

```java
@Button
public Message notifySave() {
  return new Message("Role saved successfully");
}
```

Mateu turns that into a browser notification.

No frontend toast code required.

---

## What you just built

With a small amount of Java, you defined:

- navigation
- CRUD lifecycle
- validation
- relationships
- rendering behavior
- user feedback

Mateu handled:

- rendering
- browser validation
- interaction
- state binding
- UI updates

---

## Why this matters

In a traditional stack, this usually means:

- backend model
- frontend model
- API glue
- duplicated validation
- duplicated relationships
- duplicated navigation

With Mateu, it stays in one place.

---

## Where to go next

If you want the step-by-step version, continue with:

- [Your first Mateu app with Spring Boot →](/java-user-manual/start-here/first-app/)
- [Build a real CRUD with relationships →](/java-user-manual/build/orders-customers-order-lines/)
- [Compose a shell with multiple services →](/java-user-manual/use-cases/distributed-backoffice/)

---

## One sentence summary

**This is what Mateu is for: building real backoffice applications with minimal code and without a frontend layer.**
