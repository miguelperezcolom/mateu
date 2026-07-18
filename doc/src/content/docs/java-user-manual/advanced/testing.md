---
title: "Testing"
---

Mateu ViewModels are plain Java objects. Actions are regular methods. This means you can test the entire business logic of a page with no framework setup, no browser, and no mocks of UI infrastructure.

**Prerequisite:** prefer constructor injection in your ViewModels and Spring beans. It makes tests straightforward — pass real or fake collaborators directly, without a Spring context.

---

## Unit testing actions

Instantiate the ViewModel, set its fields, call the action method, and assert on the result:

```java
@Test
void greet_returns_message_with_name() {
    var home = new Home();
    home.name = "Alice";
    var result = home.greet();
    assertThat(result).isInstanceOf(Message.class);
    assertThat(((Message) result).text()).isEqualTo("Hello Alice");
}
```

Because actions are regular Java methods, this is as simple as testing any other class.

---

## Testing state mutations

When an action mutates ViewModel fields and returns `State(this)`, assert on both the return value and the field values after the call:

```java
@Test
void save_updates_user_and_returns_message_and_state() {
    var repo = new InMemoryUserRepository();
    var page = new UserEditorPage(repo);
    page.id = "42";
    page.name = "Bob";
    page.email = "bob@example.com";
    page.roles = List.of("1");

    var result = page.save();

    assertThat(result).isInstanceOf(List.class);
    var effects = (List<?>) result;
    assertThat(effects).hasSize(2);
    assertThat(effects.get(0)).isInstanceOf(Message.class);
    assertThat(effects.get(1)).isInstanceOf(State.class);

    var saved = repo.findById("42");
    assertThat(saved).isPresent();
    assertThat(saved.get().name()).isEqualTo("Bob");
}
```

---

## Testing with injected dependencies

Pass collaborators directly via the constructor. No Spring context needed:

```java
@Test
void usersPage_lists_all_users() {
    var repo = new UserRepository();     // plain class, no Spring
    var page = new UsersPage(repo);

    var result = page.store().findAll();
    assertThat(result).isNotEmpty();
}
```

Use an in-memory implementation for the repository or any other port. This keeps tests fast and deterministic.

---

## Testing CRUD repositories

Test the repository in isolation to verify persistence logic independently of the UI:

```java
@Test
void save_and_find_by_id() {
    var repo = new UserRepository();
    repo.save(new User("1", "Alice", "alice@example.com", List.of("1")));

    var found = repo.findById("1");

    assertThat(found).isPresent();
    assertThat(found.get().name()).isEqualTo("Alice");
}

@Test
void delete_removes_entity() {
    var repo = new UserRepository();
    repo.save(new User("1", "Alice", "alice@example.com", List.of()));

    repo.deleteAllById(List.of("1"));

    assertThat(repo.findById("1")).isEmpty();
}
```

---

## Testing listings

For `Listing<Filters, Row>` classes, call `search()` directly:

```java
@Test
void search_returns_change_rows() {
    var queryService = new ChangeQueryService();
    var form = new CreateReleaseForm();
    var changes = new Changes(queryService, form);

    var result = changes.search("", new NoFilters(), Pageable.unpaged(), fakeRequest());

    assertThat(result.page().content()).isNotEmpty();
    assertThat(result.page().content().get(0)).isInstanceOf(ChangeRow.class);
}
```

---

## Testing actions with authorization headers

When an action reads from the `HttpRequest` (e.g. the `Authorization` header for the current user), pass a stub request:

```java
@Test
void save_reads_user_from_auth_header() {
    var httpRequest = StubHttpRequest.withHeader("X-User-Id", "user-42");
    var page = new OrderEditorPage(new InMemoryOrderRepository());
    page.customerId = "customer-1";

    var result = page.handleAction("save", httpRequest);

    assertThat(result).isInstanceOf(Message.class);
}
```

Define `StubHttpRequest` as a simple test double that implements `HttpRequest` and returns configured header values.

---

## Integration tests with Spring Boot

For full context validation, use `@SpringBootTest`:

```java
@SpringBootTest
class DemoAdminPanelApplicationTests {

    @Test
    void contextLoads() {
        // verifies the Spring context starts without errors
    }
}
```

This catches wiring errors (missing beans, circular dependencies, misconfigured properties) without requiring a browser.

---

## What to test

| Focus | Why |
|---|---|
| Actions | Verify return values and side effects |
| State transitions | Field values after an action runs |
| Repository logic | Save, find, delete independently |
| Business rules | Logic inside the ViewModel or service layer |

Mateu generates the UI from your model. You do not need to test what Mateu generates.

---

## What not to test

- The generated forms and listings — Mateu handles this
- Routing — covered by integration tests
- UI rendering — no Mateu-specific test API required

---

## Mental model

- ViewModels are plain Java — unit tests work with no ceremony
- Use constructor injection — test with real or fake collaborators, no mocks needed
- Test actions as regular methods — assert return values and state
- Use `@SpringBootTest` for integration tests — catches wiring errors

---

## Next

- [State, actions and fields](/java-user-manual/concepts/state-actions-and-fields/) — understand what actions can return
- [Security](/java-user-manual/advanced/security/) — test pages that read authorization headers
- [Real-world patterns](/java-user-manual/real-world/) — how testing fits in hexagonal and microservices architectures
