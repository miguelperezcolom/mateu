---
title: "Domain models"
weight: 4
aliases:
  - /java-user-manual/working-with-domain/
---

# Working with domain models

Mateu is the UI layer. It sits on top of your backend.

It does not replace your domain model, your repositories, or your application services. It connects to them.

---

## The architecture

Mateu is designed to fit naturally into hexagonal (ports & adapters) or layered architectures.

```
┌─────────────────────────────────┐
│  UI layer (Mateu)               │
│  ViewModels, orchestrators      │
├─────────────────────────────────┤
│  Application layer              │
│  Use cases, application services│
├─────────────────────────────────┤
│  Domain layer                   │
│  Entities, aggregates, rules    │
├─────────────────────────────────┤
│  Infrastructure layer           │
│  Repositories, adapters, DBs    │
└─────────────────────────────────┘
```

The UI layer calls the application layer.  
The application layer calls the domain.  
The domain knows nothing about the UI.

---

## ViewModel vs Domain model

These are not the same thing, and they should not be the same class.

| Concern | Domain model | ViewModel |
|---------|-------------|-----------|
| Purpose | Business rules | UI representation |
| Annotations | Business logic | UI behavior |
| Where it lives | Domain layer | UI layer |
| What it knows about | The business | The screen |

The ViewModel is the source of truth for **what the screen shows**.  
The domain model is the source of truth for **what the business means**.

---

## The recommended flow

```
HTTP request
    → Mateu hydrates ViewModel from URL params
    → ViewModel calls application service
    → Application service calls domain
    → Domain applies business rules
    → Result maps back to ViewModel
    → Mateu renders the UI
```

For an action (button click):

```
User triggers action
    → ViewModel method is called
    → ViewModel calls application service or repository
    → Service applies logic
    → ViewModel updates its state
    → Mateu re-renders
```

---

## Injecting repositories into ViewModels

Because Mateu ViewModels are Spring beans (when annotated with `@Service`), you can inject any Spring component directly.

### Example: CRUD with injected repository

```java
@Service
@UI("/users")
public class UsersPage extends AutoCrudOrchestrator<User> {

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

```java
@Service
public class UserRepository implements CrudRepository<User> {
    // connects to your actual persistence layer
}
```

The UI layer only knows about `UserAdapter`.  
`UserAdapter` knows about `UserRepository`.  
`UserRepository` knows about the database.

---

## Injecting services into form pages

The same pattern applies to form pages with actions:

```java
@Service
@Route(value = "/:id/edit", uis = {"/users"})
@FormLayout(columns = 1)
public class UserEditorPage {

    final UserRepository userRepository;

    public UserEditorPage(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    String id;
    String name;
    String email;
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

The `save()` method delegates to `userRepository`. The ViewModel does not contain business logic — it orchestrates the call and returns UI effects.

---

## Mapping: DTO to ViewModel

In practice, your backend returns DTOs or domain objects, and your ViewModel needs to display them.

The mapping is explicit and lives in the ViewModel or a dedicated mapper:

```java
@Button
Object load() {
    var dto = userService.findById(id);
    this.name = dto.getName();
    this.email = dto.getEmail();
    this.roles = dto.getRoleIds();
    return new State(this);
}
```

Or in a hydration step, if the ViewModel receives the id as a route parameter and loads data on hydration.

---

## When NOT to use Spring beans

If a class does not need injection — no repositories, no services — it does not need to be a Spring bean.

```java
// Simple record: no injection needed
public record Product(
        String id,
        String name,
        ProductStatus status
) implements Identifiable {}

// Plain class: no injection needed
class ProductRepository implements CrudRepository<Product> {
    private static final Map<String, Product> db = new HashMap<>();
    // ...
}
```

Use `@Service` only when the class needs dependencies injected. Otherwise keep it simple.

---

## Mental model

- Mateu is the UI layer — it calls your backend, not the other way around
- ViewModels are not domain models
- Spring injection works naturally: annotate with `@Service`, inject via constructor
- Mapping between DTO and ViewModel is explicit, in the UI layer
- Business logic belongs in the domain, not in the ViewModel

---

## Next

- [Foreign keys and options](/java-user-manual/build/foreign-keys-and-options/)
- [Users CRUD with lookups](/java-user-manual/use-cases/users-crud/)
- [Customizing CRUD and listings](/java-user-manual/build/customizing-crud-and-listings/)
