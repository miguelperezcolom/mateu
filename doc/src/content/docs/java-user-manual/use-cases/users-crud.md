---
title: "Users CRUD with lookups"
---

Build a full CRUD for users, with role assignment via a lookup field, a custom editor page, and Spring dependency injection throughout.

This case adds several real-world patterns on top of the basic CRUD:

- Spring-managed beans for adapter and orchestrator
- `@Lookup` for selecting values from a backend service
- `@Stereotype` to render a multi-select as checkboxes
- A separate editor page with its own route

---

## What this case teaches

- how to use Spring injection in CRUD classes
- how to define a lookup field backed by a backend service
- how to add a custom editor page with `@Route`
- how actions return messages and refresh form state

---

## The pieces

This case has six pieces:

- `User` — the model
- `UserRepository` — the persistence layer
- `UserAdapter` — connects adapter to repository
- `UsersPage` — the CRUD orchestrator
- `UserEditorPage` — a standalone editor bound to the CRUD
- `RoleOptionsSupplier` / `RoleLabelSupplier` — lookup support

---

## 1. The model

```java
public record User(
        @NotEmpty String id,
        @NotEmpty String name,
        @NotEmpty @Email String email,
        @Stereotype(FieldStereotype.checkbox)
        @Lookup(search = RoleOptionsSupplier.class, label = RoleLabelSupplier.class)
        List<String> roles
) implements Identifiable {

    @Override
    public String toString() {
        return name != null ? name : "New user";
    }
}
```

Key points:

- `@Lookup` tells Mateu where to find available options and how to display selected values
- `@Stereotype(checkbox)` renders the field as a checkbox group, not a dropdown
- `List<String>` means the field holds multiple selected IDs

---

## 2. The repository

```java
@Service
public class UserRepository implements CrudRepository<User> {

    private static final Map<String, User> db = new HashMap<>();

    static {
        db.put("1", new User("1", "Miguel", "miguel@example.com", List.of("1", "2")));
        db.put("2", new User("2", "Ana", "ana@example.com", List.of("2")));
    }

    @Override
    public Optional<User> findById(String id) {
        return Optional.ofNullable(db.get(id));
    }

    @Override
    public String save(User entity) {
        db.put(entity.id(), entity);
        return entity.id();
    }

    @Override
    public List<User> findAll() {
        return db.values().stream().toList();
    }

    @Override
    public void deleteAllById(List<String> selectedIds) {
        selectedIds.forEach(db::remove);
    }
}
```

The repository is a `@Service` bean. This allows it to be injected wherever needed.

---

## 3. The adapter

```java
@Service
public class UserAdapter extends AutoCrudAdapter<User> {

    final UserRepository userRepository;

    public UserAdapter(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public CrudRepository<User> repository() {
        return userRepository;
    }
}
```

The adapter is also a `@Service` bean, with the repository injected via constructor.

This is the recommended pattern for real applications: all the pieces are Spring beans, and dependencies flow through constructors.

---

## 4. The orchestrator

```java
@Service
@UI("/users")
public class UsersPage extends AutoCrud<User> {

    final UserAdapter userAdapter;

    public UsersPage(UserAdapter userAdapter) {
        this.userAdapter = userAdapter;
    }

    @Override
    public AutoCrudAdapter<User> simpleAdapter() {
        return userAdapter;
    }
}
```

`UsersPage` is also a `@Service`. The adapter is injected via constructor.

Compare this to the Products example, where both the adapter and repository were plain classes with no injection. In this case, `@Service` is required because the classes hold injected dependencies.

---

## 5. The lookup support

### Options supplier

```java
@Service
public class RoleOptionsSupplier implements LookupOptionsSupplier {

    @Override
    public ListingData<Option> search(
            String fieldName,
            String searchText,
            Pageable pageable,
            HttpRequest httpRequest) {
        return ListingData.of(List.of(
                new Option("1", "Admin"),
                new Option("2", "Editor"),
                new Option("3", "Viewer")
        ));
    }
}
```

`LookupOptionsSupplier` provides the options shown when editing the field. In a real application, you would query a database here.

### Label supplier

```java
@Service
public class RoleLabelSupplier implements LabelSupplier {

    @Override
    public String label(String fieldName, Object id, HttpRequest httpRequest) {
        return switch (String.valueOf(id)) {
            case "1" -> "Admin";
            case "2" -> "Editor";
            case "3" -> "Viewer";
            default -> "?";
        };
    }
}
```

`LabelSupplier` resolves a stored ID to a human-readable label. Mateu calls this when displaying a list row or a read-only form.

---

## 6. The custom editor page

```java
@Service
@Route(value = "/:id/edit", uis = {"/users"})
@Style(StyleConstants.CONTAINER)
@FormLayout(columns = 1)
public class UserEditorPage {

    final UserRepository userRepository;

    public UserEditorPage(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    String id;

    @NotEmpty
    String name;

    @NotEmpty
    @Email
    String email;

    @Lookup(search = RoleOptionsSupplier.class, label = RoleLabelSupplier.class)
    @Stereotype(FieldStereotype.checkbox)
    List<String> roles;

    @Button
    Object save() {
        userRepository.save(new User(id, name, email, roles));
        return List.of(
                new Message("User saved"),
                new State(this)
        );
    }
}
```

Key points:

- `@Route(value = "/:id/edit", uis = {"/users"})` binds this page to the edit action of the `/users` CRUD
- The `:id` segment is populated automatically by Mateu
- `save()` returns both a `Message` (toast notification) and a `State(this)` (refresh the form state)
- The page is a `@Service` bean, so `UserRepository` is injected via constructor

---

## How the pieces connect

```
UsersPage (@UI("/users"))
  └── UserAdapter
        └── UserRepository
              └── User (model)

UserEditorPage (@Route("/:id/edit", uis="/users"))
  └── UserRepository
        └── User (model)
        └── RoleOptionsSupplier (lookup)
        └── RoleLabelSupplier (labels)
```

---

## Mental model

- Use `@Service` whenever a class needs dependency injection
- `@Lookup` = where to find options + how to display them
- `@Stereotype` = how to render the field (checkbox, select, etc.)
- Custom editor pages bind to a CRUD via `@Route(uis = "/route")`
- `save()` returns `List.of(new Message(...), new State(this))` to give feedback and refresh

---

## Next

- [Custom listing](/java-user-manual/use-cases/custom-listing/)
- [Foreign keys and options](/java-user-manual/build/foreign-keys-and-options/)
- [Customizing CRUD and listings](/java-user-manual/build/customizing-crud-and-listings/)
