---
title: "Build a real app"
weight: 22
---

# Build a real app

This tutorial shows how to build a real backoffice application with Mateu and Spring Boot.

We will model a small admin application with:

- users
- roles
- permissions
- relationships
- navigation
- feedback in the browser

The goal is not to show every feature.

The goal is to show the **default way to build a real app** with Mateu.

---

## 1. Start from the domain

Assume you already have a backend with:

- a `User` concept
- a `Role` concept
- a `Permission` concept

And an application layer with:

- query services for reads
- use cases for writes

For example:

```java
public interface UserQueryService {
  Optional<UserDto> getById(String id);
  ListingData<UserRow> findAll(String searchText, Object filters, Pageable pageable);
}

public interface CreateUserUseCase {
  void handle(CreateUserCommand command);
}

public interface SaveUserUseCase {
  void handle(SaveUserCommand command);
}
```

Mateu does not replace this architecture.

It sits on top of it.

---

## 2. Create a UI root

Expose the backoffice through a root UI.

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
  UsersCrudOrchestrator users;

  @Menu
  RolesCrudOrchestrator roles;

}
```

This already gives you:

- a UI entry point
- navigation
- menu structure

---

## 3. Create the Users form

Now define the form that edits one user.

```java
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.interfaces.CrudCreationForm;
import io.mateu.uidl.interfaces.CrudEditorForm;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class UserViewModel implements Identifiable, CrudEditorForm<String>, CrudCreationForm<String> {

  @EditableOnlyWhenCreating
  @NotEmpty
  String id;

  @NotEmpty
  String name;

  @Email
  String email;

  @ForeignKey(search = RoleIdOptionsSupplier.class, label = RoleIdLabelSupplier.class)
  @Colspan(2)
  @Style("width: 100%;")
  List<String> roles;

  @ForeignKey(search = PermissionIdOptionsSupplier.class, label = PermissionIdLabelSupplier.class)
  @Colspan(2)
  @Style("width: 100%;")
  @Stereotype(FieldStereotype.checkbox)
  List<String> permissions;

  @Override
  public String id() {
    return id;
  }

  @Override
  public String create(HttpRequest httpRequest) {
    return id;
  }

  @Override
  public void save(HttpRequest httpRequest) {
  }
}
```

In one class, you just defined:

- state
- validation
- relationships
- layout hints
- rendering intent

---

## 4. Connect the form to the application layer

Now inject the use cases and wire creation/save.

```java
public class UserViewModel implements Identifiable, CrudEditorForm<String>, CrudCreationForm<String> {

  @EditableOnlyWhenCreating
  @NotEmpty
  String id;

  @NotEmpty
  String name;

  @Email
  String email;

  @ForeignKey(search = RoleIdOptionsSupplier.class, label = RoleIdLabelSupplier.class)
  List<String> roles;

  @ForeignKey(search = PermissionIdOptionsSupplier.class, label = PermissionIdLabelSupplier.class)
  @Stereotype(FieldStereotype.checkbox)
  List<String> permissions;

  final CreateUserUseCase createUserUseCase;
  final SaveUserUseCase saveUserUseCase;

  public UserViewModel(CreateUserUseCase createUserUseCase, SaveUserUseCase saveUserUseCase) {
    this.createUserUseCase = createUserUseCase;
    this.saveUserUseCase = saveUserUseCase;
  }

  @Override
  public String create(HttpRequest httpRequest) {
    createUserUseCase.handle(new CreateUserCommand(id, name, email, roles, permissions));
    return id;
  }

  @Override
  public void save(HttpRequest httpRequest) {
    saveUserUseCase.handle(new SaveUserCommand(id, name, email, roles, permissions));
  }

  @Override
  public String id() {
    return id;
  }
}
```

This is the core Mateu pattern:

- the view model defines the UI
- the application layer keeps business behavior

---

## 5. Load existing data

When editing an existing user, load it into the view model.

```java
public UserViewModel load(UserDto dto) {
  id = dto.id();
  name = dto.name();
  email = dto.email();
  roles = dto.roleIds();
  permissions = dto.permissionIds();
  return this;
}
```

This keeps state explicit and easy to understand.

---

## 6. Create the CRUD adapter

The adapter connects Mateu's CRUD lifecycle to your query and command layer.

```java
public class UserCrudAdapter implements CrudAdapter<
    UserViewModel,
    UserViewModel,
    UserViewModel,
    NoFilters,
    UserRow,
    String> {

  final UserViewModel viewModel;
  final UserQueryService queryService;
  final DeleteUserUseCase deleteUserUseCase;

  public UserCrudAdapter(
      UserViewModel viewModel,
      UserQueryService queryService,
      DeleteUserUseCase deleteUserUseCase) {
    this.viewModel = viewModel;
    this.queryService = queryService;
    this.deleteUserUseCase = deleteUserUseCase;
  }

  @Override
  public ListingData<UserRow> search(String searchText, NoFilters filters, Pageable pageable) {
    return queryService.findAll(searchText, filters, pageable);
  }

  @Override
  public void deleteAllById(List<String> selectedIds) {
    deleteUserUseCase.handle(new DeleteUserCommand(selectedIds));
  }

  @Override
  public UserViewModel getView(String id) {
    return viewModel.load(queryService.getById(id).orElseThrow());
  }

  @Override
  public UserViewModel getEditor(String id) {
    return viewModel.load(queryService.getById(id).orElseThrow());
  }

  @Override
  public UserViewModel getCreationForm(HttpRequest httpRequest) {
    return viewModel;
  }
}
```

This is where reads and writes remain separated.

---

## 7. Expose the CRUD

Now expose the CRUD with a `CrudOrchestrator`.

```java
@Title("Users")
public class UsersCrudOrchestrator extends CrudOrchestrator<
    UserViewModel,
    UserViewModel,
    UserViewModel,
    NoFilters,
    UserRow,
    String> {

  final UserCrudAdapter adapter;

  public UsersCrudOrchestrator(UserCrudAdapter adapter) {
    this.adapter = adapter;
  }

  @Override
  public CrudAdapter<UserViewModel, UserViewModel, UserViewModel, NoFilters, UserRow, String> adapter() {
    return adapter;
  }

  @Override
  public String toId(String s) {
    return s;
  }
}
```

Now the Users module is part of the admin app.

---

## 8. Resolve relationships dynamically

Use suppliers for foreign keys.

### Role options

```java
public class RoleIdOptionsSupplier implements ForeignKeyOptionsSupplier {

  final RoleQueryService queryService;

  public RoleIdOptionsSupplier(RoleQueryService queryService) {
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
            .map(role -> new Option(role.id(), role.name()))
            .toList()
    ));
  }
}
```

### Role labels

```java
public class RoleIdLabelSupplier implements LabelSupplier {

  final RoleQueryService queryService;

  public RoleIdLabelSupplier(RoleQueryService queryService) {
    this.queryService = queryService;
  }

  @Override
  public String label(Object id, HttpRequest httpRequest) {
    return queryService.getLabel((String) id);
  }
}
```

The same pattern applies to permissions.

---

## 9. Add browser feedback

Actions can return messages directly.

```java
@Button
public Message notifySave() {
  return new Message("User saved successfully");
}
```

That gives immediate UI feedback without extra frontend code.

You can also return browser commands when needed:

```java
return UICommand.navigateTo("/admin");
```

---

## 10. What the user gets

From this model, Mateu builds:

- navigation
- list screens
- forms
- validation in the browser
- CRUD interaction
- relationship selection
- browser feedback

No separate frontend application is required.

---

## 11. Why this works well with Spring Boot

This pattern fits naturally with Spring Boot because each concern stays in the right place:

- Mateu → UI model and interaction
- query services → reads
- use cases → writes
- repositories → persistence
- domain → business rules

You do not need to flatten your backend into UI code.

---

## 12. Recommended project structure

A simple structure could look like this:

```text
application/
  query/
  usecase/
domain/
infra/
  in/
    ui/
      users/
      roles/
  out/
```

That keeps the UI close to the service, without mixing it with domain logic.

---

## 13. The default Mateu way

If you are unsure how to build a real app in Mateu, start with this pattern:

1. define a UI root
2. add menus
3. create a view model
4. connect it to use cases
5. add a CRUD adapter
6. expose it with an orchestrator
7. use suppliers for relationships
8. return messages or commands for feedback

That is the most natural way to build backoffice software with Mateu.

---

## Summary

A real Mateu application usually consists of:

- one application model
- multiple view models
- CRUD orchestrators
- adapters
- query services
- use cases
- suppliers for relationships
- browser feedback through UI effects

This is what Mateu is for.

---

## Next step

👉 [Compose a shell with multiple services →](/java-user-manual/shell-and-federation-tutorial)
