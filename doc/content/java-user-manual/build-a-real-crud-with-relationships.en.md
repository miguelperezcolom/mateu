---
title: "Build a real CRUD with relationships"
weight: 2
---

# Build a real CRUD with relationships

In this tutorial, you'll build a more realistic Mateu backoffice screen.

By the end, you'll have:

- a CRUD screen
- validation
- foreign keys
- dynamic option loading
- user feedback
- a structure that fits well with Spring Boot and hexagonal / DDD-style applications

---

## 1. What we are building

We'll model a simple **Role** screen.

A role has:

- an id
- a name
- a description
- a list of permissions

The UI will let you:

- list roles
- create a role
- edit a role
- delete roles
- select permissions dynamically

---

## 2. Create the view model

Start with the form model.

```java
package com.example.demo.ui.roles;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.interfaces.CrudCreationForm;
import io.mateu.uidl.interfaces.CrudEditorForm;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

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

  @Override
  public String create(HttpRequest httpRequest) {
    return id;
  }

  @Override
  public void save(HttpRequest httpRequest) {
  }

  @Override
  public String id() {
    return id;
  }
}
```

This already gives you several important things:

- state through fields
- validation through Bean Validation
- layout hints through `@Colspan` and `@Style`
- relationships through `@ForeignKey`
- rendering intent through `@Stereotype`

---

## 3. Add creation and save logic

Now connect the form to your application layer.

```java
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

  public RoleViewModel(CreateRoleUseCase createRoleUseCase, SaveRoleUseCase saveRoleUseCase) {
    this.createRoleUseCase = createRoleUseCase;
    this.saveRoleUseCase = saveRoleUseCase;
  }

  @Override
  public String create(HttpRequest httpRequest) {
    createRoleUseCase.handle(new CreateRoleCommand(id, name, description, permissions));
    return id;
  }

  @Override
  public void save(HttpRequest httpRequest) {
    saveRoleUseCase.handle(new SaveRoleCommand(id, name, description, permissions));
  }

  @Override
  public String id() {
    return id;
  }
}
```

This is where Mateu fits nicely with Spring Boot and application services:

- Mateu handles UI rendering and interaction
- your use cases handle business behavior

---

## 4. Load data into the form

When editing an existing role, you need to load it.

```java
public RoleViewModel load(RoleDto role) {
  id = role.id();
  name = role.name();
  description = role.description();
  permissions = role.permissionIds();
  return this;
}
```

This keeps the UI model simple and explicit.

---

## 5. Build the CRUD adapter

The adapter connects Mateu's CRUD lifecycle to your application/query layer.

```java
package com.example.demo.ui.roles;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.NoFilters;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.CrudAdapter;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

public class RoleCrudAdapter implements CrudAdapter<
        RoleViewModel,
        RoleViewModel,
        RoleViewModel,
        NoFilters,
        RoleRow,
        String> {

  final RoleViewModel viewModel;
  final RoleQueryService queryService;
  final DeleteRoleUseCase deleteRoleUseCase;

  public RoleCrudAdapter(
      RoleViewModel viewModel,
      RoleQueryService queryService,
      DeleteRoleUseCase deleteRoleUseCase) {
    this.viewModel = viewModel;
    this.queryService = queryService;
    this.deleteRoleUseCase = deleteRoleUseCase;
  }

  @Override
  public ListingData<RoleRow> search(String searchText, NoFilters filters, Pageable pageable) {
    return queryService.findAll(searchText, filters, pageable);
  }

  @Override
  public void deleteAllById(List<String> selectedIds) {
    deleteRoleUseCase.handle(new DeleteRoleCommand(selectedIds));
  }

  @Override
  public RoleViewModel getView(String id) {
    return viewModel.load(queryService.getById(id).orElseThrow());
  }

  @Override
  public RoleViewModel getEditor(String id) {
    return viewModel.load(queryService.getById(id).orElseThrow());
  }

  @Override
  public RoleViewModel getCreationForm(HttpRequest httpRequest) {
    return viewModel;
  }
}
```

This is a very good separation of concerns:

- queries for reads
- use cases for writes
- Mateu adapter for CRUD lifecycle

---

## 6. Expose the CRUD through an orchestrator

Now wrap everything in a `CrudOrchestrator`.

```java
package com.example.demo.ui.roles;

import io.mateu.core.infra.declarative.CrudOrchestrator;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.NoFilters;
import io.mateu.uidl.interfaces.CrudAdapter;

@Title("Roles")
public class RolesCrudOrchestrator extends CrudOrchestrator<
        RoleViewModel,
        RoleViewModel,
        RoleViewModel,
        NoFilters,
        RoleRow,
        String> {

  final RoleCrudAdapter adapter;

  public RolesCrudOrchestrator(RoleCrudAdapter adapter) {
    this.adapter = adapter;
  }

  @Override
  public CrudAdapter<RoleViewModel, RoleViewModel, RoleViewModel, NoFilters, RoleRow, String> adapter() {
    return adapter;
  }

  @Override
  public String toId(String s) {
    return s;
  }
}
```

At this point, you already have a real CRUD screen.

---

## 7. Add the foreign key suppliers

Now wire the permissions relationship properly.

### Options supplier

```java
package com.example.demo.ui.roles;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.ForeignKeyOptionsSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

public class PermissionIdOptionsSupplier implements ForeignKeyOptionsSupplier {

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
package com.example.demo.ui.roles;

import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LabelSupplier;

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

Now the `permissions` field is not just a list — it is a real backend-resolved relationship.

---

## 8. Add the CRUD to a menu

Now expose the CRUD in the UI.

```java
package com.example.demo.ui;

import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import com.example.demo.ui.roles.RolesCrudOrchestrator;

@UI("/admin")
@Title("Admin")
public class AdminHome {

  @Menu
  AdminMenu admin;
}
```

```java
package com.example.demo.ui;

import io.mateu.uidl.annotations.Menu;
import com.example.demo.ui.roles.RolesCrudOrchestrator;

public class AdminMenu {

  @Menu
  RolesCrudOrchestrator roles;
}
```

That gives you:

- a UI root
- a menu entry
- navigation into the CRUD

---

## 9. Add user feedback

You can return browser feedback directly from backend actions.

For example, if you expose a custom save action:

```java
@Button
public Message notifySave() {
  return new Message("Role saved successfully");
}
```

Mateu will display the notification in the browser without any frontend code.

---

## 10. What this tutorial introduced

In one CRUD, you used:

- `@UI`
- `@Menu`
- `CrudOrchestrator`
- `CrudAdapter`
- Bean Validation
- `@ForeignKey`
- options supplier
- label supplier
- `@Stereotype`
- `Message`

That already covers most of what a real backoffice needs.

---

## 11. Why this structure works well

This pattern fits very well with Spring Boot and layered architectures:

- **Mateu** defines and renders the UI
- **query services** provide read models
- **use cases** handle writes
- **repositories** stay behind the application layer

So you can build a real backoffice without collapsing your architecture into UI code.

---

## 12. Next step

👉 Continue with:

[Compose a shell from multiple services →](/java-user-manual/shell-and-federation-tutorial)
